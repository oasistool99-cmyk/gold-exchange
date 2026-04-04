import { MetadataRoute } from "next";
import { getAdminClient } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://goldo-hazel.vercel.app";
  const db = getAdminClient();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/directions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 카테고리 페이지
  const { data: categories } = await db
    .from("categories")
    .select("slug");

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(
    (cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // 블로그 글
  const { data: posts } = await db
    .from("posts")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...postPages];
}
