"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import PostEditor from "@/components/PostEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Post } from "@/lib/types";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/posts/${params.id}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setPost(data.post);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [params.id, router]);

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-6xl mx-auto px-4 text-center py-10 text-text-muted">
          불러오는 중...
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <AdminNav />
        <div className="max-w-6xl mx-auto px-4 text-center py-10 text-text-muted">
          글을 찾을 수 없습니다.
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin/posts"
            className="text-text-muted hover:text-gold transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-serif font-bold text-white">글 수정</h1>
        </div>
        <PostEditor post={post} isEdit />
      </div>
    </>
  );
}
