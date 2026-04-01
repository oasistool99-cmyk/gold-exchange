import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await verifyToken();
  if (!admin) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { perspective, summary, charCount, category } = await req.json();

  if (!perspective || !summary) {
    return NextResponse.json(
      { error: "주요 관점과 요약을 입력해주세요." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const targetChars = charCount || 2000;

  const systemPrompt = `당신은 한국금거래소 안성공도점의 전문 블로그 작성자입니다.
금, 귀금속, 투자, 매장 소식 관련 블로그 글을 작성합니다.
전문적이면서도 읽기 쉬운 문체로 작성하세요.
반드시 HTML 형식으로 본문을 작성하세요 (h2, h3, p, ul, li, strong, em 태그 활용).
이미지 태그는 사용하지 마세요.`;

  const userPrompt = `다음 정보를 바탕으로 블로그 글을 작성해주세요.

카테고리: ${category || "일반"}
주요 관점: ${perspective}
요약: ${summary}
목표 글자 수: 약 ${targetChars}자

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "title": "SEO에 최적화된 매력적인 제목",
  "content": "<h2>...</h2><p>...</p>... (HTML 본문, 약 ${targetChars}자)",
  "excerpt": "2~3문장의 요약문",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"]
}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error?.message || "AI 글 생성 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return NextResponse.json(
        { error: "AI 응답이 비어있습니다." },
        { status: 500 }
      );
    }

    // JSON 파싱 (코드블록 감싸기 처리)
    const jsonStr = raw.replace(/^```json?\s*/, "").replace(/\s*```$/, "");
    const result = JSON.parse(jsonStr);

    return NextResponse.json({
      title: result.title || "",
      content: result.content || "",
      excerpt: result.excerpt || "",
      tags: result.tags || [],
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "글 생성 중 오류: " +
          (e instanceof Error ? e.message : "알 수 없는 오류"),
      },
      { status: 500 }
    );
  }
}
