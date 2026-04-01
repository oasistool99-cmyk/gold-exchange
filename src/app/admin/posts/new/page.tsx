"use client";

import AdminNav from "@/components/AdminNav";
import PostEditor from "@/components/PostEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPostPage() {
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
          <h1 className="text-xl font-serif font-bold text-white">새 글 작성</h1>
        </div>
        <PostEditor />
      </div>
    </>
  );
}
