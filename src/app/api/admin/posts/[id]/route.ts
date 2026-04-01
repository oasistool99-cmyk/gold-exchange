import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { syncToWordPress, shouldSyncToWP } from "@/lib/sync-wordpress";
import { syncToExternalBlogs } from "@/lib/sync-external";

// 글 상세
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  const db = getAdminClient();
  const { data, error } = await db
    .from("posts")
    .select("*, category:categories(id, name, slug)")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ post: data });
}

// 글 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, slug, content, excerpt, thumbnail_url, category_id, tags, published, sync_external } = body;

  const db = getAdminClient();
  const { data, error } = await db
    .from("posts")
    .update({
      title,
      slug,
      content,
      excerpt,
      thumbnail_url: thumbnail_url || "",
      category_id: category_id || null,
      tags: tags || [],
      published,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 매장 소식이면 WordPress에 동기화
  if (data && (await shouldSyncToWP(category_id))) {
    syncToWordPress({
      title,
      content: content || "",
      excerpt: excerpt || "",
      thumbnail_url: thumbnail_url || "",
      blog_post_id: Number(id),
      action: "update",
    }).catch(() => {});
  }

  // 외부 블로그 동시 발행
  if (published && sync_external && (sync_external.tistory || sync_external.blogger)) {
    syncToExternalBlogs(
      { title, content: content || "", tags: tags || [] },
      { tistory: sync_external.tistory, blogger: sync_external.blogger }
    ).catch(() => {});
  }

  return NextResponse.json({ post: data });
}

// 글 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  const db = getAdminClient();

  // 삭제 전 카테고리 확인
  const { data: post } = await db
    .from("posts")
    .select("title, category_id")
    .eq("id", id)
    .single();

  const { error } = await db.from("posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 매장 소식이면 WordPress에도 삭제 동기화
  if (post && (await shouldSyncToWP(post.category_id))) {
    syncToWordPress({
      title: post.title,
      content: "",
      excerpt: "",
      thumbnail_url: "",
      blog_post_id: Number(id),
      action: "delete",
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
