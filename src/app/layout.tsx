import type { Metadata } from "next";
import "./globals.css";
import PageTracker from "@/components/PageTracker";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: {
    default: "한국금거래소 안성공도점",
    template: "%s | 한국금거래소 안성공도점",
  },
  description: "안성에서 금, 은, 보석을 가장 정확한 시세로 거래하는 곳. 금 시세, 귀금속 지식, 매장 소식을 전합니다.",
  keywords: ["금거래소", "안성", "금시세", "귀금속", "금매입", "금판매"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "한국금거래소 안성공도점",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PageTracker />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
