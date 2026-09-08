"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-title font-bold text-ink">
        문제가 발생했습니다
      </h1>
      <p className="max-w-sm text-meta leading-relaxed text-ink-sub">
        일시적인 오류일 수 있습니다. 다시 시도해 주세요. 같은 화면이 계속
        나오면 잠시 후 다시 접속해 주세요.
      </p>
      <div className="mt-2 flex gap-2">
        <Button onClick={reset} variant="secondary">
          다시 시도
        </Button>
        <ButtonLink href="/">홈으로</ButtonLink>
      </div>
    </div>
  );
}
