import { COMPANY } from "@/config/company";

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
 *
 * ## 글자는 세 겹이다 (v1.3)
 *
 * 헤더에서 **청룡언월도 그림 위에 얹히므로** 글자만 있으면 묻힌다.
 * 어두운 외곽선 + 금테 + 크림 채움으로 그려 어떤 그림 위에서도 형태가
 * 남게 했다 (scripts/build_logo.py 의 COLORS).
 *
 * 앞에 붙어 있던 인장은 뺐다 — 워드마크가 이미 이름을 말하는데 그 앞에
 * 또 다른 표식이 붙으면 무엇이 로고인지 흐려진다.
 */
export function Wordmark({
  size = "md",
  showTentative = true,
}: {
  size?: "sm" | "md" | "lg";
  /** 가칭 표기를 함께 보일지 */
  showTentative?: boolean;
}) {
  /*
   * 글자가 주인공이다. 헤더에서는 뒤에 깔린 청룡언월도(56px)보다 작으면
   * 무기가 먼저 읽히므로, PC 에서 한 단계 키운다.
   */
  const cls = {
    sm: "h-[19px]",
    md: "h-[26px] lg:h-[38px]",
    lg: "h-[32px] lg:h-[42px]",
  }[size];

  return (
    <span className="flex min-w-0 items-center">
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
          className={`w-auto max-w-full shrink-0 ${cls}`}
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
