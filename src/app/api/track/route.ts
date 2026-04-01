import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    const userAgent = req.headers.get("user-agent") || "";

    // 봇 필터링
    if (/bot|crawler|spider|slurp|googlebot|bingbot/i.test(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    const db = getAdminClient();
    await db.from("page_views").insert({
      path,
      referrer: referrer || "",
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
