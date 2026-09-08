import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import { ButtonLink } from "@/components/ui/Button";
import { COMPANY, displayServiceName } from "@/config/company";
import { getViewer } from "@/lib/session";

export async function Header() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 lg:h-16 lg:px-6">
        <Link href="/" className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[17px] font-extrabold tracking-tight text-ink lg:text-[19px]">
            {COMPANY.serviceName}
          </span>
          {COMPANY.isTentativeName && (
            <span className="hidden shrink-0 text-[11px] font-medium text-ink-sub sm:inline">
              가칭
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-1" aria-label="계정">
          {viewer ? (
            <>
              <Link
                href="/settings"
                className="hidden max-w-[10rem] truncate px-2 text-meta font-semibold text-ink hover:text-brand sm:block"
              >
                {viewer.nickname}
              </Link>
              {viewer.role === "admin" && (
                <ButtonLink href="/admin" variant="ghost" size="sm">
                  관리자
                </ButtonLink>
              )}
              <ButtonLink
                href="/write"
                size="sm"
                className="hidden lg:inline-flex"
              >
                글쓰기
              </ButtonLink>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="tap px-3 text-meta font-semibold text-ink-sub hover:text-ink"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                로그인
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                회원가입
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
      <span className="sr-only">{displayServiceName()}</span>
    </header>
  );
}
