import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { isSeedMode } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";

export const metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { redirect: redirectParam, error } = await searchParams;

  const viewer = await getViewer();
  if (viewer) redirect("/");

  const target =
    typeof redirectParam === "string" && redirectParam.startsWith("/")
      ? redirectParam
      : undefined;

  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">로그인</h1>
      <p className="mb-6 text-meta text-ink-sub">
        글과 댓글을 쓰려면 로그인이 필요합니다.
      </p>

      {isSeedMode() && <PendingNotice ticket="Supabase 연결" />}

      {error === "auth_callback" && (
        <p
          role="status"
          className="mb-4 rounded-[var(--radius-sm)] bg-danger/8 px-4 py-3 text-meta leading-relaxed text-danger"
        >
          <b className="font-bold">확인 필요</b> 인증 링크가 만료되었거나
          올바르지 않습니다. 다시 시도해 주세요.
        </p>
      )}

      <SignInForm redirectTo={target} />

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
