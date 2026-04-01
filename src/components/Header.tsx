"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search, Settings } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 쿠키에서 admin_token 확인
    setIsAdmin(document.cookie.includes("admin_token="));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      setSearchOpen(false);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur border-b border-dark-border">
      {/* 상단 정보 바 */}
      <div className="hidden md:block bg-dark border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex justify-between text-xs text-text-muted">
          <div className="flex gap-6">
            <a href="tel:010-2645-3745" className="hover:text-gold transition">
              📞 010-2645-3745
            </a>
            <span>📍 경기도 안성시 공도읍 진건중길 4</span>
          </div>
          <div className="flex items-center gap-4">
            <span>⏰ 평일 10:30~19:30 | 토 10:30~19:30</span>
            {isAdmin && (
              <Link
                href="/admin/posts"
                className="flex items-center gap-1 text-gold hover:text-gold-light transition"
              >
                <Settings size={12} />
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="한국금거래소" className="h-10 md:h-12" />
          <span className="text-text-muted text-xs">안성공도점</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-text-muted hover:text-gold transition">
            홈
          </Link>
          <Link href="/category/gold-price" className="text-sm text-text-muted hover:text-gold transition">
            금 시세
          </Link>
          <Link href="/category/precious-metals" className="text-sm text-text-muted hover:text-gold transition">
            귀금속 지식
          </Link>
          <Link href="/category/store-news" className="text-sm text-text-muted hover:text-gold transition">
            매장 소식
          </Link>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-text-muted hover:text-gold transition"
          >
            <Search size={18} />
          </button>
          {isAdmin && (
            <Link
              href="/admin/posts"
              className="flex items-center gap-1 bg-gold/10 text-gold text-xs px-3 py-1.5 rounded-full hover:bg-gold/20 transition"
            >
              <Settings size={12} />
              관리자
            </Link>
          )}
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <div className="flex items-center gap-3 md:hidden">
          {isAdmin && (
            <Link
              href="/admin/posts"
              className="text-gold hover:text-gold-light transition"
            >
              <Settings size={20} />
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-text-muted hover:text-gold transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 검색 바 */}
      {searchOpen && (
        <div className="border-t border-dark-border bg-dark-bg">
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto px-4 py-3 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="flex-1 bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold"
              autoFocus
            />
            <button
              type="submit"
              className="bg-gold text-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-light transition"
            >
              검색
            </button>
          </form>
        </div>
      )}

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <nav className="md:hidden border-t border-dark-border bg-dark-bg">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-text-muted hover:text-gold transition py-2">
              홈
            </Link>
            <Link href="/category/gold-price" onClick={() => setMenuOpen(false)} className="text-sm text-text-muted hover:text-gold transition py-2">
              금 시세
            </Link>
            <Link href="/category/precious-metals" onClick={() => setMenuOpen(false)} className="text-sm text-text-muted hover:text-gold transition py-2">
              귀금속 지식
            </Link>
            <Link href="/category/store-news" onClick={() => setMenuOpen(false)} className="text-sm text-text-muted hover:text-gold transition py-2">
              매장 소식
            </Link>
            {isAdmin && (
              <Link href="/admin/posts" onClick={() => setMenuOpen(false)} className="text-sm text-gold hover:text-gold-light transition py-2 border-t border-dark-border pt-3">
                <Settings size={14} className="inline mr-1" />
                관리자 페이지
              </Link>
            )}
            <form onSubmit={handleSearch} className="flex gap-2 pt-2 border-t border-dark-border">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색..."
                className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold"
              />
              <button type="submit" className="bg-gold text-dark px-3 py-2 rounded-lg text-sm font-medium">
                검색
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
