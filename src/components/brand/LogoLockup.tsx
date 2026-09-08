import { COMPANY } from "@/config/company";

/**
 * 가로형 로고 — DESIGN.md §3.4
 *
 * 청룡언월도가 가로로 지나가고 그 위에 명조 워드마크가 얹힌다.
 * 브랜드를 제대로 보여주는 자리에만 쓴다 (홈 상단 띠, /about).
 * 헤더처럼 작은 자리에는 [[Wordmark]] 를 쓴다 — 이걸 36px 로 줄이면
 * 용머리와 손잡이 금테가 뭉친다.
 *
 * ## 왜 컴포넌트가 아니라 정적 파일인가
 *
 * 워드마크가 서체가 아니라 윤곽선이라 path 데이터가 17KB 다. 이걸
 * React 컴포넌트로 두면 그 17KB 가 **페이지마다** HTML 에 다시 실린다.
 * 정적 SVG 파일로 두면 브라우저가 한 번 받아 캐시한다.
 *
 * 대신 페이지의 색 토큰을 따라가지 못한다 (파일 안에 색이 굳어 있다).
 * MVP 는 라이트 테마로 확정했으므로 문제되지 않는다. 다크 테마를 하면
 * 어두운 배경용 파일을 하나 더 뽑는다 (DESIGN.md §3.4 절차).
 */
export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/lockup.svg"
      alt={COMPANY.serviceName}
      width={900}
      height={240}
      className={`h-auto ${className}`}
    />
  );
}
