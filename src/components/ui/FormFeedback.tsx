import type { ActionState } from "@/lib/actions/result";

/** 폼 상단 결과 메시지. 색만으로 상태를 전달하지 않는다. */
export function FormFeedback({ state }: { state: ActionState }) {
  if (!state.message) return null;

  const ok = state.ok;
  return (
    <p
      role="status"
      aria-live="polite"
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
