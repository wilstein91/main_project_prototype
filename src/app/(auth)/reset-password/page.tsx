import Link from "next/link";
import { ResetRequestForm } from "@/components/auth/ResetRequestForm";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { isSeedMode } from "@/lib/data/queries";

export const metadata = { title: "비밀번호 재설정" };

/**
 * 비밀번호 재설정 요청 (F-104).
 * 메일 링크는 /auth/callback?next=/settings 로 돌아와 세션을 만들고,
 * 설정 화면에서 새 비밀번호를 입력한다.
 */
export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">비밀번호 재설정</h1>
      <p className="mb-6 text-meta leading-relaxed text-ink-sub">
        가입한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다. 링크를
        누르면 새 비밀번호를 설정할 수 있습니다.
      </p>

      {isSeedMode() && <PendingNotice ticket="Supabase 연결" />}

      <ResetRequestForm />

      <p className="mt-6 text-center text-meta">
        <Link href="/login" className="text-ink-sub hover:text-brand">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
