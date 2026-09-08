import { COMPANY } from "@/config/company";
import { BladeMark } from "./BladeMark";

/**
 * 워드마크 — DESIGN.md §3.2
 *
 * ## 글자를 서체로 쓰지 않고 윤곽선으로 쓴다
 *
 * 처음에는 Pretendard Black 에 자간을 조여 썼다. 깔끔하지만 '영웅호걸'
 * 이라는 이름과 어울리지 않았다. 삼국지 제목 같은 명조 계열이 맞다.
 *
 * 그런데 궁서체는 웹에 쓸 수 없다 (윈도우 궁서는 라이선스가 걸려 있고
 * 웹 임베드가 허용되지 않는다). 대신 **나눔명조 ExtraBold** 를 쓴다 —
 * SIL OFL 이라 웹 임베드와 윤곽선 변환이 모두 허용된다.
 *
 * 폰트 파일을 싣지는 않는다. 한글 명조 한 벌은 1~2MB 인데 로고 여섯 자
 * 때문에 그걸 받게 할 수는 없다. 그래서 여섯 자만 **윤곽선(path)으로
 * 변환해 정적 SVG 파일로** 뽑았다 (`public/logo/wordmark.svg`, 13KB).
 * 브라우저가 한 번 받아 캐시하고, 폰트 로딩 지연도 없다.
 *
 * 만드는 법은 DESIGN.md §3.4 에 적어 두었다. 이름이 바뀌면 그 절차를
 * 다시 돌려야 한다 — 여기서 글자를 고칠 수는 없다. 그게 이 방식의
 * 유일한 단점이다.
 */
export function Wordmark({
  size = "md",
  showTentative = true,
}: {
  size?: "sm" | "md" | "lg";
  /** 가칭 표기를 함께 보일지 */
  showTentative?: boolean;
}) {
  const spec = {
    sm: { mark: 20, word: 17 },
    md: { mark: 25, word: 21 },
    lg: { mark: 34, word: 29 },
  }[size];

  return (
    <span className="flex min-w-0 items-center gap-2">
      <BladeMark size={spec.mark} className="shrink-0" />
      <span className="flex min-w-0 items-center gap-1.5">
        {/*
         * next/image 를 쓰지 않는다. SVG 는 최적화 대상이 아니고,
         * next/image 로 SVG 를 넣으려면 dangerouslyAllowSVG 를 켜야 한다.
         * 로고 하나 때문에 그 설정을 열 이유가 없다.
         */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/wordmark.svg"
          alt={COMPANY.serviceName}
          height={spec.word}
          style={{ height: spec.word }}
          className="w-auto max-w-full shrink-0"
        />
        {showTentative && COMPANY.isTentativeName && (
          <span className="hidden shrink-0 text-[11px] font-medium text-ink-sub sm:inline">
            가칭
          </span>
        )}
      </span>
    </span>
  );
}
