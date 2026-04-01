export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function excerpt(content: string, maxLength = 150): string {
  const text = content.replace(/<[^>]*>/g, "").replace(/\n+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
