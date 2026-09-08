import type { MetadataRoute } from "next";
import { isLive } from "@/config/features";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/settings", "/write"];

  // 게이트가 열리지 않은 자문사 경로는 크롤링 대상에서 제외한다.
  if (!isLive("companyIntro")) disallow.push("/company");
  if (!isLive("advisoryIntro")) disallow.push("/advisory");

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
