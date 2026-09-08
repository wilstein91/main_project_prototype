/**
 * 청룡언월도 마크 (작은 크기용) — DESIGN.md §3
 *
 * ## 네 번 다시 그렸다
 *
 * v1 은 날이 얇아 22px 에서 사선 획으로 보였다. v2 는 날을 살찌웠더니
 * 자루가 묻혀 초승달이 되었다. v3 은 자루를 뽑았지만 26px 에서
 * **잎사귀**로 읽혔다 — 날의 안쪽까지 볼록해 전체가 뾰족한 렌즈가
 * 되었기 때문이다. 큰 크기에서는 도끼로 보였다.
 *
 * v4 에서 세 가지를 바꿨다.
 *
 * 1. **안쪽 선을 오목하게.** 등(위)은 볼록, 인(아래)은 오목이라야
 *    렌즈가 아니라 휜 칼날이 된다. 언월도의 실루엣은 여기서 나온다.
 * 2. **색을 하나 더.** 20px 에서 형태로 구별되는 특징은 서너 개가
 *    한계지만, 색은 형태보다 작아져도 살아남는다. 금 투겁과 붉은 술을
 *    넣으면 잎사귀·붓·도끼와 한눈에 갈린다. 만화 삼국지 컬러판이
 *    무기를 그리는 방식이기도 하다 — 먹선 + 평면 채움 + 금과 주홍.
 * 3. **[[BladeCrest]] 와 실루엣을 통일.** 큰 삽화와 작은 마크가 다른
 *    물건처럼 보이면 로고가 두 개인 셈이다. 같은 기울기, 같은 날 곡선을
 *    쓰고 선 굵기만 작은 크기에 맞춰 올렸다.
 *
 * 회전 애니메이션·워터마크·반복 배경은 금지 (DESIGN.md §3.1).
 * 40px 이상 자리에는 이걸 확대하지 말고 BladeCrest 를 쓴다.
 */
export function BladeMark({
  size = 24,
  plain = false,
  className = "",
}: {
  size?: number;
  /** 아주 작은 크기용 — 갈고리를 버리고 날·자루·색만 남긴다 */
  plain?: boolean;
  className?: string;
}) {
  // 20px 아래에서는 갈고리가 날에 붙어 뭉친다
  const simple = plain || size < 20;
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
      {/* 자루 — 장병기는 자루가 보여야 무기로 읽힌다 */}
      <path
        d="M14 46 L25.5 14.5"
        stroke={ink}
        strokeWidth="4.6"
        strokeLinecap="round"
      />

      {/* 날 — 등은 볼록, 인은 오목 */}
      <path
        d="M25.5 14.5 C32 12 37.5 7.5 41 2 C40 11 36 17.5 28 21 Z"
        fill="var(--color-brand)"
        stroke={ink}
        strokeWidth="2.7"
        strokeLinejoin="round"
      />

      {/* 등날 갈고리 — 언월도의 특징 */}
      {!simple && (
        <path
          d="M25.5 16.8 C21 16 19.5 12 21.5 8.5"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* 금 투겁 — 날과 자루를 잇고, 작은 크기에서 색으로 구별을 만든다 */}
      <path
        d="M21.5 24 L25 15.5"
        stroke="var(--color-gold)"
        strokeWidth="5.6"
        strokeLinecap="round"
      />

      {/* 붉은 술 */}
      <circle
        cx="20"
        cy="27"
        r="3.3"
        fill="var(--color-tassel)"
        stroke={ink}
        strokeWidth="1.6"
      />
    </svg>
  );
}
