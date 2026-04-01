-- =============================================
-- 안성금거래소 블로그 DB 스키마
-- Supabase (PostgreSQL) 용
-- =============================================

-- 카테고리 테이블
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 글(포스트) 테이블
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 테이블
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT '관리자',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_categories_slug ON categories(slug);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 기본 카테고리 삽입
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('금 시세', 'gold-price', '금 시세 동향 및 분석', 1),
  ('귀금속 지식', 'precious-metals', '귀금속 관련 전문 지식', 2),
  ('매장 소식', 'store-news', '한국금거래소 안성공도점 소식', 3),
  ('이벤트', 'events', '이벤트 및 프로모션 안내', 4);

-- RLS (Row Level Security) 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (published 글만)
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

-- 서비스 역할(service_role)은 모든 작업 가능 (관리자 API용)
CREATE POLICY "Service role full access on posts"
  ON posts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role');
