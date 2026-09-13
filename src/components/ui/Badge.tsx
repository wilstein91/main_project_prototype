import type { ReactNode } from "react";

type Tone = "brand" | "gold" | "neutral" | "muted";

const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  /* 공지처럼 "운영자가 올린 것" 에만 쓴다. 금색을 아무 데나 쓰면
     금색이 아무 뜻도 없어진다 (DESIGN.md §10) */
  gold: "bg-gold-dim/35 text-gold-lit ring-1 ring-gold/40",
  neutral: "bg-surface-lit text-ink-sub",
  muted: "bg-line/60 text-ink-sub",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
