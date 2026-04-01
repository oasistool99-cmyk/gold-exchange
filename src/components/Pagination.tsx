"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  function pageUrl(page: number) {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-dark-card transition"
        >
          <ChevronLeft size={18} />
        </Link>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={pageUrl(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition ${
              page === currentPage
                ? "bg-gold text-dark font-semibold"
                : "text-text-muted hover:text-gold hover:bg-dark-card"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-dark-card transition"
        >
          <ChevronRight size={18} />
        </Link>
      )}
    </div>
  );
}
