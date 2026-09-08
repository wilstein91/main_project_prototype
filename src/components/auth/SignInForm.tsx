"use client";

import { useActionState } from "react";
import { signInAction } from "@/lib/actions/auth";
import { idle } from "@/lib/actions/result";
import { Field, Input } from "@/components/ui/Field";
import { FieldError, FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";

/** 로그인 (F-103). 성공 시 액션이 redirect 하므로 성공 분기가 없다. */
export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action] = useActionState(signInAction, idle);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormFeedback state={state} />
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

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

      <Field label="비밀번호" required>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
        <FieldError state={state} name="password" />
      </Field>

      <SubmitButton className="mt-2" pendingLabel="로그인 중…">
        로그인
      </SubmitButton>
    </form>
  );
}
