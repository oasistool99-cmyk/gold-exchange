"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { Post, Category } from "@/lib/types";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterCat, setFilterCat] = useState<number | "all">("all");
  const router = useRouter();

  async function fetchPosts(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts?page=${p}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const filteredPosts =
    filterCat === "all"
      ? posts
      : posts.filter((p) => p.category_id === filterCat);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  async function togglePublish(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    if (res.ok) {
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p)));
    }
  }

  // 카테고리별 글 수 계산
  function countByCategory(catId: number) {
    return posts.filter((p) => p.category_id === catId).length;
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-serif font-bold text-white">글 관리</h1>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-1.5 bg-gold text-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-light transition"
          >
            <Plus size={16} />
            새 글 작성
          </Link>
        </div>

        {/* 카테고리 필터 탭 */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat("all")}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition ${
              filterCat === "all"
                ? "bg-gold text-dark font-semibold"
                : "text-text-muted hover:text-gold hover:bg-dark-card"
            }`}
          >
            전체 ({posts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition ${
                filterCat === cat.id
                  ? "bg-gold text-dark font-semibold"
                  : "text-text-muted hover:text-gold hover:bg-dark-card"
              }`}
            >
              {cat.name} ({countByCategory(cat.id)})
            </button>
          ))}
          <button
            onClick={() => setFilterCat(0 as number)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition ${
              filterCat === 0
                ? "bg-gold text-dark font-semibold"
                : "text-text-muted hover:text-gold hover:bg-dark-card"
            }`}
          >
            미분류 ({posts.filter((p) => !p.category_id).length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-muted">불러오는 중...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            {filterCat === "all" ? "아직 작성된 글이 없습니다." : "이 카테고리에 글이 없습니다."}
          </div>
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border text-left">
                  <th className="px-4 py-3 text-xs text-text-muted font-medium">제목</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium hidden md:table-cell">카테고리</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium hidden md:table-cell">날짜</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium text-center">상태</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium text-center">조회</th>
                  <th className="px-4 py-3 text-xs text-text-muted font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-dark-border/50 hover:bg-dark/30">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => window.open(`/posts/${post.slug}`, '_blank')}
                        className="text-sm text-white hover:text-gold hover:underline transition cursor-pointer text-left"
                      >
                        {post.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-text-muted">
                        {post.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-text-muted">
                        {formatDate(post.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          post.published
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {post.published ? "공개" : "비공개"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-text-muted">{post.view_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded text-text-muted hover:text-gold hover:bg-dark transition"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-dark transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm transition ${
                  p === page
                    ? "bg-gold text-dark font-semibold"
                    : "text-text-muted hover:text-gold"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
