import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-dark-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex flex-col items-center leading-none text-[9px] tracking-widest text-text-muted">
                <span>KOREA</span>
                <span className="text-gold font-bold text-[10px]">GOLD</span>
                <span>EXCHANGE</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-gold font-bold font-serif">한국금거래소</span>
                <span className="text-text-muted text-xs">안성공도점</span>
              </div>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              안성에서 금, 은, 보석을 가장 정확한 시세로 거래하는 곳.
              실시간 국제 시세 반영, 투명한 매입가 공개.
            </p>
          </div>

          {/* 바로가기 */}
          <div>
            <h4 className="text-gold font-semibold mb-4 text-sm">카테고리</h4>
            <div className="flex flex-col gap-2">
              <Link href="/category/gold-price" className="text-sm text-text-muted hover:text-gold transition">
                금 시세
              </Link>
              <Link href="/category/precious-metals" className="text-sm text-text-muted hover:text-gold transition">
                귀금속 지식
              </Link>
              <Link href="/category/store-news" className="text-sm text-text-muted hover:text-gold transition">
                매장 소식
              </Link>
              <Link href="/category/events" className="text-sm text-text-muted hover:text-gold transition">
                이벤트
              </Link>
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="text-gold font-semibold mb-4 text-sm">연락처</h4>
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <a href="tel:010-2645-3745" className="hover:text-gold transition">
                📞 010-2645-3745
              </a>
              <span>📍 경기도 안성시 공도읍 진건중길 4</span>
              <span>⏰ 평일 10:30~19:30</span>
              <span>🔒 토요일 10:30~19:30</span>
              <a href="http://anseonggold.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">
                🌐 anseonggold.co.kr
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} 한국금거래소 안성공도점. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            사업자등록번호: 227-17-52931 | 대표: 조재성
          </p>
        </div>
      </div>
    </footer>
  );
}
