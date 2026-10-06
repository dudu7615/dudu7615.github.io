#!/usr/bin/env python3
"""从 ~/.fonts 的 MapleMono-NF-CN 生成网页用子集字体（woff2）到 fonts/。

设计原则——**与页面文字无关**，改文案不用重跑：

  · Latin 全段（ASCII + Latin-1 + 扩展）→ 编程连字 (-> => != === …) 完整保留，
    因为 --layout-features=* 带着 liga/calt，且连字只作用于 ASCII 符号序列。
  · 常用标点、箭头、制表符（0x2000–0x25FF）
  · GB2312 常用汉字 6763 个（固定集合，覆盖网页里能出现的中文）
  · 丢弃 Nerd Font 图标 PUA 区与整个 CJK 扩展区（网页上没用）

只有想换字重或改区段时才需要重跑：

    uv run --with fonttools --with brotli python tools/subset-font.py
"""
import subprocess
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS_DIR = ROOT / "fonts"
SRC_DIR = pathlib.Path.home() / ".fonts"


def build_charset() -> str:
    chars = set()
    for lo, hi in [
        (0x0020, 0x007F),   # ASCII
        (0x00A0, 0x0180),   # Latin-1 补充 + 扩展 A/B
        (0x2000, 0x2070),   # 常用标点、破折号、引号
        (0x2190, 0x2200),   # 箭头
        (0x2500, 0x2580),   # 制表符（连字/框线）
        (0x25A0, 0x2600),   # 几何图形、项目符号
    ]:
        chars.update(chr(c) for c in range(lo, hi))

    # GB2312 常用汉字 + 符号（固定 6763 汉字）
    for hi in range(0xA1, 0xFA):
        for lo in range(0xA1, 0xFF):
            try:
                chars.add(bytes([hi, lo]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    return "".join(sorted(chars))


def main() -> None:
    charset = build_charset()
    FONTS_DIR.mkdir(exist_ok=True)
    plan = [
        ("MapleMono-NF-CN-Regular.ttf", "maple-mono-regular.woff2"),
        ("MapleMono-NF-CN-Bold.ttf",    "maple-mono-bold.woff2"),
    ]
    for src_name, out_name in plan:
        src = SRC_DIR / src_name
        if not src.exists():
            sys.exit(f"找不到字体：{src}")
        out = FONTS_DIR / out_name
        subprocess.run(
            [sys.executable, "-m", "fontTools.subset", str(src),
             f"--output-file={out}",
             f"--text={charset}",
             "--flavor=woff2",
             "--layout-features=*",      # 保留 liga / calt → 编程连字
             "--drop-tables+=DSIG"],
            check=True,
        )
        print(f"  {out_name:<26} {out.stat().st_size / 1024:9.1f} KB")
    print(f"字符集固定 {len(charset)} 个（Latin + 标点 + GB2312 汉字）")


if __name__ == "__main__":
    main()
