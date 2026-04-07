"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Car, Footprints, Bus } from "lucide-react";

const STORE = {
  name: "한국금거래소 안성공도점",
  address: "경기도 안성시 공도읍 진건중길 4",
  phone: "010-2645-3745",
  hours: "연중무휴 10:30~19:30",
  lat: 37.0081,
  lng: 127.1864,
};

const TRANSPORT_OPTIONS = [
  { key: "CAR", label: "자동차", icon: Car },
  { key: "PUBLICTRANSIT", label: "대중교통", icon: Bus },
  { key: "FOOT", label: "도보", icon: Footprints },
] as const;

export default function DirectionsPage() {
  const [origin, setOrigin] = useState("");

  function openKakaoMap(transportType: string) {
    if (!origin.trim()) {
      alert("출발지 주소를 입력해주세요.");
      return;
    }
    const sName = encodeURIComponent(origin.trim());
    const eName = encodeURIComponent(STORE.address);
    const url = `https://map.kakao.com/?map_type=TYPE_MAP&target=walk&sName=${sName}&eName=${eName}`;
    // 카카오맵 길찾기 URL (이동수단은 카카오맵 웹에서 전환 가능)
    window.open(url, "_blank");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 페이지 타이틀 */}
      <h1 className="text-2xl md:text-3xl font-bold text-gold mb-8 text-center">
        오시는 길
      </h1>

      {/* 매장 정보 카드 */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">{STORE.name}</h2>
        <div className="space-y-3 text-sm text-text-muted">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gold mt-0.5 shrink-0" />
            <span>{STORE.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-gold shrink-0" />
            <a href={`tel:${STORE.phone}`} className="hover:text-gold transition">
              {STORE.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gold shrink-0" />
            <span>{STORE.hours}</span>
          </div>
        </div>
      </div>

      {/* 카카오맵 지도 */}
      <div className="rounded-xl overflow-hidden border border-dark-border mb-8">
        <iframe
          src={`https://map.kakao.com/link/map/${encodeURIComponent(STORE.name)},${STORE.lat},${STORE.lng}`}
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="매장 위치 지도"
        />
      </div>

      {/* 길찾기 섹션 */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">길찾기</h2>

        {/* 출발지 입력 */}
        <div className="mb-6">
          <label htmlFor="origin" className="block text-sm text-text-muted mb-2">
            출발지 주소를 입력하세요
          </label>
          <input
            id="origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="예: 서울역, 안성터미널, 평택역..."
            className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-gold transition"
            onKeyDown={(e) => {
              if (e.key === "Enter") openKakaoMap("CAR");
            }}
          />
        </div>

        {/* 이동수단 버튼 */}
        <div className="grid grid-cols-3 gap-3">
          {TRANSPORT_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => openKakaoMap(key)}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-dark-border bg-dark hover:border-gold hover:bg-gold/10 transition group"
            >
              <Icon
                size={28}
                className="text-text-muted group-hover:text-gold transition"
              />
              <span className="text-sm text-text-muted group-hover:text-gold transition">
                {label}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-text-muted mt-4 text-center">
          버튼 클릭 시 카카오맵에서 상세 경로와 소요시간을 확인할 수 있습니다
        </p>
      </div>

      {/* 참고 정보 */}
      <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">교통 안내</h2>
        <div className="space-y-4 text-sm text-text-muted">
          <div>
            <h3 className="text-gold font-medium mb-1">자가용</h3>
            <p>네비게이션에 &quot;한국금거래소 안성공도점&quot; 또는 &quot;경기도 안성시 공도읍 진건중길 4&quot; 검색</p>
            <p>매장 앞 주차 가능</p>
          </div>
          <div>
            <h3 className="text-gold font-medium mb-1">대중교통</h3>
            <p>진사리입구 버스정류장 바로 앞</p>
          </div>
        </div>
      </div>
    </div>
  );
}
