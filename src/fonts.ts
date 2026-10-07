import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * 字体清单：family 名字要和 CSS 里用的一致。
 * 把对应的 .ttf 丢进 public/fonts/ 就会自动生效；
 * 文件不存在时静默回退到系统字体（不会卡住渲染）。
 */
export const FONT_FILES: [string, string][] = [
  ['Noto Sans SC', 'NotoSansSC.ttf'],
  ['Noto Serif SC', 'NotoSerifSC.ttf'],
  ['JetBrains Mono', 'JetBrainsMono.ttf'],
  ['Orbitron', 'Orbitron.ttf'],
  ['Rajdhani', 'Rajdhani.ttf'],
  ['Unbounded', 'Unbounded.ttf'],
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
