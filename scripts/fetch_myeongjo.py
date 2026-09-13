# -*- coding: utf-8 -*-
"""
나눔명조 자체 호스팅 — 제목·메뉴·버튼용 서체를 내려받아 public/fonts 에 둔다.

## 왜 명조인가

서비스 이름이 `영웅호걸`이고 화면 톤이 삼국지다. 본문까지 명조로 하면
긴 글이 읽기 어려워지므로 **제목·메뉴·버튼에만** 쓰고 본문은 Pretendard 로
둔다 (DESIGN.md §5).

궁서체는 쓸 수 없다 — 윈도우 '궁서'는 라이선스가 웹 임베드를 허용하지
않는다. **나눔명조는 SIL OFL** 이라 임베드와 재배포가 모두 허용된다.

## 왜 CDN 을 쓰지 않나

Pretendard 와 같은 이유다. 서드파티에 이용자 IP 가 남고, 그쪽이 죽으면
글꼴이 빠진다. 구글이 쪼개 둔 unicode-range 조각을 그대로 받아서
`public/fonts/nanum-myeongjo/` 에 두고 URL 만 우리 것으로 바꾼다.

브라우저는 화면에 실제로 쓰인 문자 구간만 받으므로, 한글 전체를 다
내려받지 않는다.

## 쓰는 법

    python scripts/fetch_myeongjo.py
"""

import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "fonts", "nanum-myeongjo")
CSS_OUT = os.path.join(ROOT, "src", "app", "fonts-myeongjo.css")

# woff2 를 받으려면 최신 브라우저 UA 가 필요하다. 옛 UA 를 주면 ttf 가 온다.
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
CSS_URL = (
    "https://fonts.googleapis.com/css2"
    "?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
)

HEADER = """/* ─────────────────────────────────────────────────────────────
   나눔명조 — 자체 호스팅 (구글이 쪼개 둔 unicode-range 조각 그대로)
   SIL Open Font License 1.1 · https://fonts.google.com/specimen/Nanum+Myeongjo

   **제목·메뉴·버튼에만 쓴다.** 본문은 Pretendard 다 — 명조로 긴 글을
   읽히면 눈이 빨리 지친다 (DESIGN.md §5).

   손으로 고치지 않는다. 다시 받으려면:
       python scripts/fetch_myeongjo.py
   ───────────────────────────────────────────────────────────── */
"""


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    data = urllib.request.urlopen(req, timeout=60).read()
    return data if binary else data.decode("utf-8")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    css = fetch(CSS_URL)

    urls = sorted(set(re.findall(r"url\((https://[^)]+\.woff2)\)", css)))
    if not urls:
        raise SystemExit("woff2 URL 을 찾지 못했다. UA 나 API 주소를 확인할 것.")

    print(f"조각 {len(urls)}개 내려받는 중...")
    for i, url in enumerate(urls, 1):
        name = url.rsplit("/", 1)[-1]
        path = os.path.join(OUT_DIR, name)
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(fetch(url, binary=True))
        css = css.replace(url, f"/fonts/nanum-myeongjo/{name}")
        if i % 20 == 0 or i == len(urls):
            print(f"  {i}/{len(urls)}")

    with open(CSS_OUT, "w", encoding="utf-8") as f:
        f.write(HEADER + css)

    total = sum(
        os.path.getsize(os.path.join(OUT_DIR, n)) for n in os.listdir(OUT_DIR)
    )
    print(f"완료 — {len(urls)}조각, 합계 {total / 1024:.0f}KB")
    print(f"  글꼴: {OUT_DIR}")
    print(f"  CSS : {CSS_OUT}")


if __name__ == "__main__":
    main()
