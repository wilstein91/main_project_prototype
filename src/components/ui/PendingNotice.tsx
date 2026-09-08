/**
 * 시드 모드 안내 — Supabase 키가 없어 동작이 연결되지 않은 곳에 둔다.
 * 키를 넣으면 자동으로 사라진다 (isSeedMode() 로 조건 렌더링).
 *
 * 사용자에게 "고장난 화면"으로 보이지 않게 하려는 장치이며,
 * 실서비스 배포 전에는 하나도 노출되지 않아야 한다.
 */
export function PendingNotice({ ticket }: { ticket: string }) {
  return (
    <p className="mb-6 rounded-[var(--radius-sm)] border border-dashed border-line bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
      <b className="font-bold text-ink">데이터베이스 미연결</b> 화면 구조는
      완성되었으나 저장이 되지 않습니다. <code>.env.local</code> 에 Supabase
      키를 넣으면 동작합니다. ({ticket})
    </p>
  );
}
