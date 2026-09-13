import Link from "next/link";
import { DevAuthBanner } from "@/components/layout/DevAuthBanner";
import { Wordmark } from "@/components/brand/Wordmark";
import { FOOTER_NOTICE } from "@/config/legal";

/** 인증 화면은 사이드바·하단 탭 없이 폼에 집중시킨다. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <DevAuthBanner />
      <header className="border-b border-gold-dim bg-canvas/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-md items-center px-4 lg:px-6">
          <Link href="/">
            <Wordmark size="sm" showTentative={false} />
          </Link>
        </div>
      </header>

      {/*
        * 폼은 금테 패널 안에 넣는다. 배경 그림 위에 폼이 바로 있으면
        * 입력칸 글자와 그림이 섞인다 (DESIGN.md §10.9).
        */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 lg:px-6">
        <div className="panel px-5 py-7 lg:px-7">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-md px-4 pb-10 lg:px-6">
        <p className="text-[12px] leading-relaxed text-ink-sub">
          {FOOTER_NOTICE.serviceNature}
        </p>
      </footer>
    </div>
  );
}
