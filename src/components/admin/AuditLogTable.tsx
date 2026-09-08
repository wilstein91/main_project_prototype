import { formatFullDate } from "@/lib/utils/date";

export interface AuditEntry {
  id: number;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  created_at: string;
  actor_nickname: string;
}

/** 사람이 읽는 행위 이름 */
const ACTION_LABEL: Record<string, string> = {
  delete_post: "글 삭제",
  delete_comment: "댓글 삭제",
};

/**
 * 관리자 행위 기록 (PRD D-4 / F-504).
 *
 * 관리자가 **타인의** 게시물을 지운 경우에만 기록된다. 본인 글 삭제는
 * 남기지 않는다 — 자기 글을 지우는 것은 감사 대상이 아니다.
 *
 * 이 화면이 있어야 "기록이 실제로 남는지" 를 확인할 수 있다
 * (TECH_SPEC §10.7 체크리스트).
 */
export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  return (
    <section>
      <h2 className="mb-1 text-list font-bold text-ink">감사 로그</h2>
      <p className="mb-2 text-[12px] text-ink-sub">
        관리자가 타인의 게시물을 삭제한 기록입니다. 본인 글 삭제는 남지
        않습니다.
      </p>

      {entries.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-line px-4 py-6 text-center text-meta text-ink-sub">
          기록이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-md)] border border-line">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-meta">
              <span className="w-32 shrink-0 text-ink-sub">
                {formatFullDate(e.created_at)}
              </span>
              <span className="font-semibold text-ink">{e.actor_nickname}</span>
              <span className="text-danger">
                {ACTION_LABEL[e.action] ?? e.action}
              </span>
              <span className="text-ink-sub">
                {e.target_type} #{e.target_id}
              </span>
              {e.reason && (
                <span className="text-ink-sub">— {e.reason}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
