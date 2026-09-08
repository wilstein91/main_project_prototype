/**
 * 형상 단계 안내 — 화면 구조는 잡혔으나 동작이 아직 연결되지 않은 곳에 둔다.
 * Supabase 연결(T-07~T-12) 후 해당 화면에서 제거한다.
 *
 * 사용자에게 "고장난 화면"으로 보이지 않게 하려는 장치이며,
 * 실서비스 배포 전에는 하나도 남아 있지 않아야 한다.
 */
export function PendingNotice({ ticket }: { ticket: string }) {
  return (
    <p className="mb-6 rounded-[var(--radius-sm)] border border-dashed border-line bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
      <b className="font-bold text-ink">개발 중</b> 화면 구조만 잡힌
      상태입니다. 실제 동작은 {ticket} 에서 연결됩니다.
    </p>
  );
}
