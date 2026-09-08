import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { isSeedMode } from "@/lib/data/queries";
import { safeInternalPath } from "@/lib/safe-path";
import { getViewer } from "@/lib/session";

export const metadata = { title: "로그인" };

/**
 * 인증 링크 실패 사유별 안내.
 * /auth/confirm · /auth/callback 이 reason 파라미터로 넘긴다.
 * 사용자가 다음에 무엇을 해야 하는지까지 알려준다.
 */
const REASONS: Record<string, string> = {
  verify_failed:
    "인증 링크가 만료되었거나 이미 사용되었습니다. 아래에서 메일을 다시 요청해 주세요.",
  no_token:
    "인증 정보가 링크에 담겨 있지 않습니다. 메일의 링크를 직접 눌러 주세요 (주소를 복사해 붙여넣으면 일부가 잘릴 수 있습니다).",
  no_code:
    "인증 정보가 링크에 담겨 있지 않습니다. 메일의 링크를 직접 눌러 주세요.",
  bad_type: "인증 링크 형식이 올바르지 않습니다.",
  exchange_failed:
    "인증을 시작한 브라우저와 링크를 연 브라우저가 다르면 실패할 수 있습니다. 같은 브라우저에서 다시 시도해 주세요.",
  upstream: "인증 서버가 요청을 거부했습니다. 잠시 후 다시 시도해 주세요.",
  not_configured: "서버 설정이 완료되지 않았습니다.",
};

const FALLBACK_REASON =
  "인증 링크가 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { redirect: redirectParam, error, reason } = await searchParams;

  const viewer = await getViewer();
  if (viewer) redirect("/");

  // 폼의 hidden 값으로 그대로 들어가므로 여기서도 검증한다
  const validated =
    typeof redirectParam === "string"
      ? safeInternalPath(redirectParam, "")
      : "";
  const target = validated || undefined;

  const message =
    error === "auth_callback"
      ? (typeof reason === "string" ? REASONS[reason] : undefined) ??
        FALLBACK_REASON
      : null;

  return (
    <div>
      <h1 className="mb-1 text-[24px] font-bold text-ink">로그인</h1>
      <p className="mb-6 text-meta text-ink-sub">
        글과 댓글을 쓰려면 로그인이 필요합니다.
      </p>

      {isSeedMode() && <PendingNotice ticket="Supabase 연결" />}

      {message && (
        <div
          role="alert"
          className="mb-5 rounded-[var(--radius-sm)] bg-danger/8 px-4 py-3 text-meta leading-relaxed text-danger"
        >
          <b className="font-bold">확인 필요</b> {message}
          <div className="mt-2">
            <Link
              href="/reset-password"
              className="font-semibold underline underline-offset-2"
            >
              메일 다시 받기
            </Link>
          </div>
        </div>
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
