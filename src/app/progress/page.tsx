"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const PROGRESS_IMAGES = [
  { src: "/images/progress/progress-01.jpg", caption: "공사 전 매장 외관 (상가임대)" },
  { src: "/images/progress/progress-02.jpg", caption: "공사 전 내부 빈 공간" },
  { src: "/images/progress/progress-03.jpg", caption: "내부 철거 및 공사 시작" },
  { src: "/images/progress/progress-04.jpg", caption: "외부 유리창 작업" },
  { src: "/images/progress/progress-05.jpg", caption: "셔터 설치 완료" },
  { src: "/images/progress/progress-06.jpg", caption: "외부 공사 진행" },
  { src: "/images/progress/progress-07.jpg", caption: "내부 천장 목공 작업" },
  { src: "/images/progress/progress-08.jpg", caption: "외부에서 본 내부 공사" },
  { src: "/images/progress/progress-09.jpg", caption: "2026년 5월초 OPEN 현수막 설치" },
  { src: "/images/progress/progress-10.jpg", caption: "외부 간판 철골 구조물 작업" },
  { src: "/images/progress/progress-11.jpg", caption: "내부 페인트 작업" },
  { src: "/images/progress/store-exterior.jpg", caption: "완성 예상 매장 외관 (3D 렌더링)" },
];

export default function ProgressPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  function openLightbox(index: number) {
    setLightbox(index);
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    setLightbox(null);
    document.body.style.overflow = "";
  }

  function goPrev() {
    if (lightbox === null) return;
    setLightbox(lightbox === 0 ? PROGRESS_IMAGES.length - 1 : lightbox - 1);
  }

  function goNext() {
    if (lightbox === null) return;
    setLightbox(lightbox === PROGRESS_IMAGES.length - 1 ? 0 : lightbox + 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 페이지 타이틀 */}
      <div className="text-center mb-10">
        <span className="text-xs tracking-[0.3em] text-gold/70 uppercase">
          Construction Progress
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">
          매장 <span className="text-gold">공사 진행</span> 현황
        </h1>
        <p className="text-text-muted mt-3 text-sm">
          한국금거래소 안성공도점이 만들어지는 과정을 사진으로 확인하세요
        </p>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      {/* 갤러리 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROGRESS_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-dark-border hover:border-gold transition"
          >
            <img
              src={img.src}
              alt={img.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition">
              <span className="text-xs text-gold font-medium">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-white">{img.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 라이트박스 */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10"
          >
            <X size={28} />
          </button>

          {/* 이전 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 text-white/70 hover:text-white transition z-10"
          >
            <ChevronLeft size={36} />
          </button>

          {/* 이미지 */}
          <div
            className="max-w-4xl max-h-[80vh] px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={PROGRESS_IMAGES[lightbox].src}
              alt={PROGRESS_IMAGES[lightbox].caption}
              className="max-w-full max-h-[75vh] object-contain mx-auto rounded-lg"
            />
            <div className="text-center mt-4">
              <span className="text-gold text-sm font-medium">
                {lightbox + 1} / {PROGRESS_IMAGES.length}
              </span>
              <p className="text-white text-sm mt-1">
                {PROGRESS_IMAGES[lightbox].caption}
              </p>
            </div>
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 text-white/70 hover:text-white transition z-10"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </div>
  );
}
