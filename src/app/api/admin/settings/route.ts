import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function GET() {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const db = getAdminClient();
  const { data } = await db.from("blog_settings").select("key, value");

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { settings } = await req.json();
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "설정값이 필요합니다." }, { status: 400 });
  }

  const db = getAdminClient();

  for (const [key, value] of Object.entries(settings)) {
    await db
      .from("blog_settings")
      .upsert(
        { key, value: value as string, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
  }

  return NextResponse.json({ success: true });
}
