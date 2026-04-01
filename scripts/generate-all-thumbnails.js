const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OPENAI_KEY = process.env.OPENAI_API_KEY;

const categoryStyles = {
  1: "luxurious gold bars stacked, financial market charts in background, dark elegant atmosphere with golden lighting, professional photography",
  2: "precious metals collection, gold rings and necklaces, gemstones, magnifying glass, professional product photography on dark velvet",
  3: "modern luxury gold exchange store interior, elegant retail space with display cases, warm golden ambient lighting",
  4: "celebration scene, gold confetti, luxury gift boxes with golden ribbons, festive premium atmosphere, dark background",
};

const posts = [
  { id: 2, title: "2026년 4월 금 시세 전망", catId: 1, prompt: "Gold price chart trending upward, gold bars and coins, stock market display, dark luxurious background with golden glow" },
  { id: 3, title: "금값 vs 주식 vs 부동산", catId: 1, prompt: "Three investment symbols side by side: gold bars, stock chart on screen, miniature house, comparison concept, dark elegant background" },
  { id: 5, title: "순금 24K 18K 14K 차이점", catId: 2, prompt: "Three gold items showing different purities - pure gold bar, 18K gold ring, 14K gold necklace, arranged on dark velvet with labels" },
  { id: 6, title: "금 감정 방법", catId: 2, prompt: "Gold appraisal scene, XRF analyzer testing gold jewelry, magnifying glass, touchstone, professional gold inspection tools on dark surface" },
  { id: 7, title: "금 보관 방법", catId: 2, prompt: "Luxury safe open showing gold bars inside, velvet-lined jewelry box with gold pieces, security concept, dark moody lighting" },
  { id: 8, title: "안성공도점 그랜드 오픈", catId: 3, prompt: "Grand opening of a luxury gold exchange store, red ribbon cutting ceremony, golden balloons, elegant storefront, celebratory atmosphere" },
  { id: 10, title: "오시는 길 주차 안내", catId: 3, prompt: "Modern luxury store exterior with parking area, navigation pin icon, road leading to an elegant gold shop, aerial view style" },
  { id: 11, title: "오픈 이벤트 수수료 0%", catId: 4, prompt: "Grand opening event banner concept, gold bars with ZERO percent sign, celebration confetti, premium dark and gold color scheme" },
  { id: 12, title: "SNS 후기 이벤트", catId: 4, prompt: "Social media review event concept, smartphone showing gold store review, gold bar prize, Instagram and blog icons, premium dark theme" },
];

async function generateImage(prompt) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Professional blog thumbnail. ${prompt}. Clean composition, no text or letters in the image, 16:9 ratio.`,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `API ${res.status}`);
  }

  const data = await res.json();
  return data.data[0].url;
}

async function uploadToSupabase(imageUrl, postId) {
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const fileName = `blog/thumb-post-${postId}.png`;

  await db.storage.from("images").remove([fileName]);

  const { error } = await db.storage
    .from("images")
    .upload(fileName, buffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(error.message);

  const { data } = db.storage.from("images").getPublicUrl(fileName);
  return data.publicUrl;
}

async function main() {
  console.log(`🎨 ${posts.length}개 글에 AI 이미지 생성을 시작합니다...\n`);

  for (const post of posts) {
    try {
      console.log(`[${post.id}] "${post.title}" 이미지 생성 중...`);

      const dalleUrl = await generateImage(post.prompt);
      console.log(`  📥 Supabase에 업로드 중...`);

      const publicUrl = await uploadToSupabase(dalleUrl, post.id);

      await db
        .from("posts")
        .update({ thumbnail_url: publicUrl })
        .eq("id", post.id);

      console.log(`  ✅ 완료!`);

      // API rate limit 방지 (1분에 5장 제한)
      if (posts.indexOf(post) < posts.length - 1) {
        console.log(`  ⏳ 15초 대기...\n`);
        await new Promise((r) => setTimeout(r, 15000));
      }
    } catch (e) {
      console.error(`  ❌ 실패: ${e.message}\n`);
    }
  }

  console.log("\n🎉 모든 이미지 생성 완료!");
}

main();
