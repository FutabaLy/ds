# fonts

这里的字体是**随仓库提供的子集字体**（按项目实际用到的字符裁剪过），渲染成片和网页实时版共用：

| 文件 | 字族 | 用在哪 | 大小 |
|---|---|---|---|
| `NotoSansSC.ttf` | Noto Sans SC | 正文/标题（`FONT.sans`） | 约 400 KB |
| `JetBrainsMono.ttf` | JetBrains Mono | 数字/等宽（`FONT.mono`） | 约 80 KB |

两个都是**可变字体**（保留了整条字重轴），所以 100~900 的字重都能正常渲染，不需要为粗体单独出文件。

## 重新生成

改了文案、出现新字符，或者想换字体时：

```bash
python scripts/fetch_fonts.py     # 下载 Google Fonts 原始字体 → 按源码用到的字符子集化 → 写入 public/fonts 与 web-public/fonts
```

脚本会扫描 `src/**` 与 `web/**` 里出现的所有字符作为子集依据（另加一段 ASCII/标点/箭头等保险字符），
所以**新增文案后要重跑一次**，否则新字会回退成系统字体。

全量 Noto Sans SC / Noto Serif SC 各 10 MB 以上，子集后总共约 0.5 MB —— 这也是为什么要裁剪。

## 缺文件会怎样

`src/fonts.ts` 的 `ensureFonts()` 与 `web/App.tsx` 的 FontFace 加载都做了兜底：
文件缺失时静默回退系统字体（不会卡住渲染、不会报错崩掉），只是字形会跟设计稿有差异。