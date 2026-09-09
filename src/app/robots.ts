import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // 정식 오픈 전에는 전체 차단. 검토 전 법적 고지문과 미확정 사업자 정보가
  // 색인되는 것을 막는다 (lib/site.ts 주석 참고).
  if (!ALLOW_INDEXING) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const disallow = ["/admin", "/settings", "/write", "/auth/"];

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
