"use client";

import { useActionState, useState } from "react";
import { resendSignUpAction } from "@/lib/actions/auth";
import { idle } from "@/lib/actions/result";
import { Field, Input } from "@/components/ui/Field";
import { FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * 인증 메일 재발송.
 *
 * 메일이 오지 않는 상황은 대개 (1) 스팸함, (2) 기본 메일러의 발송 한도
 * 초과, (3) 이미 인증을 마친 계정 셋 중 하나다. 사용자가 직접 다시
 * 요청해 볼 수 있게 두고, 한도 초과면 그 사실을 그대로 알려준다.
 */
export function ResendConfirmForm({
  defaultEmail = "",
  compact = false,
}: {
  defaultEmail?: string;
  compact?: boolean;
}) {
  const [state, action] = useActionState(resendSignUpAction, idle);
  const [open, setOpen] = useState(!compact);

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tap -mx-2 px-2 text-meta font-semibold text-brand underline underline-offset-2"
      >
        메일이 오지 않았나요?
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormFeedback state={state} />
      {!state.ok && (
        <>
          {/* label 은 Field 가 input 을 감싸서 연결한다 — 따로 두면
              읽기 프로그램이 둘을 잇지 못한다 */}
          <Field label="가입한 이메일">
            <Input
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={defaultEmail}
              placeholder="you@example.com"
              required
            />
          </Field>
          <div className="flex justify-start">
            <SubmitButton
              variant="secondary"
              size="sm"
              pendingLabel="발송 중…"
            >
              인증 메일 다시 받기
            </SubmitButton>
          </div>
        </>
      )}
    </form>
  );
}
