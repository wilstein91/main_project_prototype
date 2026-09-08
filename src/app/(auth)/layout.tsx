import Link from "next/link";
import { DevAuthBanner } from "@/components/layout/DevAuthBanner";
import { COMPANY } from "@/config/company";
import { FOOTER_NOTICE } from "@/config/legal";

/** 인증 화면은 사이드바·하단 탭 없이 폼에 집중시킨다. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <DevAuthBanner />
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-md items-center px-5">
          <Link
            href="/"
            className="text-[17px] font-extrabold tracking-tight text-ink"
          >
            {COMPANY.serviceName}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-10">
        <p className="text-[12px] leading-relaxed text-ink-sub">
          {FOOTER_NOTICE.serviceNature}
        </p>
      </footer>
    </div>
  );
}
