import { getAdminClient } from "@/lib/supabase";
import { Post, Category } from "@/lib/types";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색 결과",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const db = getAdminClient();

  const { data: categories } = await db
    .from("categories")
    .select("*")
    .order("sort_order");

  let posts: Post[] = [];
  if (query) {
    const { data } = await db
      .from("posts")
      .select("*, category:categories(*)")
      .eq("published", true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    posts = (data as Post[]) || [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <span className="text-xs tracking-[0.3em] text-gold/70 uppercase">Search</span>
        <h1 className="text-3xl font-serif font-bold text-white mt-2">검색 결과</h1>
        {query && (
          <p className="text-text-muted mt-2 text-sm">
            &ldquo;<span className="text-gold">{query}</span>&rdquo; 검색 결과 {posts.length}건
          </p>
        )}
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          {!query ? (
            <div className="text-center py-20">
              <p className="text-text-muted">검색어를 입력해 주세요.</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-muted">검색 결과가 없습니다.</p>
              <p className="text-text-muted text-sm mt-1">다른 검색어를 시도해 보세요.</p>
            </div>
          )}
        </div>

        <Sidebar categories={(categories as Category[]) || []} />
      </div>
    </div>
  );
}
