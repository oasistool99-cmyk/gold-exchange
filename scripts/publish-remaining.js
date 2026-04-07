const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const BLOG_ID = "8301590145021596644";
const TOKEN_PATH = path.join(__dirname, "blogger-token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

const remainingPosts = [
  {
    title: "금 보관 방법 - 실물 금을 안전하게 보관하는 법",
    labels: ["금보관", "골드바", "금주얼리", "안전보관"],
    content: `<p>실물 금을 매입했다면 안전한 보관이 중요합니다. 잘못된 보관은 변색이나 스크래치, 심지어 도난의 위험까지 있습니다.</p>
<h2>골드바 보관법</h2>
<p>투자용 골드바는 개봉하지 않는 것이 기본입니다. 밀봉된 상태 그대로 보관하면 순도 보증서와 함께 재매도할 때 감정 절차가 간소화됩니다.</p>
<ul><li>서늘하고 건조한 곳에 보관</li><li>직사광선 피하기</li><li>밀봉 포장 그대로 유지</li></ul>
<h2>금 주얼리 보관법</h2>
<p>금 주얼리는 다른 귀금속이나 보석과 함께 보관하면 스크래치가 생길 수 있습니다. 개별 파우치나 칸이 나뉜 보석함에 따로 보관하세요.</p>
<ul><li>땀이나 화장품이 묻으면 부드러운 천으로 닦기</li><li>수영장, 온천 이용 시 반드시 탈착</li><li>18K 이하는 변색 가능성이 있으므로 특히 주의</li></ul>
<h2>보관 장소 선택</h2>
<p><strong>가정 금고:</strong> 소량(100돈 이하)이라면 가정용 내화금고로 충분합니다. 벽이나 바닥에 고정하면 더 안전합니다.</p>
<p><strong>은행 대여금고:</strong> 대량 보관 시 은행 대여금고가 가장 안전합니다. 연간 10~30만원 수준의 비용이 들지만 보험도 적용됩니다.</p>
<p>📞 010-2645-3745 | 📍 경기도 안성시 공도읍 진건중길 4</p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
  {
    title: "한국금거래소 안성공도점, 4월 24일 그랜드 오픈!",
    labels: ["오픈", "안성공도점", "금거래소", "그랜드오픈"],
    content: `<p>오랜 준비 끝에 한국금거래소 안성공도점이 2026년 4월 24일 정식 오픈합니다!</p>
<h2>매장 소개</h2>
<p>경기도 안성시 공도읍 진건중길 4에 위치한 안성공도점은 약 49평 규모의 넓고 쾌적한 매장으로, 금·은·백금의 매입과 판매를 전문으로 합니다.</p>
<h2>주요 서비스</h2>
<ul><li><strong>실시간 시세 거래:</strong> 국제 시세를 실시간 반영하여 투명한 가격으로 거래</li><li><strong>무료 감정:</strong> 최신 XRF 장비로 정확한 순도 감정</li><li><strong>골드바 판매:</strong> 1돈~100돈까지 다양한 규격의 골드바 구비</li><li><strong>주얼리:</strong> 18K, 14K 금 주얼리 판매</li><li><strong>귀금속 상담:</strong> 투자, 보관, 세금 등 전문 상담</li></ul>
<h2>오픈 이벤트</h2>
<p>그랜드 오픈을 기념하여 4월 24일~30일 방문 고객께 특별 혜택을 드립니다.</p>
<p><strong>📞 상담 문의: 010-2645-3745</strong></p>
<p>📍 경기도 안성시 공도읍 진건중길 4</p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
  {
    title: "매장 인테리어 공사 현황 - 3월 넷째 주 업데이트",
    labels: ["공사현황", "인테리어", "안성공도점"],
    content: `<p>한국금거래소 안성공도점의 인테리어 공사가 순조롭게 진행되고 있습니다. 3월 넷째 주 주요 진행 상황을 공유합니다.</p>
<h2>외부 공사</h2>
<p>매장 전면부 외장 공사가 거의 마무리되었습니다. 한국금거래소의 아이덴티티를 살린 고급스러운 외관이 완성되어 가고 있습니다.</p>
<h2>내부 공사</h2>
<p>천장 마감과 벽체 인테리어가 한창 진행 중입니다. 고객 상담 공간, VIP룸, 감정실 등 세부 공간 구획이 완료되었으며, 바닥 시공에 들어갔습니다.</p>
<h2>보안 시설</h2>
<p>외부 보안 셔터, CCTV 시스템, 금고실 등 보안 시설 설치가 완료되었습니다.</p>
<h2>향후 일정</h2>
<ul><li>4월 첫째 주: 내부 마감 완료</li><li>4월 둘째 주: 장비·집기 설치</li><li>4월 셋째 주: 최종 점검 및 시운영</li><li>4월 24일: 그랜드 오픈!</li></ul>
<p>📞 010-2645-3745 | 📍 경기도 안성시 공도읍 진건중길 4</p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
  {
    title: "안성공도점 오시는 길 & 주차 안내",
    labels: ["오시는길", "주차", "영업시간", "안성"],
    content: `<p>한국금거래소 안성공도점 방문을 위한 교통편과 주차 정보를 안내해 드립니다.</p>
<h2>주소</h2>
<p>📍 경기도 안성시 공도읍 진건중길 4 (진사리 16-6)</p>
<h2>자가용 이용 시</h2>
<p><strong>서울/수원 방면:</strong> 경부고속도로 → 안성IC → 좌회전 후 공도읍 방면 10분</p>
<p><strong>천안/아산 방면:</strong> 1번 국도 → 공도읍 진입 → 진건중길 좌회전</p>
<p><strong>네비게이션:</strong> "한국금거래소 안성공도점" 또는 "경기도 안성시 공도읍 진건중길 4" 검색</p>
<h2>주차 안내</h2>
<p>매장 앞 전용 주차장을 운영합니다. 고객 차량 5대 이상 주차 가능하며, 무료입니다.</p>
<h2>대중교통 이용 시</h2>
<p><strong>버스:</strong> 안성 시내버스 이용 → 공도읍사무소 하차 → 도보 5분</p>
<p><strong>SRT/KTX:</strong> 평택지제역 하차 → 택시 약 20분</p>
<h2>영업시간</h2>
<ul><li>매일 10:30 ~ 19:30 (연중무휴)</li></ul>
<p><strong>📞 방문 전 전화 상담: 010-2645-3745</strong></p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
  {
    title: "그랜드 오픈 기념 이벤트 - 금 매입 수수료 0%",
    labels: ["이벤트", "오픈이벤트", "수수료무료", "골드바"],
    content: `<p>한국금거래소 안성공도점 그랜드 오픈을 기념하여 특별 이벤트를 진행합니다!</p>
<h2>이벤트 1: 금 매입 수수료 0%</h2>
<p><strong>기간:</strong> 2026년 4월 24일 ~ 4월 30일 (7일간)</p>
<p>오픈 첫 주 동안 금 매입 시 수수료를 받지 않습니다. 집에 잠자고 있는 금반지, 금목걸이, 골드바 등을 가져오시면 최고가로 매입해 드립니다!</p>
<h2>이벤트 2: 골드바 구매 시 사은품 증정</h2>
<p>10돈 이상 골드바 구매 시 순금 0.5돈 행운의 미니 골드바를 사은품으로 드립니다. (선착순 50명)</p>
<h2>이벤트 3: 방문 고객 전원 기념품</h2>
<p>오픈 기간 중 매장 방문 고객 전원께 한국금거래소 로고 에코백과 금 시세 가이드북을 드립니다.</p>
<p><strong>📞 사전 상담: 010-2645-3745</strong></p>
<p>📍 경기도 안성시 공도읍 진건중길 4</p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
  {
    title: "SNS 후기 이벤트 - 금 1돈을 드립니다!",
    labels: ["이벤트", "SNS", "후기이벤트", "경품"],
    content: `<p>한국금거래소 안성공도점 이용 후기를 SNS에 올려주시면 추첨을 통해 순금 1돈을 드립니다!</p>
<h2>이벤트 기간</h2>
<p>2026년 4월 24일 ~ 5월 31일</p>
<h2>참여 방법</h2>
<ol><li>한국금거래소 안성공도점에서 거래 또는 감정 서비스 이용</li><li>매장 사진 또는 거래 후기를 인스타그램, 네이버 블로그, 카카오스토리 중 1곳 이상에 게시</li><li>해시태그 <strong>#한국금거래소안성공도점 #안성금거래소</strong> 필수 포함</li><li>게시물 링크를 매장 직원에게 보여주기</li></ol>
<h2>경품</h2>
<ul><li><strong>대상 (1명):</strong> 순금 1돈 골드바</li><li><strong>우수상 (3명):</strong> 순은 10돈 실버바</li><li><strong>참가상 (20명):</strong> 스타벅스 기프티콘</li></ul>
<h2>당첨 발표</h2>
<p>2026년 6월 5일 매장 및 블로그 공지</p>
<p>📞 010-2645-3745 | 📍 경기도 안성시 공도읍 진건중길 4</p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
  {
    title: "어버이날 특별 프로모션 - 부모님께 금 선물하세요",
    labels: ["어버이날", "금선물", "프로모션", "효도"],
    content: `<p>5월 8일 어버이날, 부모님께 특별한 금 선물은 어떠세요? 한국금거래소 안성공도점에서 어버이날 특별 프로모션을 준비했습니다.</p>
<h2>프로모션 기간</h2>
<p>2026년 5월 1일 ~ 5월 8일</p>
<h2>특별 혜택</h2>
<ul><li><strong>순금 카네이션 브로치:</strong> 한정 수량 특별가 판매 (정가 대비 10% 할인)</li><li><strong>24K 순금 효도반지:</strong> 각인 서비스 무료 (이니셜 또는 메시지)</li><li><strong>미니 골드바 세트:</strong> 1돈/2돈/3돈 선물 포장 무료</li><li><strong>감사 카드:</strong> 금 구매 시 프리미엄 감사 카드 무료 동봉</li></ul>
<h2>금이 선물로 좋은 이유</h2>
<p>금은 시간이 지나도 가치가 보존되는 실물 자산입니다. 꽃은 시들고, 용돈은 쓰이지만, 금은 부모님의 노후 자산으로 남습니다.</p>
<p><strong>📞 예약 주문: 010-2645-3745</strong></p>
<p>📍 경기도 안성시 공도읍 진건중길 4</p>
<p><a href="https://goldo-hazel.vercel.app">한국금거래소 안성공도점 홈페이지 바로가기</a></p>`,
  },
];

async function main() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = creds.installed || creds.web;

  const oauth2 = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3333/oauth2callback");
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  oauth2.setCredentials(token);

  const blogger = google.blogger({ version: "v3", auth: oauth2 });

  console.log(`\n📝 나머지 ${remainingPosts.length}개 글 발행 시작...\n`);

  let success = 0;
  for (let i = 0; i < remainingPosts.length; i++) {
    const post = remainingPosts[i];
    try {
      const res = await blogger.posts.insert({
        blogId: BLOG_ID,
        isDraft: false,
        requestBody: {
          title: post.title,
          content: post.content,
          labels: post.labels,
        },
      });
      success++;
      console.log(`✅ [${i + 1}/${remainingPosts.length}] "${post.title}"`);
      console.log(`   → ${res.data.url}\n`);
    } catch (err) {
      console.error(`❌ [${i + 1}/${remainingPosts.length}] "${post.title}" - ${err.message}\n`);
    }
    // 5초 대기 (속도 제한 방지)
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log(`\n🎉 완료! 성공: ${success}/${remainingPosts.length}`);
}

main().catch(console.error);
