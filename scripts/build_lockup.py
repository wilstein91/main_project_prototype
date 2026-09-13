# -*- coding: utf-8 -*-
"""
가로형 로고 합성 — public/logo/lockup.svg

## 왜 한 장으로 합치나

헤더에서 청룡언월도와 워드마크를 **CSS 로 겹치면** 화면 폭에 따라 어긋난다.
좁은 화면에서는 무기가 버튼과 자리를 다투다가 결국 숨기게 되고, 그러면
모바일에서만 로고가 달라진다.

겹침을 **파일 안에 고정**하면 폭과 무관하게 항상 같은 모양이다. 화면에서는
`<img>` 하나의 높이만 조절하면 된다.

## 왜 SVG 인가

워드마크는 윤곽선(path)이라 어느 크기로 키워도 선명하다. 무기는 래스터라
base64 로 박아 넣는다 — 외부 파일을 참조하면 `<img>` 로 불러올 때 차단된다.

## 쓰는 법

    python scripts/build_logo.py     # 먼저 워드마크를 만들고
    python scripts/build_lockup.py   # 그 위에 무기를 합친다

이름이 바뀌면 둘 다 다시 돌린다.
"""

import base64
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDMARK = os.path.join(ROOT, "public", "logo", "wordmark.svg")
ARM = os.path.join(ROOT, "public", "images", "header-arm.webp")
OUT = os.path.join(ROOT, "public", "logo", "lockup.svg")

# 무기 그림의 크기는 **파일에서 읽는다.** 값을 적어 두면 그림을 다듬을
# 때마다 어긋나고, 어긋나면 글자가 무기 밖으로 밀려난다 (한 번 겪었다).

# 글자가 차지하는 폭의 비율. 더 크면 무기가 글자에 다 가려지고,
# 더 작으면 글자가 배경에 묻힌다. 0.58 이 둘 사이의 경계였다.
WORD_RATIO = 0.58


def main():
    for path, what in ((WORDMARK, "워드마크"), (ARM, "무기 그림")):
        if not os.path.exists(path):
            raise SystemExit(f"{what}가 없다: {path}")

    svg = open(WORDMARK, encoding="utf-8").read()

    vb = re.search(r'viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"', svg)
    if not vb:
        raise SystemExit("워드마크에서 viewBox 를 찾지 못했다.")
    vx, vy, vw, vh = (float(g) for g in vb.groups())

    body = re.search(r"(<g [^>]*paint-order=\"stroke\">.*?</g>)", svg, re.S)
    if not body:
        raise SystemExit("워드마크에서 글자 그룹을 찾지 못했다.")
    glyphs = body.group(1)

    name = re.search(r"<title>(.*?)</title>", svg)
    label = name.group(1) if name else "로고"

    with open(ARM, "rb") as f:
        raw = f.read()
    arm_b64 = base64.b64encode(raw).decode("ascii")

    from PIL import Image

    with Image.open(io.BytesIO(raw)) as arm_img:
        ARM_W, ARM_H = arm_img.size

    # 글자를 무기 한가운데에 놓는다
    word_w = ARM_W * WORD_RATIO
    scale = word_w / vw
    word_h = vh * scale
    tx = (ARM_W - word_w) / 2
    ty = (ARM_H - word_h) / 2

    # viewBox 원점이 음수이므로 그만큼 되돌려 놓고 그린다
    transform = (
        f"translate({tx:.1f} {ty:.1f}) scale({scale:.5f}) "
        f"translate({-vx:.0f} {-vy:.0f})"
    )

    out = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'viewBox="0 0 {ARM_W} {ARM_H}" fill="none" '
        f'role="img" aria-label="{label}">\n'
        f"<title>{label}</title>\n"
        "<!-- scripts/build_lockup.py 로 생성했다. 손으로 고치지 말 것 -->\n"
        f'<image width="{ARM_W}" height="{ARM_H}" '
        f'xlink:href="data:image/webp;base64,{arm_b64}"/>\n'
        f'<g transform="{transform}">{glyphs}</g>\n'
        "</svg>\n"
    )

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out)

    size = os.path.getsize(OUT)
    print(f"public/logo/lockup.svg  {size:,} bytes")
    print(f"  무기 {ARM_W}x{ARM_H} · 글자 폭 {word_w:.0f} ({WORD_RATIO:.0%})")


if __name__ == "__main__":
    main()
