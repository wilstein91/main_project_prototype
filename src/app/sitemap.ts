import type { MetadataRoute } from "next";
import { isLive } from "@/config/features";
import { getCategories, getPosts } from "@/lib/data/queries";
import { SITE_URL } from "@/lib/site";

/**
 * sitemap — 게이트가 열린 경로만 포함한다 (F-411).
 * hidden / under_construction 은 제외되므로, 게이트를 live 로 바꾸면
 * 별도 작업 없이 sitemap 이 갱신된다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/disclaimer`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  for (const c of await getCategories()) {
    entries.push({
      url: `${SITE_URL}/c/${c.slug}`,
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  const { items } = await getPosts({ perPage: 500 });
  for (const p of items) {
    entries.push({
      url: `${SITE_URL}/c/${p.category_slug}/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  // 자문사 트랙은 게이트가 live 일 때만 노출한다.
  if (isLive("companyIntro")) {
    entries.push({ url: `${SITE_URL}/company`, priority: 0.4 });
  }
  if (isLive("advisoryIntro")) {
    entries.push({ url: `${SITE_URL}/advisory`, priority: 0.4 });
  }

  return entries;
}
