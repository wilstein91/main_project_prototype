import Link from "next/link";
import type { ReactNode } from "react";
import { gate, type FeatureKey } from "@/config/features";
import { Badge } from "@/components/ui/Badge";

/**
 * 게이트 상태에 따른 링크 렌더링 — TECH_SPEC §9.7
 *
 *   live               → 일반 링크
 *   under_construction → 클릭 불가 + '준비 중' 배지
 *   hidden             → 렌더링하지 않음
 *
 * 비활성 시 <a> 를 쓰지 않는다. 죽은 링크에 키보드 포커스가
 * 걸리지 않게 role="link" + aria-disabled + tabIndex={-1} 로 둔다.
 */
export function GatedLink({
  featureKey,
  href,
  children,
  className = "",
}: {
  featureKey: FeatureKey;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const state = gate(featureKey);

  if (state === "hidden") return null;

  if (state === "under_construction") {
    return (
      <span
        role="link"
        aria-disabled="true"
        tabIndex={-1}
        title="설립 절차 완료 후 공개됩니다"
        className={`flex cursor-not-allowed items-center justify-between gap-2 text-ink-sub/70 ${className}`}
      >
        <span>{children}</span>
        <Badge tone="muted">준비 중</Badge>
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
