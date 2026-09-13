import { artwork } from "@/lib/art";

/**
 * 인증 화면의 그림 띠 — DESIGN.md §10.9
 *
 * ## 왜 배경이 아니라 띠인가
 *
 * 처음에는 화면 전체에 배경으로 깔았다. PC 에서는 폼 좌우로 그림이 보였지만
 * **모바일에서는 폼이 화면을 거의 다 덮어 그림이 사라졌다.** 배경을 밝혀도
 * 보이는 건 여백뿐이었다.
 *
 * 지금은 폼 패널 **맨 위에 띠로** 얹는다. 화면 폭과 무관하게 항상 같은
 * 자리에 같은 크기로 보인다.
 *
 * 패널 안쪽 여백을 음수 마진으로 빠져나가 패널 폭을 꽉 채운다 — 띠 좌우에
 * 여백이 남으면 그림이 아니라 삽입된 사진처럼 보인다.
 *
 * 그림이 없으면 아무것도 그리지 않는다. 그때도 화면은 정상이다.
 */
export function Scene({ name }: { name: string }) {
  const art = artwork(name);
  if (!art) return null;

  return (
    <div className="-mx-5 -mt-7 mb-6 h-32 overflow-hidden border-b border-gold-dim sm:h-40 lg:-mx-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={art}
        alt=""
        aria-hidden
        className="h-full w-full object-cover"
      />
    </div>
  );
}
