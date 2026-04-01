"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { GoldPrice } from "@/lib/types";

export default function GoldPriceWidget() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  async function fetchPrices() {
    try {
      const res = await fetch("/api/gold-price");
      const data = await res.json();
      if (data.prices && data.prices.length > 0) {
        setPrices(data.prices);
        setUpdatedAt(data.updatedAt || "");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  function fmt(n: number) {
    return n > 0 ? Math.round(n).toLocaleString("ko-KR") : "-";
  }

  function ChangeCell({ value }: { value: number }) {
    const v = Math.round(value);
    if (v > 0)
      return <span className="text-red-400">▲ +{v.toLocaleString("ko-KR")}</span>;
    if (v < 0)
      return <span className="text-blue-400">▼ {v.toLocaleString("ko-KR")}</span>;
    return <span className="text-text-muted">-</span>;
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gold font-serif font-semibold text-sm">실시간 금 시세</h3>
        <button
          onClick={() => { setLoading(true); fetchPrices(); }}
          className="text-text-muted hover:text-gold transition"
          title="새로고침"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && prices.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex justify-between">
              <div className="h-4 bg-dark rounded w-16" />
              <div className="h-4 bg-dark rounded w-20" />
              <div className="h-4 bg-dark rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left text-text-muted font-medium py-1.5">품목</th>
              <th className="text-right text-text-muted font-medium py-1.5">
                살 때 <span className="text-[9px]">(VAT포함)</span>
              </th>
              <th className="text-right text-text-muted font-medium py-1.5">팔 때</th>
              <th className="text-right text-text-muted font-medium py-1.5">등락</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((item) => (
              <tr key={item.name} className="border-b border-dark-border/30">
                <td className="py-1.5 text-text-muted whitespace-nowrap">{item.name}</td>
                <td className="py-1.5 text-right text-white font-medium">
                  {item.name.includes("18K") || item.name.includes("14K")
                    ? <span className="text-text-muted text-[10px]">제품시세</span>
                    : fmt(item.buy)}
                </td>
                <td className="py-1.5 text-right text-gold font-medium">{fmt(item.sell)}</td>
                <td className="py-1.5 text-right">
                  <ChangeCell value={item.change} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {updatedAt && (
        <p className="text-[10px] text-text-muted mt-2 text-right">
          {updatedAt}
        </p>
      )}
      <p className="text-[10px] text-text-muted mt-0.5">
        * 한국금거래소 매매기준가 / 1돈(3.75g) / 단위: 원
      </p>
    </div>
  );
}
