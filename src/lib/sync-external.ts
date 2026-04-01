import { getAdminClient } from "@/lib/supabase";

interface ExternalPostData {
  title: string;
  content: string;
  tags?: string[];
}

async function getSettings(): Promise<Record<string, string>> {
  const db = getAdminClient();
  const { data } = await db.from("blog_settings").select("key, value");
  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function syncToTistory(post: ExternalPostData): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSettings();
    const token = settings.tistory_access_token;
    const blogName = settings.tistory_blog_name;

    if (!token || !blogName) {
      return { success: false, error: "Tistory 설정이 없습니다." };
    }

    const params = new URLSearchParams({
      access_token: token,
      output: "json",
      blogName,
      title: post.title,
      content: post.content,
      visibility: "3", // 공개
      category: "0",
    });

    if (post.tags?.length) {
      params.set("tag", post.tags.join(","));
    }

    const res = await fetch("https://www.tistory.com/apis/post/write", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Tistory 발행 실패: ${res.status} ${text}` };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: `Tistory 오류: ${e instanceof Error ? e.message : "알 수 없음"}` };
  }
}

export async function syncToBlogger(post: ExternalPostData): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSettings();
    const apiKey = settings.blogger_api_key;
    const blogId = settings.blogger_blog_id;

    if (!apiKey || !blogId) {
      return { success: false, error: "Blogger 설정이 없습니다." };
    }

    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "blogger#post",
          title: post.title,
          content: post.content,
          labels: post.tags || [],
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Blogger 발행 실패: ${res.status} ${text}` };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: `Blogger 오류: ${e instanceof Error ? e.message : "알 수 없음"}` };
  }
}

export async function syncToExternalBlogs(
  post: ExternalPostData,
  platforms: { tistory?: boolean; blogger?: boolean }
): Promise<Record<string, { success: boolean; error?: string }>> {
  const results: Record<string, { success: boolean; error?: string }> = {};

  const promises: Promise<void>[] = [];

  if (platforms.tistory) {
    promises.push(
      syncToTistory(post).then((r) => { results.tistory = r; })
    );
  }

  if (platforms.blogger) {
    promises.push(
      syncToBlogger(post).then((r) => { results.blogger = r; })
    );
  }

  await Promise.allSettled(promises);
  return results;
}
