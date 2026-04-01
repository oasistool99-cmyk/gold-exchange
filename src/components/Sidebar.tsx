import Link from "next/link";
import { Category } from "@/lib/types";
import GoldPriceWidget from "./GoldPriceWidget";

interface SidebarProps {
  categories: Category[];
  currentSlug?: string;
}

export default function Sidebar({ categories, currentSlug }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* 금 시세 위젯 */}
      <GoldPriceWidget />

      {/* 카테고리 */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-gold font-serif font-semibold text-sm mb-4">카테고리</h3>
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className={`text-sm px-3 py-1.5 rounded-lg transition ${
              !currentSlug
                ? "bg-gold/10 text-gold"
                : "text-text-muted hover:text-gold hover:bg-dark"
            }`}
          >
            전체 글
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`text-sm px-3 py-1.5 rounded-lg transition ${
                currentSlug === cat.slug
                  ? "bg-gold/10 text-gold"
                  : "text-text-muted hover:text-gold hover:bg-dark"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 매장 안내 */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="text-gold font-serif font-semibold text-sm mb-3">매장 안내</h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>📍 경기도 안성시 공도읍 진건중길 4</p>
          <p>📞 010-2645-3745</p>
          <p>⏰ 평일 10:00~19:00</p>
          <a
            href="http://anseonggold.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-gold text-xs hover:underline"
          >
            홈페이지 방문하기 →
          </a>
        </div>
      </div>
    </aside>
  );
}
