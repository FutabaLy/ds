import React from 'react';
import {eBack, eOut, lerp, prog, rgba} from '../theme';
import {FONT} from '../theme';

/** 弹入：返回可直接展开到 style 上的 {opacity, transform} */
export const popIn = (f: number, start: number, dur = 16, scaleFrom = 0.86) => {
  const t = prog(f, start, dur, eBack);
  return {opacity: Math.min(1, prog(f, start, dur * 0.7, eOut)), transform: `scale(${lerp(scaleFrom, 1, t)})`};
};

/** 按时间表取「第几步」，用来把离散步骤钉到帧上 */
export const stepAt = (f: number, starts: number[]) => {
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (f >= starts[k]) i = k;
  return i;
};

/** 圆角面板 */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  title?: string;
  children?: React.ReactNode;
  glow?: number;
  style?: React.CSSProperties;
}> = ({x, y, w, h, color = '#5b8cff', title, children, glow = 0, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 16,
      border: `1px solid ${rgba(color, 0.42)}`,
      background: `linear-gradient(180deg, ${rgba(color, 0.1)}, rgba(6,10,22,0.72))`,
      boxShadow: glow > 0 ? `0 0 ${28 * glow}px ${rgba(color, 0.35 * glow)}` : undefined,
      padding: '14px 16px',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {title ? (
      <div style={{fontSize: 15, letterSpacing: 2, color: rgba(color, 0.95), marginBottom: 8}}>{title}</div>
    ) : null}
    {children}
  </div>
);

/** 小标签 */
export const Chip: React.FC<{text: string; color?: string; opacity?: number}> = ({
  text,
  color = '#eef3ff',
  opacity = 1,
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      border: `1px solid ${rgba(color, 0.5)}`,
      color,
      fontSize: 13,
      opacity,
      marginRight: 8,
    }}
  >
    {text}
  </span>
);

/** 数值方块（数组 / 存储单元） */
export const Cell: React.FC<{
  x: number;
  y: number;
  label: React.ReactNode;
  w?: number;
  h?: number;
  color?: string;
  active?: boolean;
  dim?: boolean;
}> = ({x, y, label, w = 96, h = 72, color = '#22d3ee', active = false, dim = false}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT.mono,
      fontSize: 26,
      color: active ? '#04070f' : dim ? '#7f8ba6' : '#eef3ff',
      background: active ? color : rgba('#0b1328', 0.92),
      border: `2px solid ${active ? color : rgba(color, dim ? 0.18 : 0.45)}`,
      boxShadow: active ? `0 0 26px ${rgba(color, 0.6)}` : undefined,
      transition: 'none',
    }}
  >
    {label}
  </div>
);
