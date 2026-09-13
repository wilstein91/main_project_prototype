import fs from "node:fs";
import path from "node:path";

/**
 * 그림 파일이 있는지 확인한다 — DESIGN.md §10.9
 *
 * ## 왜 이런 것이 필요한가
 *
 * 화면의 큰 그림(히어로 배너·좌우 배경·헤더 장식)은 **코드로 그릴 수 없다.**
 * SVG 로 좌표를 찍어 만든 도형은 도면이지 회화가 아니다. 그래서 그 자리는
 * 생성형 AI 로 뽑은 그림 파일이 채운다.
 *
 * 문제는 파일이 아직 없을 때다. `<img>` 를 그냥 두면 깨진 아이콘이 뜬다.
 * 그래서 **파일이 있으면 그림, 없으면 기존 SVG** 로 갈라 놓는다. 그림이
 * 준비되면 `public/images/` 에 넣는 것만으로 화면이 바뀐다 — 코드를 고칠
 * 필요가 없다.
 *
 * ## 왜 서버에서 확인하나
 *
 * 이 함수를 쓰는 컴포넌트는 전부 서버 컴포넌트다. 빌드·요청 시점에 파일
 * 유무가 정해지므로 브라우저로 판정을 내보낼 이유가 없다 — 내보내면
 * 화면이 한 번 깜빡인 뒤 바뀐다.
 */

/** 넣을 수 있는 확장자. 앞에 있는 것을 먼저 쓴다 (용량이 작은 순) */
const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"] as const;

/**
 * `public/images/<name>.<확장자>` 를 찾아 웹 경로로 돌려준다.
 * 없으면 `null` — 부르는 쪽에서 대체 화면을 그린다.
 *
 * @example
 *   const hero = artwork("hero");   // "/images/hero.webp" 또는 null
 */
export function artwork(name: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `images/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) {
      return `/${rel}`;
    }
  }
  return null;
}
