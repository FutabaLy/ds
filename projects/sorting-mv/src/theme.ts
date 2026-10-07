/** 全局配色 / 字体 / 缓动工具：所有场景都从这里取，保证视觉一致。 */

export const COL = {
  bg: '#02040a',
  panel: '#0b1328',
  line: '#1c2742',
  text: '#eef3ff',
  dim: '#9aa7c2',
  faint: '#4b5872',
  intro: '#5b8cff',
  ds: '#22d3ee',
  co: '#fbbf24',
  os: '#a78bfa',
  cn: '#34d399',
  fin: '#8ab4ff',
} as const;

export const FONT = {
  sans: "'Noto Sans SC','PingFang SC',system-ui,sans-serif",
  mono: "'JetBrains Mono',ui-monospace,SFMono-Regular,monospace",
};

export type Ease = (t: number) => number;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);
export const clamp01 = (x: number) => clamp(x, 0, 1);

export const eIn: Ease = (t) => t * t * t;
export const eOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const eInOut: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const eBack: Ease = (t) => {
  const c = 1.70158;
  const c3 = c + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/**
 * 帧驱动动画的核心工具：`prog(场景内帧, 起始帧, 时长, 缓动)`。
 * 等价于 Remotion 的 interpolate + easing，但写起来更短、更贴近手写动画。
 */
export const prog = (f: number, start: number, dur: number, ease: Ease = eOut) =>
  ease(clamp01((f - start) / Math.max(1, dur)));

const hex2 = (hex: string) => {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

export const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hex2(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};

/** 把 0/1 之间的数变成「总是两位」的显示文本 */
export const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
