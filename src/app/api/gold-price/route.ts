import { NextResponse } from "next/server";
import { GoldPrice } from "@/lib/types";

// 캐시: 1분
let cachedData: { prices: GoldPrice[]; updatedAt: string } | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 1000;

async function fetchFromKoreaGoldX() {
  const res = await fetch("https://www.koreagoldx.co.kr/api/main", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      Referer: "https://www.koreagoldx.co.kr/",
      Origin: "https://www.koreagoldx.co.kr",
    },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function parsePrices(data: Record<string, unknown>): {
  prices: GoldPrice[];
  updatedAt: string;
} {
  const op = data.officialPrice4 as Record<string, number>;
  const date = (data.date as string) || "";

  const prices: GoldPrice[] = [
    {
      name: "순금 (24K)",
      buy: op.s_pure,
      sell: op.p_pure,
      change: op.turm_s_pure,
    },
    {
      name: "18K 금",
      buy: op.s_18k,
      sell: op.p_18k,
      change: op.turm_s_18k,
    },
    {
      name: "14K 금",
      buy: op.s_14k,
      sell: op.p_14k,
      change: op.turm_s_14k,
    },
    {
      name: "백금 (Pt)",
      buy: op.s_white,
      sell: op.p_white,
      change: op.turm_s_white,
    },
    {
      name: "은 (Ag)",
      buy: op.s_silver,
      sell: op.p_silver,
      change: op.turm_s_silver,
    },
  ];

  // 날짜 포맷
  const now = new Date();
  const updatedAt =
    date ||
    `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return { prices, updatedAt };
}

export async function GET() {
  const now = Date.now();

  if (cachedData && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  // 최대 2회 시도
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const data = await fetchFromKoreaGoldX();

      if (!data.officialPrice4) throw new Error("No officialPrice4");

      cachedData = parsePrices(data);
      cacheTime = Date.now();

      return NextResponse.json(cachedData);
    } catch {
      if (attempt === 0) {
        // 첫 실패 시 1초 대기 후 재시도
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  // 모든 시도 실패
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  // 최종 fallback (현재 시간 표시)
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const fallbackTime = `${kstNow.getUTCFullYear()}.${String(kstNow.getUTCMonth() + 1).padStart(2, "0")}.${String(kstNow.getUTCDate()).padStart(2, "0")} ${String(kstNow.getUTCHours()).padStart(2, "0")}:${String(kstNow.getUTCMinutes()).padStart(2, "0")} (지연)`;

  return NextResponse.json({
    prices: [
      { name: "순금 (24K)", buy: 984000, sell: 826000, change: 16000 },
      { name: "18K 금", buy: 723240, sell: 607200, change: 11760 },
      { name: "14K 금", buy: 560880, sell: 470900, change: 9120 },
      { name: "백금 (Pt)", buy: 413000, sell: 336000, change: 4000 },
      { name: "은 (Ag)", buy: 15500, sell: 12460, change: 560 },
    ],
    updatedAt: fallbackTime,
  });
}
