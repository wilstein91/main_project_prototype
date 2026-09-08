"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 모바일 하단 탭 — 4개를 넘기지 않는다 (PRD §6.1).
 * 글쓰기 탭은 비회원에게도 노출한다. 숨기지 않고 로그인으로 보내
 * 가입 유도 지점으로 쓴다 (PRD §5).
 */
const TABS = [
  { href: "/", label: "홈", icon: HomeIcon, match: (p: string) => p === "/" },
  {
    href: "/c/free",
    label: "게시판",
    icon: BoardIcon,
    match: (p: string) => p.startsWith("/c/"),
  },
  {
    href: "/write",
    label: "글쓰기",
    icon: WriteIcon,
    match: (p: string) => p === "/write",
  },
  {
    href: "/settings",
    label: "내정보",
    icon: MeIcon,
    match: (p: string) => p === "/settings" || p === "/login",
  },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/97 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`tap flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-brand" : "text-ink-sub"
                }`}
              >
                <Icon />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function HomeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 10.5 12 3.5l9 7" />
      <path d="M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M7.5 9h9M7.5 12.5h9M7.5 16h5" />
    </svg>
  );
}

function WriteIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 20h16" />
      <path d="M6 16.5 17 5.5a2.1 2.1 0 0 1 3 3L9 19.5l-4 .5.5-4Z" />
    </svg>
  );
}

function MeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4" />
    </svg>
  );
}
