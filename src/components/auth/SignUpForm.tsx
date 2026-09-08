"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/lib/actions/auth";
import { idle } from "@/lib/actions/result";
import { Field, Input } from "@/components/ui/Field";
import { FieldError, FormFeedback } from "@/components/ui/FormFeedback";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AGREEMENTS } from "@/config/legal";

/** 회원가입 (F-101 / F-102) */
export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, idle);

  // 가입 성공 후에는 폼을 비우고 안내만 남긴다 — 이메일 인증이 남았기 때문
  if (state.ok) {
    return (
      <div className="flex flex-col gap-5">
        <FormFeedback state={state} />
        <p className="text-meta leading-relaxed text-ink-sub">
          메일이 오지 않으면 스팸함을 확인해 주세요. 인증을 완료하면 로그인할
          수 있습니다.
        </p>
        <Link
          href="/login"
          className="text-meta font-semibold text-brand hover:underline"
        >
          로그인으로 이동
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormFeedback state={state} />

      <Field label="이메일" required hint="인증 메일이 발송됩니다.">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <FieldError state={state} name="email" />
      </Field>

      <Field
        label="비밀번호"
        required
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

      <Field
        label="닉네임"
        required
        hint="2~12자, 한글·영문·숫자. 다른 회원과 중복될 수 없습니다."
      >
        <Input name="nickname" maxLength={12} required />
        <FieldError state={state} name="nickname" />
      </Field>

      <fieldset className="mt-2 flex flex-col gap-2.5 rounded-[var(--radius-md)] bg-surface px-4 py-4">
        <legend className="sr-only">약관 동의</legend>
        {AGREEMENTS.map((a) => (
          <div key={a.key} className="flex flex-col gap-1">
            <label className="flex items-center gap-2.5 text-meta text-ink">
              <input
                type="checkbox"
                name={a.key}
                required={a.required}
                className="size-4 shrink-0 accent-[var(--color-brand)]"
              />
              <span className="flex-1">
                <span
                  className={
                    a.required ? "font-semibold text-ink" : "text-ink-sub"
                  }
                >
                  [{a.required ? "필수" : "선택"}]
                </span>{" "}
                {a.label}
              </span>
              {"href" in a && a.href && (
                <Link
                  href={a.href}
                  target="_blank"
                  className="shrink-0 text-[12px] text-ink-sub underline"
                >
                  보기
                </Link>
              )}
            </label>
            <FieldError state={state} name={a.key} />
          </div>
        ))}
      </fieldset>

      <SubmitButton className="mt-2" pendingLabel="가입 처리 중…">
        가입하기
      </SubmitButton>
    </form>
  );
}
