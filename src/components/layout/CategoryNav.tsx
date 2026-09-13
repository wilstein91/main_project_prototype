"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types/db";

/**
 * 카테고리 하나의 축으로 정리한다 (PRD §6).
 * 같은 데이터를 PC 는 사이드바, 모바일은 가로 스크롤 칩으로 배치한다.
 *
 * ## 게시판 링크는 글자가 아니라 그림이다 (v1.3)
 *
 * PC 사이드바의 각 항목은 **그 게시판을 그린 그림**이고, 그 위에 명조로
 * 이름을 얹는다. 글자에 링크를 거는 것과 그림 전체가 링크인 것은 다르다 —
 * 후자는 누를 곳이 넓고, 게시판마다 인상이 남는다 (DESIGN.md §10.9).
 *
 * 그림이 없으면 **양피지 판**으로 물러난다. 어두운 화면에서 메뉴만 밝으면
 * 어디를 눌러야 하는지가 한눈에 보인다.
 *
 * 모바일 칩도 같은 그림을 쓴다. 다만 높이가 44px 뿐이라 그라디언트 대신
 * **평평한 어둠막**을 깐다 — 좁은 자리에서 그라디언트를 쓰면 글자 뒤
 * 밝기가 들쭉날쭉해진다.
 *
 * 지금 보고 있는 항목은 `aria-current="page"` 를 함께 준다. 색과 밝기만으로
 * 상태를 전하지 않는다.
 */
export function CategoryNav({
  categories,
  variant,
  art = {},
}: {
  categories: Category[];
  variant: "sidebar" | "chips";
  /** 카테고리 slug → 그림 경로. 전체 피드는 빈 문자열 키를 쓴다 */
  art?: Record<string, string | null>;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeSlug = pathname.startsWith("/c/")
    ? pathname.split("/")[2]
    : undefined;

  const items = [
    { key: "", name: "전체", href: "/", active: isHome },
    ...categories.map((c) => ({
      key: c.slug,
      name: c.name,
      href: `/c/${c.slug}`,
      active: activeSlug === c.slug,
    })),
  ];

  if (variant === "chips") {
    return (
      <nav
        aria-label="게시판 카테고리"
        className="sticky top-16 z-20 border-b border-gold-dim bg-canvas/95 backdrop-blur lg:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => {
            const image = art[it.key];
            if (!image) {
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={it.active ? "page" : undefined}
                    className={`serif flex h-11 shrink-0 items-center px-4 text-[15px] font-bold whitespace-nowrap ${
                      it.active ? "paper-on" : "paper"
                    }`}
                  >
                    {it.name}
                  </Link>
                </li>
              );
            }
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={it.active ? "page" : undefined}
                  className={`relative flex h-11 shrink-0 items-center overflow-hidden rounded-[8px] border-2 px-4 ${
                    it.active ? "border-gold-lit" : "border-gold-dim"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    aria-hidden
                    className={`absolute inset-0 ${
                      it.active ? "bg-[#0d2320]/58" : "bg-[#0a0704]/55"
                    }`}
                  />
                  <span
                    className={`serif relative text-[15px] font-bold whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${
                      it.active ? "text-gold-lit" : "text-paper"
                    }`}
                  >
                    {it.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="게시판 카테고리" className="hidden lg:block">
      <p className="serif mb-3 px-1 text-[15px] font-bold tracking-wide text-gold">
        게시판
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((it) => {
          const image = art[it.key];

          if (!image) {
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={it.active ? "page" : undefined}
                  className={`serif flex h-12 items-center px-4 text-[17px] font-bold transition-[filter] ${
                    it.active ? "paper-on" : "paper hover:brightness-105"
                  }`}
                >
                  {it.name}
                </Link>
              </li>
            );
          }

          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={it.active ? "page" : undefined}
                className={`group relative flex h-[66px] items-end overflow-hidden rounded-[8px] border-2 transition-[filter,border-color] ${
                  it.active
                    ? "border-gold-lit brightness-110"
                    : "border-gold-dim hover:border-gold hover:brightness-110"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/*
                 * 글자를 받치는 어둠막. 그림 위에 바로 글자를 얹으면 밝은
                 * 부분(등불·달)과 획이 섞여 둘 다 안 읽힌다.
                 */}
                <span
                  aria-hidden
                  className={`absolute inset-0 ${
                    it.active
                      ? "bg-[linear-gradient(90deg,rgba(13,35,32,0.92)_0%,rgba(13,35,32,0.62)_60%,rgba(13,35,32,0.35)_100%)]"
                      : "bg-[linear-gradient(90deg,rgba(10,7,4,0.9)_0%,rgba(10,7,4,0.55)_60%,rgba(10,7,4,0.25)_100%)]"
                  }`}
                />
                <span
                  className={`serif relative px-3.5 pb-2.5 text-[17px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
                    it.active ? "text-gold-lit" : "text-paper"
                  }`}
                >
                  {it.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
