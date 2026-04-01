import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const db = getAdminClient();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ categories: data });
}

export async function POST(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { name, slug, description, sort_order } = await req.json();

  if (!name || !slug) {
    return NextResponse.json({ error: "이름과 슬러그는 필수입니다." }, { status: 400 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("categories")
    .insert({ name, slug, description: description || "", sort_order: sort_order || 0 })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 이름 또는 슬러그입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data }, { status: 201 });
}
