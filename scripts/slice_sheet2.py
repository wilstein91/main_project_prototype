# -*- coding: utf-8 -*-
"""
두 번째 그림 시트 자르기 — 배경·배너·등급 문장·버튼 판.

첫 시트(slice_sheet.py)와 달리 한 장에 세 묶음이 섞여 들어왔고, 투명이
필요한 것과 아닌 것이 함께 있다. 그래서 타일마다 `alpha` 여부를 따로 준다.

## 투명 처리에서 조심할 것

생성형 AI 는 투명 배경을 **체크무늬로 그려서** 준다 (실제 알파는 255).
그걸 지울 때 "밝은 무채색" 같은 조건을 쓰면 **은색 투구나 칼날이 함께
사라진다** — 첫 시트에서 칼날을 한 번 날렸다.

그래서 여기서는 체크무늬의 두 색(흰색·연회색)에 **거의 정확히 일치**하는
픽셀만, 그것도 가장자리에서 연결된 것만 지운다.

## 쓰는 법

    python scripts/slice_sheet2.py

좌표가 어긋나면 TILES 의 픽셀 값만 고친다.
"""

import os
from collections import deque

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, "public", "images", "_sheet2.png")
OUT = os.path.join(ROOT, "public", "images")

# (이름, 왼쪽, 위, 오른쪽, 아래, 투명배경인가)
#
# 아래 경계는 **캡션 글자 바로 위**로 잡는다. 캡션까지 들어오면 투명화가
# 그 글자에 막혀 흰 프레임이 통째로 남는다 (한 번 겪었다).
TILES = [
    # ── 화면 배경 ────────────────────────────────────────────
    ("auth-signup",   16,  32,  290, 186, False),
    ("auth-login",   295,  32,  570, 186, False),
    ("auth-reset",   575,  32,  848, 186, False),
    ("empty",         16, 222,  290, 378, False),
    ("error",        295, 222,  570, 378, False),
    ("search-empty", 575, 222,  848, 378, False),
    # ── 섹션 배너 ────────────────────────────────────────────
    ("sec-stock",    872,  32, 1130, 180, False),
    ("sec-trending",1135,  32, 1392, 180, False),
    ("sec-news",     872, 222, 1130, 370, False),
    ("sec-profile", 1135, 222, 1392, 370, False),
    # ── 등급 문장 (캡션 라벨이 어긋나 있어 그림으로 판별했다) ──
    ("tier-1",       528, 428,  692, 578, True),   # 삿갓 + 지팡이
    ("tier-2",       184, 596,  350, 745, True),   # 술잔 + 젓가락
    ("tier-3",       354, 596,  526, 745, True),   # 붉은 깃 투구
    ("tier-4",       528, 596,  692, 745, True),   # 금 인장
    # ── 버튼 판 ──────────────────────────────────────────────
    ("plate-teal-118x80",   710, 441,  848, 525, True),
    ("plate-teal-144x80",   868, 441, 1008, 525, True),
    ("plate-teal-168x80",  1024, 441, 1178, 525, True),
    ("plate-teal-316x88",  1192, 441, 1398, 525, True),
    ("plate-bronze-118x80", 870, 556, 1028, 638, True),
    ("plate-bronze-150x80",1032, 556, 1202, 638, True),
    ("plate-bronze-174x80",1206, 556, 1398, 638, True),
    ("plate-bronze-206x88", 932, 659, 1148, 743, True),
    ("plate-bronze-282x80",1152, 659, 1398, 743, True),
]

# 체크무늬 두 색. 여기에 **거의 정확히** 맞는 픽셀만 배경으로 본다.
CHECKER = ((255, 255, 255), (204, 204, 204))
TOL = 6
# 시트 바탕(어두운 회색)도 같이 지운다
SHEET_BG = (70, 70, 70)
BG_TOL = 14


def near(p, c, tol):
    return all(abs(p[i] - c[i]) <= tol for i in range(3))


def strip_checker(im):
    """가장자리에서 연결된 체크무늬·시트바탕만 투명으로 바꾼다."""
    w, h = im.size
    px = im.load()

    def is_bg(p):
        if p[3] == 0:
            return True
        return (
            any(near(p, c, TOL) for c in CHECKER)
            or near(p, SHEET_BG, BG_TOL)
        )

    seen = bytearray(w * h)
    q = deque()

    def seed(x, y):
        i = y * w + x
        if not seen[i] and is_bg(px[x, y]):
            seen[i] = 1
            q.append((x, y))

    for x in range(w):
        seed(x, 0); seed(x, h - 1)
    for y in range(h):
        seed(0, y); seed(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                seed(nx, ny)
    return im


def main():
    if not os.path.exists(SHEET):
        raise SystemExit(f"시트가 없다: {SHEET}")

    sheet = Image.open(SHEET).convert("RGBA")
    print(f"시트 {sheet.width}x{sheet.height}")

    for name, l, t, r, b, alpha in TILES:
        tile = sheet.crop((l, t, r, b))
        if alpha:
            tile = strip_checker(tile)
            bbox = tile.getbbox()
            if bbox:
                tile = tile.crop(bbox)
            path = os.path.join(OUT, f"{name}.webp")
            tile.save(path, "WEBP", quality=92, method=6)
        else:
            path = os.path.join(OUT, f"{name}.webp")
            tile.convert("RGB").save(path, "WEBP", quality=84, method=6)
        size = os.path.getsize(path) / 1024
        print(f"  {name:22s} {tile.width:4d}x{tile.height:3d}  {size:5.0f}KB")

    print("\n완료. 화면에서 확인한 뒤 _sheet2.png 는 지운다.")


if __name__ == "__main__":
    main()
