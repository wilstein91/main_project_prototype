import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { isSeedMode } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";

export const metadata = { title: "회원가입" };

/** 회원가입 (F-101 / F-102) */
export default async function SignupPage() {
  const viewer = await getViewer();
  if (viewer) redirect("/");

  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">회원가입</h1>
      <p className="mb-6 text-meta text-ink-sub">
        이메일 인증 후 이용할 수 있습니다.
      </p>

      {isSeedMode() && <PendingNotice ticket="Supabase 연결" />}

      <SignUpForm />

      <p className="mt-6 text-center text-meta text-ink-sub">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-brand">
          로그인
        </Link>
      </p>
    </div>
  );
}
