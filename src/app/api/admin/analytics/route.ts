import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const db = getAdminClient();
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7");

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  // 1. 총 방문수
  const { count: totalViews } = await db
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sinceISO);

  // 2. 오늘 방문수
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: todayViews } = await db
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  // 3. 인기 페이지 Top 10
  const { data: allViews } = await db
    .from("page_views")
    .select("path")
    .gte("created_at", sinceISO);

  const pathCounts: Record<string, number> = {};
  (allViews || []).forEach((v: { path: string }) => {
    pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
  });
  const topPages = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // 4. 유입 경로 분석
  const { data: refViews } = await db
    .from("page_views")
    .select("referrer")
    .gte("created_at", sinceISO)
    .neq("referrer", "");

  const refCounts: Record<string, number> = {};
  (refViews || []).forEach((v: { referrer: string }) => {
    let source = "기타";
    const ref = v.referrer.toLowerCase();
    if (!ref) {
      source = "직접 접속";
    } else if (ref.includes("google")) {
      source = "Google";
    } else if (ref.includes("naver")) {
      source = "네이버";
    } else if (ref.includes("daum") || ref.includes("kakao")) {
      source = "다음/카카오";
    } else if (ref.includes("instagram")) {
      source = "인스타그램";
    } else if (ref.includes("facebook") || ref.includes("fb.")) {
      source = "페이스북";
    } else if (ref.includes("youtube")) {
      source = "유튜브";
    } else if (ref.includes("t.co") || ref.includes("twitter") || ref.includes("x.com")) {
      source = "X (트위터)";
    } else if (ref.includes("blog.naver")) {
      source = "네이버 블로그";
    } else if (ref.includes("tistory")) {
      source = "티스토리";
    } else if (ref.includes("anseonggold")) {
      source = "안성금거래소 홈페이지";
    } else {
      try {
        source = new URL(v.referrer).hostname;
      } catch {
        source = "기타";
      }
    }
    refCounts[source] = (refCounts[source] || 0) + 1;
  });

  const directCount = (totalViews || 0) - (refViews || []).length;
  if (directCount > 0) {
    refCounts["직접 접속"] = (refCounts["직접 접속"] || 0) + directCount;
  }

  const referrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));

  // 5. 일별 방문수 (최근 N일)
  const dailyCounts: Record<string, number> = {};
  (allViews || []).forEach((v: { path: string }) => {
    // 날짜별 카운트를 위해 전체 데이터를 다시 쿼리
  });

  const { data: dailyViews } = await db
    .from("page_views")
    .select("created_at")
    .gte("created_at", sinceISO)
    .order("created_at");

  (dailyViews || []).forEach((v: { created_at: string }) => {
    const date = v.created_at.slice(0, 10);
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const daily = Object.entries(dailyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // 6. 최근 방문 기록 20건
  const { data: recentViews } = await db
    .from("page_views")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    totalViews: totalViews || 0,
    todayViews: todayViews || 0,
    topPages,
    referrers,
    daily,
    recentViews: recentViews || [],
  });
}
