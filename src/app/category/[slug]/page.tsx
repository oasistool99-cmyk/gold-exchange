import { getAdminClient } from "@/lib/supabase";
import { Post, Category } from "@/lib/types";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const POSTS_PER_PAGE = 9;
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getAdminClient();
  const { data: category } = await db
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) return { title: "카테고리를 찾을 수 없습니다" };
  return {
    title: category.name,
    description: category.description || undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const db = getAdminClient();

  const { data: category } = await db
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: categories } = await db
    .from("categories")
    .select("*")
    .order("sort_order");

  const cat = category as Category;

  const { count } = await db
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("published", true)
    .eq("category_id", cat.id);

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  const { data: posts } = await db
    .from("posts")
    .select("*, category:categories(*)")
    .eq("published", true)
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <span className="text-xs tracking-[0.3em] text-gold/70 uppercase">Category</span>
        <h1 className="text-3xl font-serif font-bold text-white mt-2">{cat.name}</h1>
        {cat.description && (
          <p className="text-text-muted mt-2 text-sm">{cat.description}</p>
        )}
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          {posts && posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(posts as Post[]).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={`/category/${slug}`}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-muted">이 카테고리에 아직 글이 없습니다.</p>
            </div>
          )}
        </div>

        <Sidebar categories={(categories as Category[]) || []} currentSlug={slug} />
      </div>
    </div>
  );
}
