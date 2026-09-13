/**
 * 장식 — DESIGN.md §10.5
 *
 * ## 왜 장식을 넣나
 *
 * v1.2 에서 먹빛 바탕과 금테를 깔았는데, 화면이 **금테 사각형의 반복**이
 * 되었다. 게임 화면이 풍성해 보이는 이유는 색이 아니라 **장면과 표식**이
 * 있기 때문이다. 여기서 그 둘을 만든다.
 *
 * ## 어디까지 쓰나
 *
 * 전부 **사용자가 멈춘 자리**에만 쓴다 (DESIGN.md §2). 목록을 훑고 본문을
 * 읽는 동안에는 장식이 나오지 않는다. 그래서 이 파일의 어떤 것도
 * `PostList` · `PostBody` 에서 쓰이지 않는다.
 *
 * ## 전부 SVG 로 직접 그린다
 *
 * 이미지 파일을 쓰지 않는 이유는 세 가지다 — 색 토큰을 따라가야 하고
 * (테마가 또 바뀔 수 있다), 어느 크기로 늘려도 뭉개지지 않아야 하고,
 * 내려받을 것이 늘면 안 된다.
 *
 * **인물은 그리지 않는다** (DESIGN.md §3.3). 근거는 v1.0 때와 같다 —
 * 특정 작품의 캐릭터와 닮을 위험이 있고, 인물이 들어오면 화면이 무거워진다.
 * 산·구름·깃발까지만 쓴다.
 */

/**
 * 먼 산 — 홈과 `/about` 히어로의 배경.
 *
 * ## 비율을 히어로에 맞춘다
 *
 * viewBox 는 데스크톱 히어로의 실제 비율(약 800×230)에 맞춰 두었다.
 * 처음에는 아래쪽 62% 에만 깔고 `slice` 로 잘랐는데, 그러면 **달이 잘려
 * 사라졌다.** 잘릴 것을 전제로 그리면 무엇이 남을지 알 수 없다 — 넣을
 * 자리의 비율에 맞춰 그리고, 좁은 화면에서만 좌우가 잘리게 한다.
 *
 * ## 밤 풍경이므로 앞산이 더 어둡다
 *
 * 대기 원근이 반대로 걸리면(앞이 밝으면) 산이 아니라 겹친 색종이로 읽힌다.
 *
 * `aria-hidden` 이다. 이 그림은 읽어 줄 내용이 없다 — 옆의 문장이 이미
 * 같은 말을 한다.
 */
export function MountainScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 230"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={className}
    >
      {/* 달 — 금색 하나. 해가 아니라 달인 이유는 먹빛 바탕이기 때문이다 */}
      <circle cx="676" cy="58" r="23" fill="var(--color-gold)" opacity="0.45" />
      <circle
        cx="676"
        cy="58"
        r="23"
        fill="none"
        stroke="var(--color-gold-lit)"
        strokeWidth="1.5"
        opacity="0.75"
      />

      {/* 상운 — 달 아래를 가로지른다. 동양 그림의 구름을 양식화했다 */}
      <g fill="none" stroke="#3a5049" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M596 92 q11 0 14-8 t18-6 q13 1 15 11 t19 3 l38 0" />
        <path d="M624 108 q9 0 12-6 t14-4 q10 1 12 8 l34 0" />
      </g>

      {/* 뒤 산맥 — 흐리고 밝다 */}
      <path
        d="M0 230 L64 112 L118 156 L192 84 L268 148 L340 102 L418 160 L492 92 L574 150 L652 114 L744 166 L800 140 L800 230 Z"
        fill="#24352f"
        opacity="0.9"
      />

      {/* 앞 산맥 — 진하다 */}
      <path
        d="M0 230 L104 152 L178 190 L276 138 L388 192 L486 146 L598 196 L712 156 L800 184 L800 230 Z"
        fill="#161f1c"
      />

      {/* 깃발 둘 — 능선 위. 사람이 있다는 유일한 표시다 */}
      <g stroke="var(--color-tassel)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M276 138 L276 104" />
        <path d="M486 146 L486 118" />
      </g>
      <path d="M278 106 L302 113 L278 120 Z" fill="var(--color-tassel)" />
      <path d="M488 120 L508 126 L488 132 Z" fill="var(--color-tassel)" />
    </svg>
  );
}

/**
 * 상운(祥雲) 띠 — 가로 구분 장식.
 *
 * 구름을 **좌우 대칭으로 두고 가운데를 비운다.** 가운데에 글자나 마름모가
 * 오기 때문이다. 구름이 글자 뒤로 지나가면 획과 섞여 둘 다 안 읽힌다.
 */
export function CloudRule({ className = "" }: { className?: string }) {
  const cloud = (
    <path
      d="M0 14 q9 0 12-7 t15-5 q11 1 13 10 t16 3 l26 0"
      fill="none"
      stroke="var(--color-gold)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  );
  return (
    <svg viewBox="0 0 240 20" aria-hidden className={className}>
      <g opacity="0.75">
        {cloud}
        <g transform="translate(240 20) rotate(180)">{cloud}</g>
      </g>
      {/* 가운데 마름모 — 시선이 멈추는 점 */}
      <path d="M120 4 L126 10 L120 16 L114 10 Z" fill="var(--color-gold-lit)" />
    </svg>
  );
}

/**
 * 모서리 꺾쇠 — 패널을 "틀에 넣은 것" 으로 만든다.
 *
 * ## 하나의 SVG 를 늘리지 않는다
 *
 * 처음에는 viewBox 100×100 짜리 SVG 하나에 네 모서리를 그리고
 * `preserveAspectRatio="none"` 으로 늘렸다. 그랬더니 **선 굵기까지 같이
 * 늘어나** 가로로 뭉개진 두꺼운 ㄱ자가 되었다. 늘어나면 안 되는 것을
 * 늘어나는 상자에 담은 것이 잘못이었다.
 *
 * 지금은 **고정 크기 조각 네 개**를 모서리에 각각 놓는다. 상자가 아무리
 * 커지고 작아져도 꺾쇠는 20px 그대로다.
 *
 * 테두리를 두껍게 하는 대신 모서리만 강조하는 이유는, 패널이 여러 개
 * 쌓이는 화면에서 **사방이 굵으면 글보다 액자가 먼저 읽히기** 때문이다
 * (PRD V-3).
 */
export function CornerMarks({ className = "" }: { className?: string }) {
  const mark = (
    <path
      d="M1.5 18.5 L1.5 6 Q1.5 1.5 6 1.5 L18.5 1.5"
      fill="none"
      stroke="var(--color-gold)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
  const corners = [
    "left-2 top-2",
    "right-2 top-2 rotate-90",
    "right-2 bottom-2 rotate-180",
    "left-2 bottom-2 -rotate-90",
  ];
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      {corners.map((pos) => (
        <svg
          key={pos}
          viewBox="0 0 20 20"
          width="20"
          height="20"
          className={`absolute ${pos}`}
        >
          {mark}
        </svg>
      ))}
    </div>
  );
}
