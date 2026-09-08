/**
 * 청룡언월도 마크 — DESIGN.md §3
 *
 * 언월도를 글자처럼 읽히는 정도까지 줄였다. 만화 컬러판을 따라
 * **잉크선 + 평면 채움 2톤**이며 그라디언트는 쓰지 않는다.
 *
 * 첫 버전은 날이 너무 얇아 22px 에서 사선 획처럼 보였다. 작은 크기에서는
 * 알아볼 수 있는 특징이 3~4개뿐이라, **날의 면적**과 **자루의 굵기** 두
 * 가지에 몰아주고 나머지(갈고리·물미·하이라이트)는 버린다.
 *
 * 회전 애니메이션·워터마크·반복 배경은 금지 (DESIGN.md §3.1).
 */
export function BladeMark({
  size = 24,
  plain = false,
  className = "",
}: {
  size?: number;
  /** 작은 크기용 — 디테일을 버리고 날과 자루만 남긴다 */
  plain?: boolean;
  className?: string;
}) {
  // 28px 아래에서는 디테일이 뭉친다. 헤더(22px)도 여기 걸린다.
  const simple = plain || size < 28;
  const ink = "var(--color-ink)";

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="영웅호걸닷컴"
      fill="none"
    >
      {/*
       * 자루가 마크의 대각선을 만들고, 날이 그 위에 얹힌다.
       * 자루를 짧게 두면 잎사귀·초승달로 읽힌다 — 장병기는 자루가
       * 보여야 무기로 읽힌다.
       */}
      <g transform="rotate(12 24 24)">
        {/* 자루 — 아래에서 위로 길게. 마크의 골격이다 */}
        <path
          d="M14.5 44 L21 17"
          stroke={ink}
          strokeWidth={simple ? 4.6 : 4}
          strokeLinecap="round"
        />

        {/* 물미 (자루 끝) */}
        {!simple && (
          <path
            d="M11.6 43.2 L17.4 44.8"
            stroke={ink}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        )}

        {/*
         * 초승달 날 — 자루 위쪽에 얹혀 오른쪽으로 휜다.
         * 바깥 호는 크게, 안쪽 호는 얕게 돌아와 가운데가 두껍다.
         * 이 두께가 작은 크기에서 형태를 살린다.
         */}
        <path
          d="M20 18
             C27 15 34 10 39 3
             C43 12 40 24 27 28
             Z"
          fill="var(--color-brand)"
          stroke={ink}
          strokeWidth={simple ? 2.8 : 2.3}
          strokeLinejoin="round"
        />

        {/* 날 끝 하이라이트 — 컬러판의 평면 하이라이트 한 겹 */}
        {!simple && (
          <path
            d="M35.2 8.4 C37 5.6 38.6 3.2 38.6 3.2
               C40.6 7 40.8 11.6 40 14.8 Z"
            fill="var(--color-blade)"
          />
        )}

        {/* 등날 갈고리 — 언월도의 특징. 작을 때는 버린다 */}
        {!simple && (
          <path
            d="M20.4 19.4 C16.4 19 14.4 16.2 15 13.2"
            stroke={ink}
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        )}

        {/* 날과 자루가 만나는 목 — 두 덩어리를 이어 준다 */}
        <path
          d="M17 19.6 L25 17.6"
          stroke={ink}
          strokeWidth={simple ? 3.8 : 3.2}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
