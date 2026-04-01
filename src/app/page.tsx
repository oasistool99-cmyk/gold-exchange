import { getAdminClient } from "@/lib/supabase";
import { Post, Category } from "@/lib/types";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";

const POSTS_PER_PAGE = 9;

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const db = getAdminClient();

  const { data: categories } = await db
    .from("categories")
    .select("*")
    .order("sort_order");

  const { count } = await db
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  const { data: posts } = await db
    .from("posts")
    .select("*, category:categories(*)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 */}
      <div className="mb-10 text-center">
        <span className="text-xs tracking-[0.3em] text-gold/70 uppercase">Korea Gold Exchange Blog</span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
          한국금거래소 <span className="text-gold">안성공도점</span>
        </h1>
        <p className="text-text-muted mt-3 text-sm">
          금 시세 동향, 귀금속 지식, 매장 소식을 전합니다
        </p>
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
              <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">✨</p>
              <p className="text-text-muted">아직 게시된 글이 없습니다.</p>
              <p className="text-text-muted text-sm mt-1">곧 유익한 콘텐츠로 찾아뵙겠습니다!</p>
            </div>
          )}
        </div>

        <Sidebar categories={(categories as Category[]) || []} />
      </div>
    </div>
  );
}
