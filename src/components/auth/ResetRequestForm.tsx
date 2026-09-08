"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { idle } from "@/lib/actions/result";
import { Field, Input } from "@/components/ui/Field";
import { FieldError, FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * 비밀번호 재설정 요청 (F-104).
 * 응답은 계정 존재 여부를 노출하지 않는다 — 액션이 항상 같은 문구를 돌려준다.
 */
export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idle);

  if (state.ok) return <FormFeedback state={state} />;

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormFeedback state={state} />
      <Field label="이메일" required>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <FieldError state={state} name="email" />
      </Field>
      <SubmitButton pendingLabel="발송 중…">
        재설정 링크 받기
      </SubmitButton>
    </form>
  );
}
