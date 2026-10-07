把字体文件放到这个目录就能自动生效（文件名要和 src/fonts.ts 里的列表一致）：

- NotoSansSC.ttf
- NotoSerifSC.ttf
- JetBrainsMono.ttf
- Orbitron.ttf
- Rajdhani.ttf
- Unbounded.ttf

说明：
- 渲染成片走 src/fonts.ts 的 ensureFonts()（delayRender 等字体就绪）；
- 网页实时版走 web/App.tsx 的 FontFace 异步加载（不阻塞首屏）。
- 目录里没有对应文件时会静默回退到系统字体，模板依然能跑（浏览器控制台会有 404，属正常）。
- 中文字体体积很大（Noto Sans SC 全量约 17MB），网页版建议做子集化再上线。
