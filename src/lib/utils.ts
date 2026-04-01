export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // 영문/숫자가 없으면 타임스탬프 기반 slug 생성
  if (!base) {
    return `post-${Date.now()}`;
  }
  return base;
}

export function excerpt(content: string, maxLength = 150): string {
  const text = content.replace(/<[^>]*>/g, "").replace(/\n+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
