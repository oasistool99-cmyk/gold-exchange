const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json'), 'utf8'));
const token = JSON.parse(fs.readFileSync(path.join(__dirname, 'blogger-token.json'), 'utf8'));
const themeXml = fs.readFileSync(path.join(__dirname, 'blogger-theme.xml'), 'utf8');

const BLOG_ID = '8301590145021596644';

const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

oauth2Client.setCredentials(token);

// Refresh token if expired
oauth2Client.on('tokens', (newTokens) => {
  const updated = { ...token, ...newTokens };
  fs.writeFileSync(path.join(__dirname, 'blogger-token.json'), JSON.stringify(updated, null, 2));
  console.log('Token refreshed and saved.');
});

async function updateTheme() {
  try {
    // Blogger API doesn't have a direct theme update endpoint,
    // so we use the raw HTTP request approach
    const accessToken = (await oauth2Client.getAccessToken()).token;

    const response = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      throw new Error(`Blog info failed: ${response.status} ${await response.text()}`);
    }

    const blogInfo = await response.json();
    console.log(`Blog: ${blogInfo.name}`);
    console.log(`URL: ${blogInfo.url}`);

    // Update theme via Blogger v3 API
    const themeResponse = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/pages`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // The Blogger API v3 doesn't support direct theme/template updates.
    // We need to use the legacy API or a different approach.
    // Let's try the Blogger template API endpoint
    const templateResponse = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}?fetchBodies=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customMetaData: themeXml.substring(0, 100) // test
        })
      }
    );

    console.log('\nBlogger API v3 does not support direct theme XML upload.');
    console.log('Alternative: Using Blogger Settings API...\n');

    // Alternative approach: use googleapis blogger module
    const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

    // Get blog info to confirm connection
    const blog = await blogger.blogs.get({ blogId: BLOG_ID });
    console.log('Connected to blog:', blog.data.name);

    // Unfortunately Blogger API v3 does not support template/theme updates.
    // The theme must be updated manually or via the legacy GData API.
    // Let's try the legacy approach.

    console.log('\n--- Attempting legacy template update ---');

    const legacyResponse = await fetch(
      `https://www.blogger.com/feeds/${BLOG_ID}/template`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/atom+xml'
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <id>tag:blogger.com,1999:blog-${BLOG_ID}.template</id>
  <content type="text">${themeXml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>
</entry>`
      }
    );

    if (legacyResponse.ok) {
      console.log('Theme updated successfully!');
    } else {
      const errorText = await legacyResponse.text();
      console.log(`Legacy API response: ${legacyResponse.status}`);
      console.log('Response:', errorText.substring(0, 500));
      console.log('\n========================================');
      console.log('Blogger API does not support remote theme updates.');
      console.log('Please update manually:');
      console.log('1. Go to https://www.blogger.com/blog/theme/8301590145021596644');
      console.log('2. Click the arrow next to "Customize" > "Edit HTML"');
      console.log('3. Select all (Ctrl+A), paste theme (Ctrl+V), save');
      console.log('========================================');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

updateTheme();
