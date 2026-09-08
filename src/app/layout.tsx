import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { COMPANY, displayServiceName } from "@/config/company";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site";

/**
 * 서비스명은 항상 config/company.ts 를 경유한다 (F-410).
 * 문자열을 직접 쓰지 않는다 — 상호 확정 시 한 곳만 고치면 되도록.
 *
 * 폰트: Pretendard Variable 을 자체 호스팅한다 (fonts.css).
 * dynamic subset 이라 브라우저가 쓰인 문자 구간만 받는다.
 */
export const metadata: Metadata = {
  title: {
    default: `${displayServiceName()} — ${COMPANY.tagline}`,
    template: `%s | ${COMPANY.serviceName}`,
  },
  description: `${COMPANY.serviceName}은 개인 투자자들이 투자 정보와 의견을 나누는 커뮤니티입니다. 게시물은 작성자의 개인적 견해이며 투자자문이 아닙니다.`,
  openGraph: {
    siteName: COMPANY.serviceName,
    locale: "ko_KR",
    type: "website",
  },
  metadataBase: new URL(SITE_URL),
  /**
   * 정식 오픈 전에는 사이트 전체를 색인에서 제외한다.
   * robots.txt 만으로는 외부 링크를 통한 색인을 막지 못하므로
   * 메타 태그로도 함께 차단한다 (lib/site.ts 주석 참고).
   *
   * 개별 페이지가 자체 robots 를 지정하면 그쪽이 우선하므로,
   * /admin /settings 등은 이미 각자 noindex 를 갖고 있다.
   */
  robots: ALLOW_INDEXING ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
