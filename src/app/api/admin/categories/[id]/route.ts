import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  const { name, slug, description, sort_order } = await req.json();

  const db = getAdminClient();
  const { data, error } = await db
    .from("categories")
    .update({ name, slug, description, sort_order })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ category: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { id } = await params;
  const db = getAdminClient();
  const { error } = await db.from("categories").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
