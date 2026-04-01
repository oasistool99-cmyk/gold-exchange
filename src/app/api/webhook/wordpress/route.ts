import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

// WordPress에서 매장 소식(progress) 글 발행 시 호출되는 webhook
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, title, content, excerpt, thumbnail_url, date, wp_post_id } = body;

    if (!title) {
      return NextResponse.json({ error: "제목 필수" }, { status: 400 });
    }

    const db = getAdminClient();

    // 매장 소식 카테고리 ID 조회
    const { data: category } = await db
      .from("categories")
      .select("id")
      .eq("slug", "store-news")
      .single();

    const categoryId = category?.id || 3;

    // slug 생성
    const slug = `wp-${wp_post_id || Date.now()}`;

    if (action === "delete") {
      // 삭제
      await db.from("posts").delete().eq("slug", slug);
      return NextResponse.json({ ok: true, action: "deleted" });
    }

    // 이미 존재하는지 확인 (wp_post_id 기반)
    const { data: existing } = await db
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      // 업데이트
      await db
        .from("posts")
        .update({
          title,
          content: content || "",
          excerpt: excerpt || "",
          thumbnail_url: thumbnail_url || "",
          published: true,
        })
        .eq("id", existing.id);

      return NextResponse.json({ ok: true, action: "updated", id: existing.id });
    } else {
      // 새 글 생성
      const { data: newPost, error } = await db
        .from("posts")
        .insert({
          title,
          slug,
          content: content || "",
          excerpt: excerpt || "",
          thumbnail_url: thumbnail_url || "",
          category_id: categoryId,
          tags: ["매장소식", "자동연동"],
          published: true,
          created_at: date || new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, action: "created", id: newPost?.id });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
