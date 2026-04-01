import Link from "next/link";
import { Calendar, Eye, Tag } from "lucide-react";
import { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-gold/40 transition-all duration-300">
      <Link href={`/posts/${post.slug}`}>
        {/* 썸네일 */}
        {post.thumbnail_url ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-video bg-dark flex items-center justify-center">
            <span className="text-4xl text-gold/30">Au</span>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-5">
          {/* 카테고리 */}
          {post.category && (
            <span className="text-xs text-gold font-medium">
              {post.category.name}
            </span>
          )}

          <h3 className="text-white font-semibold mt-1 mb-2 line-clamp-2 group-hover:text-gold transition">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-sm text-text-muted line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {post.view_count}
            </span>
          </div>

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 text-[11px] text-text-muted bg-dark px-2 py-0.5 rounded-full"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
