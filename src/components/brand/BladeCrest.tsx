/**
 * 청룡언월도 삽화 (큰 크기용) — DESIGN.md §3.3
 *
 * 헤더의 [[BladeMark]] 는 20px 에서 살아남기 위해 특징을 서너 개로
 * 줄인 것이다. 그걸 120px 로 확대하면 빈 도형이 된다. 큰 자리에는
 * 디테일을 넣은 그림을 따로 쓴다 — 물미, 자루 결, 날 하이라이트,
 * 투겁 테, 술 두 갈래.
 *
 * ## 두 가지 규칙
 *
 * **회전을 쓰지 않는다.** 처음에는 `rotate(-14 60 60)` 으로 기울였는데,
 * 회전은 도형을 viewBox 밖으로 밀어내 **날 끝이 잘렸다**. 기울기는
 * 좌표에 직접 넣는다. 그러면 잘릴 일이 없고, 어느 크기에서도 같다.
 *
 * **하이라이트는 한 겹.** 두 겹을 넣었더니 날의 70% 가 밝은 색이 되어
 * 남은 먹선이 윤곽처럼 보였고, 92px 에서 새 부리로 읽혔다. 만화
 * 컬러판은 밝은 면을 좁게 쓴다 — 등 쪽에 띠 하나만 얹는다.
 *
 * 만화 삼국지 컬러판의 규칙을 따른다.
 *   - 굵은 먹선 윤곽
 *   - 평면 채움. 그라디언트 없음
 *   - 하이라이트는 단이 지는 면으로 얹는다 (번지지 않는다)
 *   - 색은 청록·먹·금·주홍 네 개로 제한
 *
 * 쓰는 곳은 세 군데뿐이다 — 홈 상단 띠(비회원), /about 히어로,
 * 404·빈 목록. 장식으로 반복하지 않는다 (DESIGN.md §3.1).
 */
export function BladeCrest({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const ink = "var(--color-ink)";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="청룡언월도"
      fill="none"
    >
      {/* 자루 — 기울기를 좌표에 직접 넣는다 (위 주석 참고) */}
      <path d="M38 116 L64 36" stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
      <path
        d="M41 112 L64.5 41"
        stroke="var(--color-ink-lit)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* 물미 (자루 끝) */}
      <path
        d="M32 113 L45 119"
        stroke="var(--color-gold)"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* 날 — 등은 볼록, 인은 오목 */}
      <path
        d="M64 36 C80 30 94 20 102 8 C100 28 90 44 70 52 Z"
        fill="var(--color-brand)"
        stroke={ink}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* 하이라이트 — 등 쪽 좁은 띠 한 겹만 */}
      <path
        d="M70 36 C83 30 93 21 99 12 C98 20 94 27 86 33 Z"
        fill="var(--color-blade)"
      />

      {/* 등날 갈고리 */}
      <path
        d="M64 41 C54 39 50 31 53 23"
        stroke={ink}
        strokeWidth="4.6"
        strokeLinecap="round"
      />

      {/* 금 투겁 — 자루를 감싸는 통 */}
      <path
        d="M57 57 L63 40"
        stroke={ink}
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.18"
      />
      <path
        d="M57 57 L63 40"
        stroke="var(--color-gold)"
        strokeWidth="11.5"
        strokeLinecap="round"
      />
      <path
        d="M58.5 55 L62 44"
        stroke="var(--color-gold-lit)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* 붉은 술 — 두 갈래 */}
      <path
        d="M54 62 C47 68 45 77 48 84"
        stroke="var(--color-tassel)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M54 62 C50 70 50 78 54 85"
        stroke="var(--color-tassel-dark)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle
        cx="55"
        cy="61"
        r="5.4"
        fill="var(--color-tassel)"
        stroke={ink}
        strokeWidth="2.8"
      />
    </svg>
  );
}
