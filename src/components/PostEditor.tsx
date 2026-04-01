"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category, Post } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Save, Eye, Upload, X, Sparkles, Wand2, Loader2, Copy, ExternalLink, CheckCircle } from "lucide-react";

interface PostEditorProps {
  post?: Post;
  isEdit?: boolean;
}

export default function PostEditor({ post, isEdit }: PostEditorProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);

  // AI 글 생성 입력
  const [perspective, setPerspective] = useState("");
  const [summary, setSummary] = useState("");
  const [charCount, setCharCount] = useState(2000);

  // 외부 블로그 발행
  const [syncTistory, setSyncTistory] = useState(false);
  const [syncBlogger, setSyncBlogger] = useState(false);
  const [tistoryReady, setTistoryReady] = useState(false);
  const [bloggerReady, setBloggerReady] = useState(false);
  const [copied, setCopied] = useState("");

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnail_url || "");
  const [categoryId, setCategoryId] = useState<number | "">(post?.category_id || "");
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(", ") || "");
  const [published, setPublished] = useState(post?.published || false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});

    // 외부 블로그 설정 확인
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        setTistoryReady(!!(s.tistory_access_token && s.tistory_blog_name));
        setBloggerReady(!!(s.blogger_api_key && s.blogger_blog_id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title) || `post-${Date.now()}`);
    }
  }, [title, autoSlug]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setThumbnailUrl(data.url);
      } else {
        setError(data.error || "업로드 실패");
      }
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerateImage() {
    if (!title) {
      setError("제목을 먼저 입력해주세요.");
      return;
    }
    setError("");
    setGenerating(true);

    const categoryName = categories.find((c) => c.id === categoryId)?.name || "";

    try {
      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category: categoryName }),
      });
      const data = await res.json();
      if (data.url) {
        setThumbnailUrl(data.url);
      } else {
        setError(data.error || "이미지 생성 실패");
      }
    } catch {
      setError("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateContent() {
    if (!perspective || !summary) {
      setError("주요 관점과 요약을 입력해주세요.");
      return;
    }
    setError("");
    setGeneratingContent(true);

    const categoryName = categories.find((c) => c.id === categoryId)?.name || "";

    try {
      const res = await fetch("/api/admin/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perspective,
          summary,
          charCount,
          category: categoryName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI 글 생성 실패");
        return;
      }

      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.tags?.length) setTagsInput(data.tags.join(", "));
    } catch {
      setError("AI 글 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingContent(false);
    }
  }

  async function handleSave(pub?: boolean) {
    setError("");
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const body = {
      title,
      slug: slug || `post-${Date.now()}`,
      content,
      excerpt,
      thumbnail_url: thumbnailUrl,
      category_id: categoryId || null,
      tags,
      published: pub !== undefined ? pub : published,
      sync_external: {
        tistory: syncTistory,
        blogger: syncBlogger,
      },
    };

    try {
      const url = isEdit ? `/api/admin/posts/${post!.id}` : "/api/admin/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }

      router.push("/admin/posts");
    } catch {
      setError("서버 연결 오류");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      {/* AI 글 생성 섹션 */}
      <div className="bg-gradient-to-r from-purple-900/30 to-gold/10 border border-purple-500/30 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 size={20} className="text-purple-400" />
          <h3 className="text-base font-semibold text-white">AI 글 자동 생성</h3>
          <span className="text-[11px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">GPT-4o</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">주요 관점 *</label>
            <input
              type="text"
              value={perspective}
              onChange={(e) => setPerspective(e.target.value)}
              placeholder="예: 2024년 하반기 금 투자 전망"
              className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">목표 글자 수</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={charCount}
                onChange={(e) => setCharCount(Number(e.target.value) || 2000)}
                min={500}
                max={10000}
                step={500}
                className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-purple-400"
              />
              <span className="text-xs text-text-muted shrink-0">자</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-text-muted mb-1">요약 / 핵심 내용 *</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="글에 담고 싶은 핵심 내용을 간략히 설명해주세요. 예: 최근 국제 금 시세 상승 추세와 안성 지역 금 매입/매도 시 유의할 점, 한국금거래소 안성공도점의 차별화된 서비스 소개"
            rows={3}
            className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-purple-400 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateContent}
            disabled={generatingContent || !perspective || !summary}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:from-purple-500 hover:to-purple-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingContent ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                AI가 글을 작성하고 있습니다...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                AI 글 생성
              </>
            )}
          </button>
          {generatingContent && (
            <span className="text-[11px] text-purple-300 animate-pulse">
              약 15~30초 소요됩니다
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* 메인 편집 영역 */}
        <div className="space-y-4">
          {/* 제목 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목을 입력하세요"
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-lg text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
          />

          {/* 슬러그 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted shrink-0">URL:</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className="flex-1 bg-dark border border-dark-border rounded-lg px-3 py-1.5 text-xs text-text-muted focus:outline-none focus:border-gold"
            />
          </div>

          {/* 요약 */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="글 요약 (선택)"
            rows={2}
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold resize-none"
          />

          {/* 본문 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="글 내용을 입력하세요 (HTML 지원)"
            rows={20}
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold resize-y font-mono"
          />
        </div>

        {/* 사이드 설정 */}
        <div className="space-y-4">
          {/* 발행 설정 */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gold">발행</h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="accent-[#D4AF37]"
              />
              <span className="text-sm text-text">공개</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !title}
                className="flex-1 flex items-center justify-center gap-1 bg-dark border border-dark-border text-text-muted text-sm py-2 rounded-lg hover:border-gold hover:text-gold transition disabled:opacity-50"
              >
                <Save size={14} />
                임시저장
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !title}
                className="flex-1 flex items-center justify-center gap-1 bg-gold text-dark text-sm font-semibold py-2 rounded-lg hover:bg-gold-light transition disabled:opacity-50"
              >
                <Eye size={14} />
                발행
              </button>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gold mb-2">카테고리</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-gold"
            >
              <option value="">선택 안함</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 태그 */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gold mb-2">태그</h3>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="쉼표로 구분 (예: 금시세, 투자)"
              className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold"
            />
          </div>

          {/* 대표 이미지 */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gold mb-2">대표 이미지</h3>

            {thumbnailUrl ? (
              <div className="relative mb-2">
                <img src={thumbnailUrl} alt="" className="w-full rounded-lg" />
                <button
                  onClick={() => setThumbnailUrl("")}
                  className="absolute top-1 right-1 p-1 bg-dark/80 rounded-full text-text-muted hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1 bg-dark border border-dark-border text-text-muted text-sm py-2 rounded-lg hover:border-gold hover:text-gold transition cursor-pointer">
                <Upload size={14} />
                {uploading ? "업로드 중..." : "직접 업로드"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <button
                onClick={handleGenerateImage}
                disabled={generating || !title}
                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-gold text-white text-sm py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Sparkles size={14} />
                {generating ? "생성 중..." : "AI 생성"}
              </button>
            </div>

            {generating && (
              <p className="text-[11px] text-purple-400 mt-1 animate-pulse">
                DALL-E가 이미지를 생성하고 있습니다... (약 10~20초)
              </p>
            )}

            <div className="mt-2">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="또는 이미지 URL 직접 입력"
                className="w-full bg-dark border border-dark-border rounded-lg px-3 py-1.5 text-xs text-text-muted focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* 외부 블로그 발행 */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gold mb-3">외부 블로그</h3>

            <div className="space-y-2 mb-3">
              <label className={`flex items-center gap-2 ${tistoryReady ? "cursor-pointer" : "opacity-40 cursor-not-allowed"}`}>
                <input
                  type="checkbox"
                  checked={syncTistory}
                  onChange={(e) => setSyncTistory(e.target.checked)}
                  disabled={!tistoryReady}
                  className="accent-orange-500"
                />
                <span className="text-sm text-text">Tistory</span>
                {!tistoryReady && <span className="text-[10px] text-text-muted">(설정 필요)</span>}
              </label>

              <label className={`flex items-center gap-2 ${bloggerReady ? "cursor-pointer" : "opacity-40 cursor-not-allowed"}`}>
                <input
                  type="checkbox"
                  checked={syncBlogger}
                  onChange={(e) => setSyncBlogger(e.target.checked)}
                  disabled={!bloggerReady}
                  className="accent-blue-500"
                />
                <span className="text-sm text-text">Blogger</span>
                {!bloggerReady && <span className="text-[10px] text-text-muted">(설정 필요)</span>}
              </label>
            </div>

            <div className="border-t border-dark-border pt-3 space-y-2">
              <p className="text-[11px] text-text-muted mb-1">수동 등록용 복사</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${title}\n\n${content}`);
                  setCopied("naver");
                  setTimeout(() => setCopied(""), 2000);
                  window.open("https://blog.naver.com/postwrite", "_blank");
                }}
                disabled={!content}
                className="w-full flex items-center justify-center gap-1.5 bg-green-600/20 border border-green-600/30 text-green-400 text-xs py-2 rounded-lg hover:bg-green-600/30 transition disabled:opacity-50"
              >
                {copied === "naver" ? <><CheckCircle size={12} /> 복사됨!</> : <><Copy size={12} /> Naver 블로그용 복사</>}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${title}\n\n${content}`);
                  setCopied("brunch");
                  setTimeout(() => setCopied(""), 2000);
                  window.open("https://brunch.co.kr/write", "_blank");
                }}
                disabled={!content}
                className="w-full flex items-center justify-center gap-1.5 bg-gray-600/20 border border-gray-600/30 text-gray-300 text-xs py-2 rounded-lg hover:bg-gray-600/30 transition disabled:opacity-50"
              >
                {copied === "brunch" ? <><CheckCircle size={12} /> 복사됨!</> : <><Copy size={12} /> Brunch용 복사</>}
              </button>
            </div>

            {(!tistoryReady || !bloggerReady) && (
              <a
                href="/admin/settings"
                className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline mt-2"
              >
                <ExternalLink size={10} /> API 설정하기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
