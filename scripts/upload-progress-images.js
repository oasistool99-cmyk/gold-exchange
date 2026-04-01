const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const images = [
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-01.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-02.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-03.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-05.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-06.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-07.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-09.jpg",
  "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-10.jpg",
];

const items = [
  { date: "2026.01.17", title: "매장 계약 완료", desc: "경기도 안성시 공도읍 진건중길 4 매장 계약을 완료했습니다." },
  { date: "2026.01.17", title: "매장 내부 현황", desc: "계약 당시 매장 내부 모습입니다. 약 49평의 넓은 공간입니다." },
  { date: "2026.03.17", title: "내부 천장 작업 시작", desc: "내부 천장 철골 구조물 설치 작업이 시작되었습니다." },
  { date: "2026.03.17", title: "외부 셔터 설치", desc: "매장 보안을 위한 셔터 설치가 완료되었습니다." },
  { date: "2026.03.22", title: "외부 전면 공사 진행", desc: "매장 전면부 외장 공사가 본격적으로 진행되고 있습니다." },
  { date: "2026.03.22", title: "내부 인테리어 공사", desc: "천장 마감 및 벽체 인테리어 작업이 한창 진행 중입니다." },
  { date: "2026.03.24", title: "COMING SOON 현수막 설치", desc: "한국금거래소 안성공도점 오픈을 알리는 현수막이 설치되었습니다." },
  { date: "2026.03.28", title: "외부 간판 구조물 설치", desc: "매장 외부 간판 및 사인물 구조물 설치가 진행되고 있습니다." },
];

async function main() {
  const uploadedUrls = [];

  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const fileName = `blog/progress-${String(i + 1).padStart(2, "0")}.jpg`;

    console.log(`📥 다운로드 중: ${items[i].title}...`);

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());

    // 기존 파일 삭제 후 업로드
    await db.storage.from("images").remove([fileName]);

    const { error } = await db.storage
      .from("images")
      .upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      console.error(`  ❌ 업로드 실패: ${error.message}`);
      uploadedUrls.push(url); // 실패 시 원본 URL 사용
    } else {
      const { data: urlData } = db.storage.from("images").getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
      console.log(`  ✅ 업로드 완료`);
    }
  }

  // 블로그 글 본문 생성
  let contentHtml = `<p>한국금거래소 안성공도점의 인테리어 공사가 순조롭게 진행되고 있습니다. 2026년 4월 24일 그랜드 오픈을 앞두고, 매장 계약부터 현재까지의 공사 과정을 사진과 함께 정리했습니다.</p>\n\n`;

  for (let i = 0; i < items.length; i++) {
    contentHtml += `<h2>${items[i].date} - ${items[i].title}</h2>\n`;
    contentHtml += `<p>${items[i].desc}</p>\n`;
    contentHtml += `<img src="${uploadedUrls[i]}" alt="${items[i].title}" style="width:100%;border-radius:8px;margin-bottom:2em;" />\n\n`;
  }

  contentHtml += `<h2>향후 일정</h2>
<ul>
<li><strong>4월 첫째 주:</strong> 내부 마감 완료</li>
<li><strong>4월 둘째 주:</strong> 장비·집기 설치</li>
<li><strong>4월 셋째 주:</strong> 최종 점검 및 시운영</li>
<li><strong>4월 24일:</strong> 그랜드 오픈!</li>
</ul>
<p><strong>📞 문의: 010-2645-3745</strong></p>`;

  // DB 업데이트
  const { error } = await db
    .from("posts")
    .update({
      content: contentHtml,
      thumbnail_url: uploadedUrls[uploadedUrls.length - 1],
    })
    .eq("id", 9);

  if (error) {
    console.error("❌ DB 업데이트 실패:", error.message);
  } else {
    console.log("\n✅ 블로그 글 업데이트 완료! 이미지가 Supabase Storage에서 로드됩니다.");
  }
}

main();
