import type { ReactNode } from "react";
import { BladeCrest } from "@/components/brand/BladeCrest";

/**
 * 빈 상태는 공백으로 두지 않는다 (TECH_SPEC §9.4).
 * 무엇이 없는지 알려주고 다음 행동을 제시한다.
 *
 * 삽화를 한 점 넣는다. 빈 목록은 사용자가 할 일이 없는 자리이고,
 * 브랜드가 말을 걸어도 방해가 되지 않는 몇 안 되는 자리다
 * (DESIGN.md §2). 옅게 깔아 문장보다 앞서지 않게 한다.
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
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <BladeCrest size={76} className="opacity-40" />
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
