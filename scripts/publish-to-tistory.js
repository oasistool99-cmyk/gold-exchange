/**
 * 한국금거래소 안성공도점 - Tistory 자동 발행 스크립트 (Puppeteer)
 *
 * Tistory Open API가 종료되어 Puppeteer로 브라우저 자동화 방식으로 발행합니다.
 * Supabase에서 published 글을 가져와 아직 Tistory에 발행하지 않은 글만 발행합니다.
 *
 * 사전 준비:
 * 1. npm install puppeteer dotenv @supabase/supabase-js 실행
 * 2. .env.local 파일에 아래 항목 설정:
 *    TISTORY_ID=카카오 계정 (전화번호 또는 이메일)
 *    TISTORY_PW=카카오 계정 비밀번호
 *    TISTORY_BLOG=블로그명 (예: creator92113)
 *
 * 실행:
 *   node scripts/publish-to-tistory.js          # Supabase에서 미발행 글 자동 발행
 *   node scripts/publish-to-tistory.js --all     # Supabase의 모든 published 글 발행
 *   node scripts/publish-to-tistory.js --id 5    # 특정 글(id=5)만 발행
 *
 * 첫 실행:
 * - 브라우저가 열리고 카카오 로그인 후 카카오톡 인증이 필요합니다
 * - 인증 완료 후 쿠키가 저장되어 다음부터는 자동 로그인됩니다
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const TISTORY_ID = process.env.TISTORY_ID;
const TISTORY_PW = process.env.TISTORY_PW;
const TISTORY_BLOG = process.env.TISTORY_BLOG || "creator92113";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PUBLISHED_LOG = path.join(__dirname, "tistory-published.json");
const COOKIES_PATH = path.join(__dirname, "tistory-cookies.json");

// ── 발행 기록 관리 ─────────────────────────────────────────────────
function loadPublishedLog() {
  try {
    return JSON.parse(fs.readFileSync(PUBLISHED_LOG, "utf-8"));
  } catch {
    return {};
  }
}

function savePublishedLog(log) {
  fs.writeFileSync(PUBLISHED_LOG, JSON.stringify(log, null, 2), "utf-8");
}

// ── 쿠키 관리 ─────────────────────────────────────────────────────
async function saveCookies(page) {
  try {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2), "utf-8");
    console.log("   🍪 쿠키 저장 완료");
  } catch (e) {
    console.log("   ⚠️  쿠키 저장 실패 (다음 실행 시 다시 로그인 필요)");
  }
}

async function loadCookies(page) {
  try {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf-8"));
    await page.setCookie(...cookies);
    console.log("   🍪 저장된 쿠키 로드 완료");
    return true;
  } catch {
    return false;
  }
}

// ── 로그인 상태 확인 ───────────────────────────────────────────────
async function isLoggedIn(page) {
  await page.goto(`https://${TISTORY_BLOG}.tistory.com/manage`, {
    waitUntil: "networkidle2",
    timeout: 15000,
  });
  const url = page.url();
  return url.includes("/manage") && !url.includes("login");
}

// ── Supabase에서 글 가져오기 ───────────────────────────────────────
async function fetchPostsFromSupabase(options) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const publishedLog = loadPublishedLog();

  let query = supabase
    .from("posts")
    .select("id, title, content, tags, slug, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (options.id) {
    query = query.eq("id", options.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Supabase 조회 실패:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("📭 발행할 글이 없습니다.");
    process.exit(0);
  }

  if (!options.all && !options.id) {
    const filtered = data.filter((post) => !publishedLog[post.id]);
    if (filtered.length === 0) {
      console.log("✅ 모든 글이 이미 Tistory에 발행되었습니다.");
      console.log(`   총 ${data.length}개 글 중 ${Object.keys(publishedLog).length}개 발행 완료`);
      process.exit(0);
    }
    return filtered;
  }

  return data;
}

// ── 카카오 로그인 ──────────────────────────────────────────────────
async function loginToTistory(page) {
  console.log("🔐 Tistory 로그인 중...");

  // 1단계: 저장된 쿠키로 로그인 시도
  const hasCookies = await loadCookies(page);
  if (hasCookies) {
    console.log("   저장된 쿠키로 로그인 확인 중...");
    const loggedIn = await isLoggedIn(page);
    if (loggedIn) {
      console.log("✅ 쿠키로 자동 로그인 성공!");
      return true;
    }
    console.log("   쿠키 만료됨. 다시 로그인합니다.");
  }

  // 2단계: 카카오 로그인 페이지로 이동
  await page.goto("https://www.tistory.com/auth/login", {
    waitUntil: "networkidle2",
    timeout: 15000,
  });
  await new Promise((r) => setTimeout(r, 2000));

  // 카카오 버튼 클릭
  const kakaoBtn = await page.$(".link_kakao_id");
  if (kakaoBtn) {
    console.log("   카카오 버튼 클릭...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {}),
      page.evaluate(() => document.querySelector(".link_kakao_id").click()),
    ]);
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 카카오 로그인 페이지로 이동하지 않았다면 직접 이동
  if (!page.url().includes("accounts.kakao.com")) {
    console.log("   카카오 로그인 페이지로 직접 이동...");
    await page.goto(
      "https://accounts.kakao.com/login?continue=https%3A%2F%2Fwww.tistory.com%2Fauth%2Flogin%2Fredirect&lang=ko",
      { waitUntil: "networkidle2", timeout: 15000 }
    );
  }

  await new Promise((r) => setTimeout(r, 2000));
  console.log("   카카오 로그인 페이지 도착:", page.url().substring(0, 60) + "...");

  // 3단계: 카카오 로그인 폼 입력
  const idInput =
    (await page.$('input[name="loginId"]')) ||
    (await page.$("#loginId"));
  const pwInput =
    (await page.$('input[name="password"]')) ||
    (await page.$("#password")) ||
    (await page.$('input[type="password"]'));

  if (idInput && pwInput) {
    console.log("   아이디/비밀번호 입력 중...");
    await idInput.click({ clickCount: 3 });
    await idInput.type(TISTORY_ID, { delay: 50 });
    await pwInput.click({ clickCount: 3 });
    await pwInput.type(TISTORY_PW, { delay: 50 });

    // 로그인 버튼 클릭
    const loginBtn =
      (await page.$('button[type="submit"]')) ||
      (await page.$("button.btn_confirm"));
    if (loginBtn) await loginBtn.click();

    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3000));
  } else {
    console.log("   ⚠️  로그인 폼을 찾지 못했습니다.");
  }

  // 4단계: 로그인 결과 확인
  const afterLoginUrl = page.url();
  if (afterLoginUrl.includes("tistory.com") && !afterLoginUrl.includes("login") && !afterLoginUrl.includes("accounts.kakao")) {
    console.log("✅ 로그인 성공!");
    await saveCookies(page);
    return true;
  }

  // 5단계: 카카오톡 2단계 인증 대기
  console.log("");
  console.log("  ┌───────────────────────────────────────────────────┐");
  console.log("  │  📱 카카오톡에서 로그인 인증을 해주세요!            │");
  console.log("  │  카카오톡 앱에 알림이 왔을 겁니다.                 │");
  console.log("  │  인증 완료 후 자동으로 진행됩니다. (최대 120초)      │");
  console.log("  └───────────────────────────────────────────────────┘");
  console.log("");

  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const url = page.url();
      if (url.includes("tistory.com") && !url.includes("login") && !url.includes("accounts.kakao")) {
        console.log("\n✅ 로그인 성공!");
        await saveCookies(page);
        return true;
      }
    } catch {
      // 페이지 리다이렉트 중일 수 있음, 잠시 대기
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const url = page.url();
        if (url.includes("tistory.com") && !url.includes("login")) {
          console.log("\n✅ 로그인 성공!");
          await saveCookies(page);
          return true;
        }
      } catch {}
    }
    process.stdout.write(`   대기 중... ${(i + 1) * 5}초\r`);
  }

  // 마지막 확인: manage 페이지 직접 이동
  console.log("\n   최종 확인 중...");
  try {
    const finalCheck = await isLoggedIn(page);
    if (finalCheck) {
      console.log("✅ 로그인 확인됨!");
      await saveCookies(page);
      return true;
    }
  } catch {}

  throw new Error("로그인 실패. 카카오 계정 정보를 확인하거나 브라우저에서 직접 로그인해주세요.");
}

// ── 글 발행 ────────────────────────────────────────────────────────
async function publishPost(page, post) {
  const writeUrl = `https://${TISTORY_BLOG}.tistory.com/manage/newpost`;
  console.log(`\n📝 글 발행 중: "${post.title}" (id: ${post.id})`);
  console.log(`   URL: ${writeUrl}`);

  await page.goto(writeUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // 제목 입력
  const titleSelector = '#post-title-inp, input[name="title"], .tit_post input';
  await page.waitForSelector(titleSelector, { timeout: 10000 });
  await page.click(titleSelector);
  await page.type(titleSelector, post.title, { delay: 30 });

  // HTML 모드 전환
  const htmlModeBtn = await page.$('.btn_html, button[data-mode="html"], #mceu_16');
  if (htmlModeBtn) {
    await htmlModeBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 원본 글 링크를 본문 하단에 추가
  const contentWithLink = post.content +
    `\n<p><br></p><p>원문: <a href="https://goldo-hazel.vercel.app/posts/${post.slug}">한국금거래소 안성공도점 블로그</a></p>`;

  // 본문 영역에 HTML 삽입
  const editorFrame = await page.$("iframe#cke_contents_content");
  if (editorFrame) {
    const frame = await editorFrame.contentFrame();
    await frame.evaluate((html) => {
      document.body.innerHTML = html;
    }, contentWithLink);
  } else {
    const textarea = await page.$(
      'textarea.CodeMirror-code, textarea#content, .mce-edit-area textarea, div[contenteditable="true"]'
    );
    if (textarea) {
      await page.evaluate(
        (el, html) => {
          if (el.tagName === "TEXTAREA") el.value = html;
          else el.innerHTML = html;
        },
        textarea,
        contentWithLink
      );
    } else {
      await page.evaluate((html) => {
        if (window.tinymce && tinymce.activeEditor) {
          tinymce.activeEditor.setContent(html);
        } else if (document.querySelector('div[contenteditable="true"]')) {
          document.querySelector('div[contenteditable="true"]').innerHTML = html;
        }
      }, contentWithLink);
    }
  }

  console.log("   ✅ 제목/본문 입력 완료");

  // 태그 입력
  if (post.tags && post.tags.length > 0) {
    const tagInput = await page.$('#tagText, input[name="tag"], .inp_tag');
    if (tagInput) {
      for (const tag of post.tags) {
        await tagInput.type(tag, { delay: 30 });
        await page.keyboard.press("Enter");
        await new Promise((r) => setTimeout(r, 300));
      }
      console.log(`   ✅ 태그 입력: ${post.tags.join(", ")}`);
    }
  }

  // 공개 설정
  const publicRadio = await page.$(
    'input[name="visibility"][value="3"], input[name="visibility"][value="20"]'
  );
  if (publicRadio) await publicRadio.click();

  // 발행 버튼 클릭
  const publishBtn = await page.$(
    '#publish-layer-btn, button.btn_publish, .btn_save, button[data-action="publish"]'
  );
  if (publishBtn) {
    try {
      await publishBtn.click();
      await new Promise((r) => setTimeout(r, 2000));

      const confirmBtn = await page.$(".btn_ok, .btn_confirm, button.confirm");
      if (confirmBtn) await confirmBtn.click();
    } catch {
      // 발행 버튼 클릭으로 페이지 이동이 발생할 수 있음
    }

    // 발행 후 페이지 이동 대기
    await new Promise((r) => setTimeout(r, 5000));
    console.log("   ✅ 발행 완료!");
    return true;
  } else {
    console.log("   ⚠️  발행 버튼을 찾지 못했습니다. 수동 발행이 필요합니다.");
    return false;
  }
}

// ── CLI 인자 파싱 ──────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { all: false, id: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--all") options.all = true;
    if (args[i] === "--id" && args[i + 1]) options.id = parseInt(args[i + 1]);
  }
  return options;
}

// ── 메인 실행 ──────────────────────────────────────────────────────
async function main() {
  if (!TISTORY_ID || !TISTORY_PW) {
    console.error("❌ .env.local에 TISTORY_ID, TISTORY_PW를 설정해주세요.");
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.");
    process.exit(1);
  }

  const options = parseArgs();

  console.log("📦 Supabase에서 글 가져오는 중...");
  const posts = await fetchPostsFromSupabase(options);
  console.log(`   ${posts.length}개 글을 발행합니다.\n`);

  console.log("🚀 Tistory 자동 발행 시작");
  console.log(`   블로그: ${TISTORY_BLOG}.tistory.com\n`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 900 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const publishedLog = loadPublishedLog();
  let successCount = 0;

  try {
    await loginToTistory(page);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\n── [${i + 1}/${posts.length}] ──`);

      const success = await publishPost(page, post);

      if (success) {
        publishedLog[post.id] = {
          title: post.title,
          publishedAt: new Date().toISOString(),
        };
        savePublishedLog(publishedLog);
        successCount++;
      }

      if (i < posts.length - 1) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    console.log(`\n🎉 발행 완료! (성공: ${successCount}/${posts.length})`);
  } catch (err) {
    console.error("\n❌ 오류 발생:", err.message);
    console.log(`   중간 저장: ${successCount}개 발행 완료`);
    console.log("   브라우저를 열어둘테니 상태를 확인해주세요.");
    await new Promise((r) => setTimeout(r, 60000));
  } finally {
    await browser.close();
  }
}

main();
