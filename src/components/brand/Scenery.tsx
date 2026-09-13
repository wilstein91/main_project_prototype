/**
 * 회화 — DESIGN.md §10.7
 *
 * ## 선이 아니라 칠이다
 *
 * v1.2 까지의 장식은 전부 **1~2px 짜리 선**이었다. 그래서 화면이 계속
 * 도면처럼 보였다. 여기서는 반대로 간다 — 선을 거의 쓰지 않고 **그라디언트로
 * 칠한 면을 여러 겹 쌓는다.** 동양 산수화가 먹의 농담으로 거리를 만드는
 * 방식과 같다.
 *
 * 겹은 넷이다: 하늘 → 원산(안개에 묻힘) → 중산 → 근산(실루엣).
 * 뒤로 갈수록 **밝고 흐리게**, 앞으로 올수록 **어둡고 또렷하게**. 밤 풍경의
 * 대기 원근을 뒤집으면 산이 아니라 겹친 색종이로 읽힌다.
 *
 * ## 언월도를 걷어냈다
 *
 * 마크·삽화·가로형 로고까지 전부 같은 언월도 한 자루를 돌려쓰고 있었다.
 * 작은 아이콘 하나로 화면을 채우려 한 것이 문제였다 — 화면이 넓어질수록
 * 아이콘은 더 빈약해 보인다. 넓은 자리는 **풍경**이 채우고, 작은 자리는
 * **인장**이 채운다.
 */

/**
 * 산수 — 히어로의 배경 그림.
 *
 * `seed` 로 능선을 조금씩 다르게 쓸 수 있게 해 두었지만 기본값 하나면
 * 충분하다. 화면마다 산이 달라지면 같은 서비스로 안 보인다.
 */
export function Landscape({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={className}
    >
      <defs>
        {/* 하늘 — 위는 깊은 밤, 아래는 달빛이 번진 청록 */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1c1f" />
          <stop offset="45%" stopColor="#13333a" />
          <stop offset="78%" stopColor="#1d4a49" />
          <stop offset="100%" stopColor="#2a5c52" />
        </linearGradient>

        {/* 달무리 — 가장자리로 갈수록 사라진다 */}
        <radialGradient id="halo">
          <stop offset="0%" stopColor="#f6e3ae" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#e0b451" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c8922a" stopOpacity="0" />
        </radialGradient>

        {/* 산 세 겹 — 능선 쪽이 밝고 아래로 내려갈수록 어두워진다 */}
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d7a72" />
          <stop offset="100%" stopColor="#274a4a" />
        </linearGradient>
        <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d5450" />
          <stop offset="100%" stopColor="#15302f" />
        </linearGradient>
        <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#17312c" />
          <stop offset="100%" stopColor="#0a1614" />
        </linearGradient>

        {/* 안개 — 산과 산 사이를 끊어 거리를 만든다 */}
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fc4bb" stopOpacity="0" />
          <stop offset="50%" stopColor="#a9d4cb" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8fc4bb" stopOpacity="0" />
        </linearGradient>

        <filter id="soft" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="softer" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect width="800" height="300" fill="url(#sky)" />

      {/* 달 */}
      <circle cx="628" cy="74" r="82" fill="url(#halo)" />
      <circle cx="628" cy="74" r="27" fill="#f4e4b6" />
      <circle cx="628" cy="74" r="27" fill="#fdf6e3" opacity="0.35" />

      {/* 원산 — 안개에 묻혀 거의 색만 남는다 */}
      <path
        d="M0 300 L58 150 L112 196 L186 118 L262 186 L338 134 L420 196 L498 122 L586 188 L668 146 L760 200 L800 172 L800 300 Z"
        fill="url(#far)"
        opacity="0.45"
        filter="url(#soft)"
      />

      {/* 안개 띠 하나 */}
      <rect x="-40" y="176" width="880" height="46" fill="url(#mist)" filter="url(#softer)" />

      {/* 중산 */}
      <path
        d="M0 300 L96 182 L168 224 L258 168 L356 228 L448 178 L556 232 L664 186 L768 230 L800 214 L800 300 Z"
        fill="url(#mid)"
      />

      {/* 능선 위 누각 — 사람이 있다는 표시. 아주 작게 둔다 */}
      <g fill="#0d1f1d">
        <path d="M252 168 l-17 9 h34 z" />
        <rect x="243" y="177" width="18" height="13" />
        <path d="M239 177 h26 v2 h-26 z" />
      </g>

      {/* 안개 띠 둘 — 중산과 근산을 끊는다 */}
      <rect x="-40" y="226" width="880" height="40" fill="url(#mist)" filter="url(#softer)" opacity="0.8" />

      {/* 근산 — 가장 어둡고 또렷하다 */}
      <path
        d="M0 300 L110 236 L196 270 L300 230 L412 274 L520 238 L640 278 L748 244 L800 266 L800 300 Z"
        fill="url(#near)"
      />

      {/* 소나무 실루엣 — 근산 능선에. 가지를 층으로 얹는다 */}
      <g fill="#081211">
        <PineTree x={300} y={230} s={1} />
        <PineTree x={520} y={238} s={0.78} />
        <PineTree x={132} y={247} s={0.62} />
      </g>
    </svg>
  );
}

/**
 * 소나무 — 삼각 가지를 세 층으로 얹는다.
 *
 * 잎을 하나하나 그리지 않는다. 40px 안에서는 층의 실루엣만 남고 나머지는
 * 뭉개진다 — 로고를 네 번 고치며 배운 것과 같다 (DESIGN.md §3.1).
 */
function PineTree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2" y="-14" width="4" height="16" />
      <path d="M0 -46 L13 -26 L-13 -26 Z" />
      <path d="M0 -36 L16 -14 L-16 -14 Z" />
      <path d="M0 -26 L19 -2 L-19 -2 Z" />
    </g>
  );
}

/**
 * 인장 — 작은 자리를 채우는 표식. 헤더·빈 화면에 쓴다.
 *
 * 붉은 전각(篆刻) 도장이다. 동양 서화에서 이름을 대신하는 물건이고,
 * **20px 로 줄여도 붉은 사각형 하나로 읽힌다** — 작은 자리에서 형태보다
 * 색이 오래 살아남는다는 §3.1 의 결론을 그대로 쓴 것이다.
 *
 * 안의 글자는 서비스명 첫 글자(`영`)를 획으로 단순화했다. 실제 전서체를
 * 쓰지 않은 이유는 그 자체가 폰트 라이선스 문제를 만들기 때문이다.
 */
export function Seal({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="영웅호걸닷컴"
      className={className}
    >
      <defs>
        <linearGradient id="sealBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4453a" />
          <stop offset="100%" stopColor="#9e2318" />
        </linearGradient>
      </defs>
      {/* 도장 몸통 — 모서리를 살짝 둥글게. 완전한 직각은 인쇄물처럼 보인다 */}
      <rect x="2" y="2" width="36" height="36" rx="5" fill="url(#sealBody)" />
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="5"
        fill="none"
        stroke="#f0d9a0"
        strokeWidth="1.5"
        opacity="0.45"
      />
      {/* 획 — '영' 을 양식화했다. 가로 둘, 세로 하나, 아래 받침 */}
      <g stroke="#fdf2e0" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M12 12 H28" />
        <path d="M20 12 V20" />
        <path d="M12 20 H28" />
        <path d="M14 28 Q20 24 26 28" />
      </g>
    </svg>
  );
}
