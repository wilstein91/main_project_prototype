import type { ReactNode } from "react";

type Tone = "brand" | "neutral" | "muted";

const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  neutral: "bg-surface text-ink-sub",
  muted: "bg-line/50 text-ink-sub",
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
