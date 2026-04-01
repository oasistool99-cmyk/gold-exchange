"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1 pt-4">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[calc(theme(spacing.16)+36px)] md:pt-[calc(theme(spacing.16)+36px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
