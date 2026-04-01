import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { syncToWordPress, shouldSyncToWP } from "@/lib/sync-wordpress";

// 글 목록 (관리자 - published/unpublished 모두)
export async function GET(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const db = getAdminClient();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;

  const { count } = await db
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { data: posts, error } = await db
    .from("posts")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    posts,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// 글 생성
export async function POST(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const body = await req.json();
  const { title, slug, content, excerpt, thumbnail_url, category_id, tags, published } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "제목과 슬러그는 필수입니다." }, { status: 400 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("posts")
    .insert({
      title,
      slug,
      content: content || "",
      excerpt: excerpt || "",
      thumbnail_url: thumbnail_url || "",
      category_id: category_id || null,
      tags: tags || [],
      published: published || false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 매장 소식이면 WordPress에 동기화
  if (published && data && (await shouldSyncToWP(category_id))) {
    syncToWordPress({
      title,
      content: content || "",
      excerpt: excerpt || "",
      thumbnail_url: thumbnail_url || "",
      blog_post_id: data.id,
      action: "create",
    }).catch(() => {});
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
