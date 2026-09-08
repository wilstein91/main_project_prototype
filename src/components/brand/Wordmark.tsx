import { COMPANY } from "@/config/company";
import { BladeMark } from "./BladeMark";

/**
 * 워드마크 — DESIGN.md §3.2
 *
 * 서체를 따로 쓰지 않는다. Pretendard Black(900) 에 자간을 조여
 * 만화 제목의 단단한 느낌을 낸다. 마크는 왼쪽에 작게 한 번만.
 */
export function Wordmark({
  size = "md",
  showTentative = true,
}: {
  size?: "sm" | "md" | "lg";
  /** 가칭 표기를 함께 보일지 */
  showTentative?: boolean;
}) {
  const spec = {
    sm: { mark: 18, text: "text-[16px]" },
    md: { mark: 26, text: "text-[19px]" },
    lg: { mark: 34, text: "text-[28px]" },
  }[size];

  return (
    <span className="flex min-w-0 items-center gap-2">
      <BladeMark size={spec.mark} className="shrink-0" />
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span
          className={`truncate font-black tracking-[-0.02em] text-ink ${spec.text}`}
        >
          {COMPANY.serviceName}
        </span>
        {showTentative && COMPANY.isTentativeName && (
          <span className="hidden shrink-0 text-[11px] font-medium text-ink-sub sm:inline">
            가칭
          </span>
        )}
      </span>
    </span>
  );
}
