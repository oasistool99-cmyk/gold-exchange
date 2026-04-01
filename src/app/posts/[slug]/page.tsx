import { getAdminClient } from "@/lib/supabase";
import { Post, Category } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import { formatDate } from "@/lib/utils";
import { Calendar, Eye, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getAdminClient();
  const { data: post } = await db
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "글을 찾을 수 없습니다" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getAdminClient();

  const { data: post } = await db
    .from("posts")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  // 조회수 증가
  await db
    .from("posts")
    .update({ view_count: (post as Post).view_count + 1 })
    .eq("id", (post as Post).id);

  const { data: categories } = await db
    .from("categories")
    .select("*")
    .order("sort_order");

  // 이전/다음 글
  const { data: prevPost } = await db
    .from("posts")
    .select("slug, title")
    .eq("published", true)
    .lt("created_at", (post as Post).created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: nextPost } = await db
    .from("posts")
    .select("slug, title")
    .eq("published", true)
    .gt("created_at", (post as Post).created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const p = post as Post;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <article>
          {/* 뒤로가기 */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-gold transition mb-6"
          >
            <ArrowLeft size={16} />
            목록으로
          </Link>

          {/* 카테고리 */}
          {p.category && (
            <Link
              href={`/category/${p.category.slug}`}
              className="inline-block text-xs text-gold font-medium mb-2 hover:underline"
            >
              {p.category.name}
            </Link>
          )}

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
            {p.title}
          </h1>

          {/* 메타 */}
          <div className="flex items-center gap-4 mt-4 mb-6 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(p.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {p.view_count}
            </span>
          </div>

          {/* 태그 */}
          {p.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs text-text-muted bg-dark-card border border-dark-border px-3 py-1 rounded-full"
                >
                  <Tag size={11} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 썸네일 */}
          {p.thumbnail_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img src={p.thumbnail_url} alt={p.title} className="w-full" />
            </div>
          )}

          {/* 구분선 */}
          <div className="w-full h-px bg-dark-border mb-8" />

          {/* 본문 */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: p.content }}
          />

          {/* 구분선 */}
          <div className="w-full h-px bg-dark-border my-8" />

          {/* 이전/다음 글 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}`}
                className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-gold/40 transition group"
              >
                <span className="text-xs text-text-muted">이전 글</span>
                <p className="text-sm text-white mt-1 group-hover:text-gold transition line-clamp-1">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {nextPost && (
              <Link
                href={`/posts/${nextPost.slug}`}
                className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-gold/40 transition group text-right"
              >
                <span className="text-xs text-text-muted">다음 글</span>
                <p className="text-sm text-white mt-1 group-hover:text-gold transition line-clamp-1">
                  {nextPost.title}
                </p>
              </Link>
            )}
          </div>
        </article>

        <Sidebar categories={(categories as Category[]) || []} />
      </div>
    </div>
  );
}
