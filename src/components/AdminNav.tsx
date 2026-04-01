"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderOpen, BarChart3, LogOut, Home, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  }

  const links = [
    { href: "/admin/posts", label: "글 관리", icon: FileText },
    { href: "/admin/categories", label: "카테고리", icon: FolderOpen },
    { href: "/admin/analytics", label: "방문자 분석", icon: BarChart3 },
    { href: "/admin/settings", label: "설정", icon: Settings },
  ];

  return (
    <div className="bg-dark-card border-b border-dark-border mb-6">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
        <div className="flex items-center gap-1">
          <span className="text-gold font-serif font-semibold text-sm mr-4">Admin</span>
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition ${
                  active
                    ? "bg-gold/10 text-gold"
                    : "text-text-muted hover:text-gold"
                }`}
              >
                <Icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-text-muted hover:text-gold transition"
          >
            <Home size={12} />
            블로그
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition ml-2"
          >
            <LogOut size={12} />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
