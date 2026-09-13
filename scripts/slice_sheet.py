# -*- coding: utf-8 -*-
"""
그림 시트 자르기 — 한 장으로 받은 시트를 개별 파일로 나눈다.

## 왜 필요한가

생성형 AI 로 여러 장을 뽑으면 한 장의 시트로 받는 편이 빠르다. 이 스크립트가
시트를 읽어 `public/images/` 아래 각각의 이름으로 잘라 낸다.

## 쓰는 법

    1. 시트를 public/images/_sheet.png 로 저장한다
    2. python scripts/slice_sheet.py
    3. 결과를 눈으로 확인하고 _sheet.png 는 지운다

좌표가 안 맞으면 아래 TILES 의 비율만 고치면 된다. **픽셀이 아니라 비율(0~1)로
적어 둔 이유**는 시트 해상도가 바뀌어도 그대로 쓰기 위해서다.

## 잘라낸 뒤

`src/lib/art.ts` 가 `public/images/<이름>.<확장자>` 를 찾아 자동으로 쓴다.
코드를 고칠 필요가 없다 (DESIGN.md §10.9).
"""

import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "public", "images", "_sheet.png")
OUT = os.path.join(ROOT, "public", "images")

# (이름, 왼쪽, 위, 오른쪽, 아래) — 시트 폭·높이에 대한 비율
# 캡션 글자가 들어가지 않도록 아래쪽을 조금 남긴다.
TILES = [
    ("side-right", 0.014, 0.006, 0.268, 0.566),
    ("header-arm", 0.292, 0.004, 0.997, 0.190),
    ("notfound", 0.380, 0.218, 0.988, 0.566),
    ("cat-notice", 0.014, 0.598, 0.330, 0.772),
    ("cat-free", 0.347, 0.598, 0.661, 0.772),
    ("cat-stock", 0.678, 0.598, 0.992, 0.772),
    ("cat-market", 0.014, 0.803, 0.330, 0.977),
    ("cat-qna", 0.347, 0.803, 0.661, 0.977),
    ("cat-all", 0.678, 0.803, 0.992, 0.977),
]

# 투명 배경을 살려야 하는 것 — 나머지는 배경을 합성해 용량을 줄인다
KEEP_ALPHA = {"header-arm"}


def main():
    if not os.path.exists(SHEET):
        sys.exit(
            f"시트가 없다: {SHEET}\n"
            "  받은 시트 이미지를 public/images/_sheet.png 로 저장한 뒤 다시 실행할 것."
        )

    sheet = Image.open(SHEET).convert("RGBA")
    w, h = sheet.size
    print(f"시트 {w}x{h}")

    for name, l, t, r, b in TILES:
        box = (round(l * w), round(t * h), round(r * w), round(b * h))
        tile = sheet.crop(box)
        path = os.path.join(OUT, f"{name}.png")
        if name in KEEP_ALPHA:
            tile.save(path)
        else:
            tile.convert("RGB").save(path, quality=92)
        print(f"  {name}.png  {tile.width}x{tile.height}")

    print("\n완료. 화면에서 확인한 뒤 _sheet.png 는 지운다.")


if __name__ == "__main__":
    main()
