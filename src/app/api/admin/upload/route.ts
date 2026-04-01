import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  // 파일 크기 제한 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
  }

  // 이미지 파일만 허용
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
  }

  const db = getAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage
    .from("images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: "업로드 실패: " + error.message }, { status: 500 });
  }

  const { data: urlData } = db.storage.from("images").getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
