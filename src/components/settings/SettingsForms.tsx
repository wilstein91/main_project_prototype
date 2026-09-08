"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/lib/actions/auth";
import { updateNicknameAction, withdrawAction } from "@/lib/actions/profile";
import { idle } from "@/lib/actions/result";
import { Field, Input } from "@/components/ui/Field";
import { FieldError, FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";

/** 닉네임 변경 (F-106) — 30일 1회 */
export function NicknameForm({
  current,
  blockedUntil,
}: {
  current: string;
  blockedUntil: string | null;
}) {
  const [state, action] = useActionState(updateNicknameAction, idle);
  const locked = Boolean(blockedUntil);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormFeedback state={state} />
      <Field
        label="닉네임"
        hint={
          locked
            ? `${blockedUntil} 이후에 다시 변경할 수 있습니다.`
            : "2~12자, 한글·영문·숫자. 30일에 한 번 변경할 수 있습니다."
        }
      >
        <Input
          name="nickname"
          maxLength={12}
          defaultValue={current}
          disabled={locked}
          required
        />
        <FieldError state={state} name="nickname" />
      </Field>
      <div>
        <SubmitButton size="sm" disabled={locked} pendingLabel="변경 중…">
          변경
        </SubmitButton>
      </div>
    </form>
  );
}

/** 비밀번호 변경 */
export function PasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, idle);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormFeedback state={state} />
      <Field
        label="새 비밀번호"
        hint="10자 이상, 영문·숫자·특수문자 중 2종 이상"
      >
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          required
        />
        <FieldError state={state} name="password" />
      </Field>
      <div>
        <SubmitButton size="sm" pendingLabel="변경 중…">
          변경
        </SubmitButton>
      </div>
    </form>
  );
}

/** 회원 탈퇴 (F-107) */
export function WithdrawForm() {
  const [state, action] = useActionState(withdrawAction, idle);

  if (state.ok) return <FormFeedback state={state} />;

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm(
          "탈퇴하시겠습니까?\n계정이 비활성화되고, 작성한 글은 '탈퇴한 사용자'로 표기됩니다.",
        );
        if (!ok) e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <FormFeedback state={state} />
      <div>
        <SubmitButton variant="danger" size="sm" pendingLabel="처리 중…">
          회원 탈퇴
        </SubmitButton>
      </div>
    </form>
  );
}
