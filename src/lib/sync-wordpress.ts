// 블로그 → WordPress 동기화
// 매장 소식(store-news) 카테고리 글을 WordPress에 자동 전송

const WP_SITE = "http://anseonggold.co.kr";
const WP_REST_API = `${WP_SITE}/wp-json/wp/v2`;

interface SyncData {
  title: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  blog_post_id: number;
  action: "create" | "update" | "delete";
}

export async function syncToWordPress(data: SyncData) {
  try {
    // WordPress 커스텀 webhook 엔드포인트로 전송
    const res = await fetch(`${WP_SITE}/wp-json/anseonggold/v1/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.WEBHOOK_SECRET || "",
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[WP Sync] Failed:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (e) {
    console.error("[WP Sync] Error:", e);
    return false;
  }
}

export async function shouldSyncToWP(categoryId: number | null): Promise<boolean> {
  // store-news 카테고리(id: 3)만 동기화
  return categoryId === 3;
}
