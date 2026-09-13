import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import { COMPANY } from "@/config/company";
import { ButtonLink } from "@/components/ui/Button";
import { displayServiceName } from "@/config/company";
import { getViewer } from "@/lib/session";

export async function Header() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-30 border-b border-gold-dim bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 lg:h-[104px] lg:px-6">
        {/*
          * 청룡언월도는 워드마크 **뒤**에 깔린다. 옆에 두면 로고가 둘로
          * 보이고, 뒤에 두면 글자가 무기 위에 새겨진 현판이 된다.
          * 글자 쪽은 세 겹(외곽선+금테+채움)이라 그림 위에서도 읽힌다.
          */}
        {/*
          * 로고는 **한 장**이다 — 청룡언월도 위에 글자를 얹어 파일에
          * 박제했다 (scripts/build_lockup.py). CSS 로 겹치면 화면 폭에
          * 따라 어긋나고 좁은 화면에서는 결국 무기를 숨기게 되는데,
          * 그러면 모바일에서만 로고가 달라진다. 지금은 높이만 조절한다.
          */}
        <Link
          href="/"
          aria-label={displayServiceName()}
          className="relative flex min-w-0 shrink items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/lockup.svg"
            alt={COMPANY.serviceName}
            className="h-10 w-auto max-w-full shrink-0 lg:h-[78px]"
          />
          {COMPANY.isTentativeName && (
            <span
              /*
               * 로고 상자의 **오른쪽 아래 모서리**에 얹는다. 옆이나 아래에
               * 두면 자리를 차지해 좁은 화면에서 숨기게 되는데, 헤더 병기는
               * PRD §3.7 의 요구라 뺄 수 없다. 모서리는 자루 끝 바깥이라
               * 배경이 단순해서 배경 상자 없이도 읽힌다.
               */
              aria-hidden
              className="serif pointer-events-none absolute right-0 bottom-0 text-[9px]
                leading-none font-medium tracking-[0.2em] text-ink-sub/75 lg:text-[11px]"
            >
              가칭
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-1" aria-label="계정">
          {viewer ? (
            <>
              <Link
                href="/settings"
                className="hidden max-w-[10rem] truncate px-2 text-meta font-semibold text-ink-sub hover:text-brand sm:block"
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
    </header>
  );
}
