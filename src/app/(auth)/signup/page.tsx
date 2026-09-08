import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { AGREEMENTS } from "@/config/legal";

export const metadata = { title: "회원가입" };

/**
 * 회원가입 (F-101 / F-102)
 * 약관 동의는 이용약관·개인정보·투자 유의사항 3종이 필수다.
 */
export default function SignupPage() {
  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">회원가입</h1>
      <p className="mb-6 text-meta text-ink-sub">
        이메일 인증 후 이용할 수 있습니다.
      </p>

      <PendingNotice ticket="T-11" />

      <form className="flex flex-col gap-4">
        <Field label="이메일" required hint="인증 메일이 발송됩니다.">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled
          />
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
            disabled
          />
        </Field>

        <Field
          label="닉네임"
          required
          hint="2~12자, 한글·영문·숫자. 다른 회원과 중복될 수 없습니다."
        >
          <Input name="nickname" maxLength={12} disabled />
        </Field>

        <fieldset className="mt-2 flex flex-col gap-2.5 rounded-[var(--radius-md)] bg-surface px-4 py-4">
          <legend className="sr-only">약관 동의</legend>
          {AGREEMENTS.map((a) => (
            <label
              key={a.key}
              className="flex items-center gap-2.5 text-meta text-ink"
            >
              <input
                type="checkbox"
                name={a.key}
                disabled
                className="size-4 shrink-0 accent-[var(--color-brand)]"
              />
              <span className="flex-1">
                <span
                  className={
                    a.required
                      ? "font-semibold text-ink"
                      : "text-ink-sub"
                  }
                >
                  [{a.required ? "필수" : "선택"}]
                </span>{" "}
                {a.label}
              </span>
              {"href" in a && a.href && (
                <Link
                  href={a.href}
                  className="shrink-0 text-[12px] text-ink-sub underline"
                >
                  보기
                </Link>
              )}
            </label>
          ))}
        </fieldset>

        <Button type="submit" className="mt-2" disabled>
          가입하기
        </Button>
      </form>

      <p className="mt-6 text-center text-meta text-ink-sub">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-brand">
          로그인
        </Link>
      </p>
    </div>
  );
}
