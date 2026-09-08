# -*- coding: utf-8 -*-
"""
가로형 로고 생성 — public/logo/lockup.svg, public/logo/wordmark.svg

## 왜 스크립트인가

워드마크는 서체가 아니라 **윤곽선(path)** 이다. 그래서 코드에서 글자를
고칠 수 없다. 서비스명이 가칭이라 바뀔 가능성이 있으므로, 바뀌었을 때
다시 뽑을 수 있도록 절차를 스크립트로 남긴다.

## 왜 폰트 파일을 싣지 않는가

한글 명조 한 벌은 1~2MB 다. 로고 여섯 자 때문에 그걸 받게 할 수 없다.
여섯 자만 윤곽선으로 변환하면 13KB 로 끝나고, 폰트 로딩 지연도 없다.

## 서체와 라이선스

나눔명조 ExtraBold — SIL Open Font License 1.1.
웹 임베드와 윤곽선 변환이 모두 허용된다. (윈도우 '궁서' 는 라이선스가
걸려 있어 웹에 쓸 수 없다. 삼국지 느낌은 명조 계열로 낸다.)

## 쓰는 법

    python -m pip install fonttools brotli
    python scripts/build_logo.py            # 기본: 영웅호걸닷컴
    python scripts/build_logo.py 다른이름     # 이름이 바뀌면

무기 그림은 scripts/_arm.svgfrag 에 있다. 그림을 고치려면 그 파일을
고치고 이 스크립트를 다시 돌린다.
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_URL = "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800&display=swap"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36"

# 로고 좌표계 (viewBox 900x240) 안에서 워드마크의 자리
WORD_SIZE = 84.0
WORD_X = 398.0
WORD_BASELINE = 170.0

COLORS = {
    "ink": "#15201f",
    "cream": "#fbfaf5",
}


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    data = urllib.request.urlopen(req, timeout=60).read()
    return data if binary else data.decode("utf-8")


def unicode_ranges(spec):
    out = []
    for tok in spec.split(","):
        tok = tok.strip().replace("U+", "").replace("u+", "")
        if "-" in tok:
            a, b = tok.split("-")
            out.append((int(a, 16), int(b, 16)))
        else:
            v = int(tok, 16)
            out.append((v, v))
    return out


def glyph_outlines(text, cache_dir):
    """글자별 (path, advance, unitsPerEm) 를 돌려준다.

    구글 폰트는 한글을 빈도순 92조각으로 쪼개 서비스한다. 필요한 글자가
    들어 있는 조각만 받는다.
    """
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen

    css = fetch(CSS_URL)
    faces = re.findall(r"@font-face\s*\{(.*?)\}", css, re.S)

    where = {}
    for block in faces:
        url = re.search(r"url\((.*?)\)", block).group(1)
        m = re.search(r"unicode-range:\s*([^;]+);", block)
        if not m:
            continue
        rs = unicode_ranges(m.group(1))
        for ch in text:
            if ch not in where and any(a <= ord(ch) <= z for a, z in rs):
                where[ch] = url

    missing = [c for c in text if c not in where]
    if missing:
        raise SystemExit("서체에 없는 글자: " + " ".join(missing))

    os.makedirs(cache_dir, exist_ok=True)
    local = {}
    for url in set(where.values()):
        path = os.path.join(cache_dir, url.rsplit("/", 1)[-1])
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(fetch(url, binary=True))
        local[url] = path

    out = {}
    for ch in text:
        font = TTFont(local[where[ch]])
        gs = font.getGlyphSet()
        name = font.getBestCmap()[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        out[ch] = (pen.getCommands(), gs[name].width, font["head"].unitsPerEm)
        font.close()
    return out


def transform(d, dx, dy, scale, prec=1):
    """폰트 좌표(Y 위쪽 증가)를 SVG 좌표(Y 아래쪽 증가)로 옮긴다.

    SVGPathPen 은 축 방향 직선을 H/V 로 줄여 쓴다. 축 정렬 변환이라
    H 는 H, V 는 V 로 그대로 두고 좌표만 바꾸면 된다.
    """
    out, cmd, buf = [], None, []

    def fmt(v):
        return f"{v:.{prec}f}".rstrip("0").rstrip(".") or "0"

    def flush():
        if cmd is None:
            return
        if cmd == "Z":
            out.append("Z")
        elif cmd == "H":
            out.append("H" + " ".join(fmt(dx + v * scale) for v in buf))
        elif cmd == "V":
            out.append("V" + " ".join(fmt(dy - v * scale) for v in buf))
        else:
            out.append(cmd + " ".join(
                f"{fmt(dx + buf[i] * scale)} {fmt(dy - buf[i + 1] * scale)}"
                for i in range(0, len(buf), 2)
            ))

    for tok in re.findall(r"[A-Za-z]|-?\d*\.?\d+(?:[eE]-?\d+)?", d):
        if tok.isalpha():
            flush()
            cmd = tok.upper()
            buf = []
            if cmd not in "MLCQZHV":
                raise SystemExit("미지원 path 명령: " + tok)
        else:
            buf.append(float(tok))
    flush()
    return "".join(out)


def compose(glyphs, text, size, x0, baseline):
    parts, x = [], x0
    for ch in text:
        d, adv, upem = glyphs[ch]
        parts.append(transform(d, x, baseline, size / upem))
        x += adv * size / upem
    return " ".join(parts), x


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "영웅호걸닷컴"
    cache = os.path.join(ROOT, "scripts", ".fontcache")
    glyphs = glyph_outlines(name, cache)

    arm_path = os.path.join(ROOT, "scripts", "_arm.svgfrag")
    arm = open(arm_path, encoding="utf-8").read()

    out_dir = os.path.join(ROOT, "public", "logo")
    os.makedirs(out_dir, exist_ok=True)

    # ── 가로형 로고 (무기 + 워드마크) ──────────────────────────
    word, end_x = compose(glyphs, name, WORD_SIZE, WORD_X, WORD_BASELINE)
    lockup = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" '
        f'fill="none" role="img" aria-label="{name}">\n'
        f"<title>{name}</title>\n{arm}\n"
        f"<!-- 워드마크 — 나눔명조 ExtraBold(OFL) 윤곽선. "
        f"scripts/build_logo.py 로 생성했다. 손으로 고치지 말 것 -->\n"
        f'<path d="{word}" fill="{COLORS["ink"]}" stroke="{COLORS["cream"]}" '
        f'stroke-width="13" stroke-linejoin="round" paint-order="stroke"/>\n'
        f"</svg>"
    )
    with open(os.path.join(out_dir, "lockup.svg"), "w", encoding="utf-8") as f:
        f.write(lockup)

    # ── 워드마크 단독 (헤더용) ────────────────────────────────
    word2, end2 = compose(glyphs, name, 100.0, 0.0, 100.0)
    wordmark = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -4 {end2:.0f} 110" '
        f'fill="none" role="img" aria-label="{name}">\n'
        f"<title>{name}</title>\n"
        f'<path d="{word2}" fill="{COLORS["ink"]}"/>\n'
        f"</svg>"
    )
    with open(os.path.join(out_dir, "wordmark.svg"), "w", encoding="utf-8") as f:
        f.write(wordmark)

    for fname in ("lockup.svg", "wordmark.svg"):
        size = os.path.getsize(os.path.join(out_dir, fname))
        print(f"  public/logo/{fname}  {size:,} bytes")
    print(f"  워드마크 끝 x = {end_x:.1f} (900 을 넘으면 잘린다)")
    if end_x > 900:
        raise SystemExit("워드마크가 viewBox 를 넘었다. WORD_SIZE 를 줄이거나 "
                         "WORD_X 를 왼쪽으로 옮길 것")


if __name__ == "__main__":
    main()
