"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types/db";

/**
 * 카테고리 하나의 축으로 정리한다 (PRD §6).
 * 같은 데이터를 PC 는 사이드바, 모바일은 가로 스크롤 칩으로 배치한다.
 */
export function CategoryNav({
  categories,
  variant,
}: {
  categories: Category[];
  variant: "sidebar" | "chips";
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeSlug = pathname.startsWith("/c/")
    ? pathname.split("/")[2]
    : undefined;

  const items = [
    { slug: undefined, name: "전체", href: "/", active: isHome },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      href: `/c/${c.slug}`,
      active: activeSlug === c.slug,
    })),
  ];

  if (variant === "chips") {
    return (
      <nav
        aria-label="게시판 카테고리"
        className="sticky top-14 z-20 border-b border-line bg-canvas lg:hidden"
      >
        <ul className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={it.active ? "page" : undefined}
                className={`flex h-9 shrink-0 items-center rounded-full px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors ${
                  it.active
                    ? "bg-brand-soft text-brand"
                    : "text-ink-sub hover:bg-surface"
                }`}
              >
                {it.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="게시판 카테고리" className="hidden lg:block">
      <p className="px-3 pb-2 text-[12px] font-bold tracking-wide text-ink-sub">
        게시판
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`flex h-10 items-center rounded-[var(--radius-sm)] px-3 text-list font-semibold transition-colors ${
                it.active
                  ? "bg-brand-soft text-brand"
                  : "text-ink-sub hover:bg-surface hover:text-ink"
              }`}
            >
              {it.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
