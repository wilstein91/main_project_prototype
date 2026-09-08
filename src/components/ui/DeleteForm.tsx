"use client";

import { useFormStatus } from "react-dom";

/**
 * 삭제 버튼. 실수 방지를 위해 확인을 받는다.
 *
 * 삭제는 소프트 삭제지만 사용자에게는 되돌릴 수 없는 행위로 보이므로
 * 확인 단계를 둔다 (본인 글은 복구 UI 가 없다).
 */
export function DeleteForm({
  action,
  hidden,
  confirmMessage,
  label = "삭제",
  className = "",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string | number>;
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className="inline"
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <DeleteButton label={label} className={className} />
    </form>
  );
}

function DeleteButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`font-semibold text-danger disabled:opacity-40 ${className}`}
    >
      {pending ? "삭제 중…" : label}
    </button>
  );
}
