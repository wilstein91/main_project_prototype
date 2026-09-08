import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PendingNotice } from "@/components/ui/PendingNotice";

export const metadata = { title: "로그인" };

/** 로그인 (F-103) */
export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">로그인</h1>
      <p className="mb-6 text-meta text-ink-sub">
        글과 댓글을 쓰려면 로그인이 필요합니다.
      </p>

      <PendingNotice ticket="T-12" />

      <form className="flex flex-col gap-4">
        <Field label="이메일" required>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled
          />
        </Field>

        <Field label="비밀번호" required>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            disabled
          />
        </Field>

        <Button type="submit" className="mt-2" disabled>
          로그인
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-meta">
        <Link href="/reset-password" className="text-ink-sub hover:text-brand">
          비밀번호를 잊으셨나요?
        </Link>
        <Link href="/signup" className="font-semibold text-brand">
          회원가입
        </Link>
      </div>
    </div>
  );
}
