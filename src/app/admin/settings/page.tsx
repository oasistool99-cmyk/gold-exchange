"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { Save, ExternalLink, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [tistoryToken, setTistoryToken] = useState("");
  const [tistoryBlog, setTistoryBlog] = useState("");
  const [bloggerApiKey, setBloggerApiKey] = useState("");
  const [bloggerBlogId, setBloggerBlogId] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const s = data.settings || {};
        setTistoryToken(s.tistory_access_token || "");
        setTistoryBlog(s.tistory_blog_name || "");
        setBloggerApiKey(s.blogger_api_key || "");
        setBloggerBlogId(s.blogger_blog_id || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            tistory_access_token: tistoryToken,
            tistory_blog_name: tistoryBlog,
            blogger_api_key: bloggerApiKey,
            blogger_blog_id: bloggerBlogId,
          },
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-3xl mx-auto px-4 py-10 text-center text-text-muted">불러오는 중...</div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-xl font-serif font-bold text-white mb-6">외부 블로그 설정</h1>

        <div className="space-y-6">
          {/* Tistory */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">T</div>
              <h2 className="text-base font-semibold text-white">Tistory</h2>
              {tistoryBlog && (
                <span className="text-[11px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} /> 연동됨
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">블로그 이름</label>
                <input
                  type="text"
                  value={tistoryBlog}
                  onChange={(e) => setTistoryBlog(e.target.value)}
                  placeholder="예: myblog (myblog.tistory.com)"
                  className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
              <div className="bg-dark rounded-lg p-3 border border-dark-border">
                <p className="text-xs text-text-muted mb-2">
                  Tistory Open API가 종료되어 <strong className="text-text">Puppeteer 자동화</strong> 방식으로 발행합니다.
                </p>
                <p className="text-xs text-text-muted mb-1">터미널에서 아래 명령어로 실행:</p>
                <code className="block text-xs text-gold bg-dark-card px-2 py-1.5 rounded mt-1">
                  node scripts/publish-to-tistory.js
                </code>
                <p className="text-[11px] text-text-muted mt-2">
                  * .env.local에 TISTORY_ID, TISTORY_PW 설정 필요
                </p>
              </div>
              <a
                href={`https://${tistoryBlog || "creator92113"}.tistory.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                <ExternalLink size={11} /> 블로그 바로가기
              </a>
            </div>
          </div>

          {/* Blogger */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">B</div>
              <h2 className="text-base font-semibold text-white">Blogger</h2>
              {bloggerApiKey && bloggerBlogId && (
                <span className="text-[11px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} /> 연동됨
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">API Key</label>
                <input
                  type="password"
                  value={bloggerApiKey}
                  onChange={(e) => setBloggerApiKey(e.target.value)}
                  placeholder="Google Blogger API Key"
                  className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Blog ID</label>
                <input
                  type="text"
                  value={bloggerBlogId}
                  onChange={(e) => setBloggerBlogId(e.target.value)}
                  placeholder="Blogger Blog ID (숫자)"
                  className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
              <a
                href="https://console.cloud.google.com/apis/library/blogger.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                <ExternalLink size={11} /> Google API 콘솔에서 Blogger API 활성화
              </a>
            </div>
          </div>

          {/* 안내 */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-2">Naver 블로그 / Brunch</h2>
            <p className="text-sm text-text-muted">
              네이버 블로그와 브런치는 공식 글 작성 API를 제공하지 않습니다.
              글 작성 화면에서 &quot;내용 복사&quot; 버튼을 사용하여 수동으로 등록할 수 있습니다.
            </p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gold text-dark px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "저장 중..." : "설정 저장"}
            </button>
            {saved && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle size={14} /> 저장되었습니다
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
