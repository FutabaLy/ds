"""下载 Google Fonts 的字体并按「本项目实际用到的字符」做子集，输出到
`public/fonts/`（渲染用）和 `web-public/fonts/`（网页版用）。

    python scripts/fetch_fonts.py

为什么要子集：Noto Sans SC / Noto Serif SC 全量各 10 MB 上下，而本片源码里
只出现 ~700 个唯一字符，子集后每个文件几百 KB，仓库和 Pages 都轻松。

字体清单与 src/fonts.ts 的 FONT_FILES 对应；可变字体（[wght]）保留整条字重轴，
所以 CSS 里 100~900 的字重都能正常渲染，不需要为粗体单独出文件。
"""

from __future__ import annotations

import io
import pathlib
import sys
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
GOOGLE = "https://raw.githubusercontent.com/google/fonts/main/"

# (保存文件名, Google Fonts 仓库路径)
# 只放主题里真正用到的字族（见 src/theme.ts 的 FONT）：
#   FONT.sans → 'Noto Sans SC'，FONT.mono → 'JetBrains Mono'
# 想加别的字族，在这里加一行 + 在 src/fonts.ts 的 FONT_FILES 里加一条即可。
FONTS: list[tuple[str, str]] = [
    ("NotoSansSC.ttf", "ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"),
    ("JetBrainsMono.ttf", "ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"),
]

# 画面/网页上可能出现、但源码里不一定直接写出来的字符，保险起见一并保留
EXTRA = (
    "0123456789"
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    " .,:;!?()[]{}<>/\\|-–—_+=*&%$#@~'\"`^"
    "×÷≈≠≤≥→←↑↓↔·•…✓✔✗⚠①②③④⑤⑥⑦⑧⑨⑩"
)


def used_chars() -> str:
    """把 src/ 与 web/ 里出现的所有字符收集起来，作为子集依据。"""
    chars: set[str] = set(EXTRA)
    files = [
        p
        for pattern in ("src/**/*.ts", "src/**/*.tsx", "web/**/*.ts", "web/**/*.tsx", "web/**/*.css")
        for p in ROOT.glob(pattern)
    ]
    for p in files:
        chars.update(p.read_text(encoding="utf-8"))
    chars = {c for c in chars if ord(c) > 31}
    return "".join(sorted(chars))


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "network-delay-mv/fetch_fonts"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main() -> int:
    text = used_chars()
    print(f"子集字符数：{len(text)}")

    outs = [ROOT / "public" / "fonts", ROOT / "web-public" / "fonts"]
    for d in outs:
        d.mkdir(parents=True, exist_ok=True)

    total_before = total_after = 0
    for name, path in FONTS:
        url = GOOGLE + path
        print(f"\n{name}\n  下载 {url}")
        try:
            raw = fetch(url)
        except Exception as e:  # noqa: BLE001
            print(f"  失败：{e}")
            return 1

        font = TTFont(io.BytesIO(raw))
        opts = subset.Options()
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        opts.recalc_bounds = True
        opts.drop_tables += ["DSIG"]
        subsetter = subset.Subsetter(options=opts)
        subsetter.populate(text=text)
        subsetter.subset(font)

        buf = io.BytesIO()
        font.save(buf)
        data = buf.getvalue()
        total_before += len(raw)
        total_after += len(data)

        for d in outs:
            (d / name).write_bytes(data)
        print(f"  原始 {len(raw) / 1024:.0f} KB → 子集 {len(data) / 1024:.0f} KB  写入 {' + '.join(str(d.relative_to(ROOT)) for d in outs)}")

    print(f"\n合计：{total_before / 1048576:.1f} MB → {total_after / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
