import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { createToken } from "@/lib/auth";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const db = getAdminClient();
  const { data: user } = await db
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user || user.password_hash !== hashPassword(password)) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 잘못되었습니다." }, { status: 401 });
  }

  const token = await createToken({ id: user.id, email: user.email });

  const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24시간
    path: "/",
  });

  return res;
}
