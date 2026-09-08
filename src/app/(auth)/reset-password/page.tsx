import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PendingNotice } from "@/components/ui/PendingNotice";

export const metadata = { title: "비밀번호 재설정" };

/**
 * 비밀번호 재설정 (F-104)
 * 응답은 계정 존재 여부를 노출하지 않는다 — 항상 같은 안내를 보여준다.
 */
export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">비밀번호 재설정</h1>
      <p className="mb-6 text-meta leading-relaxed text-ink-sub">
        가입한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
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
        <Button type="submit" className="mt-2" disabled>
          재설정 링크 받기
        </Button>
      </form>

      <p className="mt-6 text-center text-meta">
        <Link href="/login" className="text-ink-sub hover:text-brand">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
