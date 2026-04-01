"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { Eye, Users, TrendingUp, Globe, Clock } from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  topPages: { path: string; count: number }[];
  referrers: { source: string; count: number }[];
  daily: { date: string; count: number }[];
  recentViews: { id: number; path: string; referrer: string; user_agent: string; created_at: string }[];
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  async function fetchData(d: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(days);
  }, [days]);

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function shortenPath(path: string) {
    if (path === "/") return "홈";
    if (path.startsWith("/posts/")) return path.replace("/posts/", "글: ");
    if (path.startsWith("/category/")) return path.replace("/category/", "카테고리: ");
    if (path.startsWith("/search")) return "검색";
    return path;
  }

  function shortenUA(ua: string) {
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("Windows")) return "PC (Windows)";
    if (ua.includes("Mac")) return "PC (Mac)";
    if (ua.includes("Linux")) return "PC (Linux)";
    return "기타";
  }

  const maxDaily = data ? Math.max(...data.daily.map((d) => d.count), 1) : 1;

  return (
    <>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-serif font-bold text-white">방문자 분석</h1>
          <div className="flex gap-1">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded text-sm transition ${
                  days === d
                    ? "bg-gold text-dark font-semibold"
                    : "text-text-muted hover:text-gold"
                }`}
              >
                {d}일
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-muted">불러오는 중...</div>
        ) : !data ? (
          <div className="text-center py-10 text-text-muted">데이터를 불러올 수 없습니다.</div>
        ) : (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                  <Eye size={14} />
                  오늘 방문
                </div>
                <p className="text-2xl font-bold text-gold">{data.todayViews}</p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                  <Users size={14} />
                  최근 {days}일
                </div>
                <p className="text-2xl font-bold text-white">{data.totalViews}</p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                  <TrendingUp size={14} />
                  일 평균
                </div>
                <p className="text-2xl font-bold text-white">
                  {data.daily.length > 0 ? Math.round(data.totalViews / data.daily.length) : 0}
                </p>
              </div>
              <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                  <Globe size={14} />
                  유입 경로
                </div>
                <p className="text-2xl font-bold text-white">{data.referrers.length}</p>
              </div>
            </div>

            {/* 일별 그래프 */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gold mb-4">일별 방문수</h3>
              {data.daily.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">아직 데이터가 없습니다.</p>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {data.daily.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-text-muted">{d.count}</span>
                      <div
                        className="w-full bg-gold/80 rounded-t min-h-[2px]"
                        style={{ height: `${(d.count / maxDaily) * 100}%` }}
                      />
                      <span className="text-[9px] text-text-muted">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 유입 경로 */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gold mb-4">유입 경로</h3>
                {data.referrers.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-4">아직 데이터가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {data.referrers.map((r) => (
                      <div key={r.source} className="flex items-center justify-between">
                        <span className="text-sm text-text">{r.source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-dark rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gold h-full rounded-full"
                              style={{
                                width: `${(r.count / data.referrers[0].count) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-text-muted w-8 text-right">{r.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 인기 페이지 */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gold mb-4">인기 페이지 Top 10</h3>
                {data.topPages.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-4">아직 데이터가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topPages.map((p, i) => (
                      <div key={p.path} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gold font-bold w-5">{i + 1}</span>
                          <span className="text-sm text-text truncate">{shortenPath(p.path)}</span>
                        </div>
                        <span className="text-xs text-text-muted shrink-0 ml-2">{p.count}회</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 최근 방문 기록 */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gold mb-4">
                <Clock size={14} className="inline mr-1" />
                최근 방문 기록
              </h3>
              {data.recentViews.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">아직 방문 기록이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-dark-border text-left">
                        <th className="py-2 text-text-muted font-medium">시간</th>
                        <th className="py-2 text-text-muted font-medium">페이지</th>
                        <th className="py-2 text-text-muted font-medium">유입 경로</th>
                        <th className="py-2 text-text-muted font-medium">기기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentViews.map((v) => (
                        <tr key={v.id} className="border-b border-dark-border/30">
                          <td className="py-1.5 text-text-muted whitespace-nowrap">
                            {formatTime(v.created_at)}
                          </td>
                          <td className="py-1.5 text-text">{shortenPath(v.path)}</td>
                          <td className="py-1.5 text-text-muted truncate max-w-[200px]">
                            {v.referrer || "직접 접속"}
                          </td>
                          <td className="py-1.5 text-text-muted">{shortenUA(v.user_agent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
