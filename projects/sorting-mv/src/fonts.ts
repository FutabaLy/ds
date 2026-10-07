import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * 字体清单：family 名字要和 CSS 里用的一致（见 src/theme.ts 的 FONT）。
 *
 * 字体**已随仓库提供**，是按「项目里实际用到的字符」子集化过的可变字体（共约 0.5 MB）：
 *   public/fonts/       → Remotion 渲染用（staticFile('fonts/xx.ttf')）
 *   web-public/fonts/   → 网页实时版用（Vite 的 publicDir）
 * 需要重新生成（改文案后出现新字、或想换字体）就跑 `python scripts/fetch_fonts.py`；
 * 若文件缺失，渲染与网页都会静默回退到系统字体，不会卡住。
 */
export const FONT_FILES: [string, string][] = [
  ['Noto Sans SC', 'NotoSansSC.ttf'],
  ['JetBrains Mono', 'JetBrainsMono.ttf'],
];

let started = false;

/**
 * 渲染成片 / Studio 预览用：字体没加载完之前不让 Remotion 截图，
 * 否则会出现「前几帧是系统字体、后面才是目标字体」的闪变。
 * 网页实时版走 web/App.tsx 里的 FontFace 异步加载（不阻塞首屏）。
 */
export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts', {timeoutInMilliseconds: 180000});
  Promise.all(
    FONT_FILES.map(([family, file]) =>
      new FontFace(family, `url('${staticFile('fonts/' + file)}')`, {weight: '100 900'})
        .load()
        .then((ff) => {
          document.fonts.add(ff);
        }),
    ),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.warn('[fonts] 字体加载失败，回退系统字体：', err);
      continueRender(handle);
    });
};
