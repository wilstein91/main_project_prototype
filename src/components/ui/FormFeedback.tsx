import type { ActionState } from "@/lib/actions/result";

/** 폼 상단 결과 메시지. 색만으로 상태를 전달하지 않는다. */
export function FormFeedback({ state }: { state: ActionState }) {
  if (!state.message) return null;

  const ok = state.ok;
  return (
    <p
      /* 성공은 조용히 알리고, 실패는 즉시 읽어 준다. 읽기 프로그램은
         role 로 이 둘을 구분한다 — 둘 다 status 면 오류를 놓친다. */
      role={ok ? "status" : "alert"}
      className={`rounded-[var(--radius-sm)] px-4 py-3 text-meta leading-relaxed ${
        ok
          ? "bg-brand-soft text-brand"
          : "bg-danger/8 text-danger"
      }`}
    >
      <b className="font-bold">{ok ? "완료" : "확인 필요"}</b> {state.message}
    </p>
  );
}

/** 필드 하단 오류 메시지 */
export function FieldError({
  state,
  name,
}: {
  state: ActionState;
  name: string;
}) {
  const msg = state.fieldErrors?.[name]?.[0];
  if (!msg) return null;
  return <span className="text-[12px] text-danger">{msg}</span>;
}
