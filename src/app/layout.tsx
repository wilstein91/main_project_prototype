import type { Metadata } from "next";
import "./globals.css";
import { COMPANY, displayServiceName } from "@/config/company";

/**
 * 서비스명은 항상 config/company.ts 를 경유한다 (F-410).
 * 문자열을 직접 쓰지 않는다 — 상호 확정 시 한 곳만 고치면 되도록.
 *
 * 폰트: Pretendard 를 self-host 할 예정이며(T-03 잔여),
 * 파일 추가 전까지는 globals.css 의 시스템 한글 폰트로 대체된다.
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
