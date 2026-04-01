import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { title, category } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  // 제목+카테고리 기반 프롬프트 생성
  let style = "luxurious, elegant, dark background with gold accents";
  let subject = title;

  if (category === "금 시세" || title.includes("금") || title.includes("시세")) {
    style = "luxurious gold bars, financial charts, dark elegant background with golden lighting";
  } else if (category === "귀금속 지식") {
    style = "precious metals, gold jewelry, gemstones, professional product photography, dark background";
  } else if (category === "매장 소식") {
    style = "modern luxury gold store interior, elegant retail space, warm golden lighting";
  } else if (category === "이벤트") {
    style = "celebration, gold confetti, luxury gift boxes, festive golden atmosphere";
  }

  const prompt = `Professional blog thumbnail image for a Korean gold exchange store blog. Topic: "${subject}". Style: ${style}. Clean, modern, 16:9 aspect ratio, no text or letters in the image.`;

  try {
    // DALL-E 3 호출
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error?.message || "이미지 생성 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "이미지 URL을 받지 못했습니다." }, { status: 500 });
    }

    // DALL-E 이미지를 다운로드해서 Supabase Storage에 업로드
    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const fileName = `blog/ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.png`;

    const db = getAdminClient();
    const { error: uploadError } = await db.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      // Storage 업로드 실패 시 DALL-E 원본 URL 반환 (임시, 1시간 후 만료)
      return NextResponse.json({ url: imageUrl, temporary: true });
    }

    const { data: urlData } = db.storage.from("images").getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    return NextResponse.json(
      { error: "이미지 생성 중 오류: " + (e instanceof Error ? e.message : "알 수 없는 오류") },
      { status: 500 }
    );
  }
}
