import type { ReactNode } from "react";

/**
 * 빈 상태는 공백으로 두지 않는다 (TECH_SPEC §9.4).
 * 무엇이 없는지 알려주고 다음 행동을 제시한다.
 */
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-list font-semibold text-ink">{title}</p>
      {description && (
        <p className="max-w-xs text-meta leading-relaxed text-ink-sub">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
