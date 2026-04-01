const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const items = [
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-01.jpg",
    date: "2026.01.17",
    title: "매장 계약 완료",
    desc: "경기도 안성시 공도읍 진건중길 4 매장 계약을 완료했습니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-02.jpg",
    date: "2026.01.17",
    title: "매장 내부 현황",
    desc: "계약 당시 매장 내부 모습입니다. 약 49평의 넓은 공간입니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-03.jpg",
    date: "2026.03.17",
    title: "내부 천장 작업 시작",
    desc: "내부 천장 철골 구조물 설치 작업이 시작되었습니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-05.jpg",
    date: "2026.03.17",
    title: "외부 셔터 설치",
    desc: "매장 보안을 위한 셔터 설치가 완료되었습니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-06.jpg",
    date: "2026.03.22",
    title: "외부 전면 공사 진행",
    desc: "매장 전면부 외장 공사가 본격적으로 진행되고 있습니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-07.jpg",
    date: "2026.03.22",
    title: "내부 인테리어 공사",
    desc: "천장 마감 및 벽체 인테리어 작업이 한창 진행 중입니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-09.jpg",
    date: "2026.03.24",
    title: "COMING SOON 현수막 설치",
    desc: "한국금거래소 안성공도점 오픈을 알리는 현수막이 설치되었습니다.",
  },
  {
    img: "http://anseonggold.co.kr/wp-content/themes/anseonggold-theme/assets/images/progress-10.jpg",
    date: "2026.03.28",
    title: "외부 간판 구조물 설치",
    desc: "매장 외부 간판 및 사인물 구조물 설치가 진행되고 있습니다.",
  },
];

// 타임라인 HTML 생성
let contentHtml = `<p>한국금거래소 안성공도점의 인테리어 공사가 순조롭게 진행되고 있습니다. 2026년 4월 24일 그랜드 오픈을 앞두고, 매장 계약부터 현재까지의 공사 과정을 사진과 함께 정리했습니다.</p>\n\n`;

for (const item of items) {
  contentHtml += `<h2>${item.date} - ${item.title}</h2>\n`;
  contentHtml += `<p>${item.desc}</p>\n`;
  contentHtml += `<img src="${item.img}" alt="${item.title}" style="width:100%;border-radius:8px;margin-bottom:2em;" />\n\n`;
}

contentHtml += `<h2>향후 일정</h2>
<ul>
<li><strong>4월 첫째 주:</strong> 내부 마감 완료</li>
<li><strong>4월 둘째 주:</strong> 장비·집기 설치</li>
<li><strong>4월 셋째 주:</strong> 최종 점검 및 시운영</li>
<li><strong>4월 24일:</strong> 그랜드 오픈!</li>
</ul>
<p><strong>📞 문의: 010-2645-3745</strong></p>`;

async function main() {
  // 기존 인테리어 공사 현황 글 업데이트 (id: 9)
  const { data, error } = await db
    .from("posts")
    .update({
      title: "안성공도점 인테리어 공사 전체 현황 (사진 포함)",
      slug: "store-construction-full-progress",
      content: contentHtml,
      excerpt: "매장 계약부터 간판 설치까지, 한국금거래소 안성공도점 인테리어 공사 전 과정을 사진과 함께 공개합니다.",
      thumbnail_url: items[items.length - 1].img,
      tags: ["인테리어", "공사현황", "안성공도점", "매장소식"],
      published: true,
    })
    .eq("id", 9)
    .select("id, title")
    .single();

  if (error) {
    console.error("❌ 업데이트 실패:", error.message);
  } else {
    console.log("✅ 업데이트 완료:", data.title);
  }
}

main();
