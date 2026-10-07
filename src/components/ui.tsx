import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, clamp01, prog, rgba} from '../theme';
import {useF} from './Shot';

export const Txt: React.FC<{
  children: React.ReactNode;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  weight?: number | string;
  mono?: boolean;
  opacity?: number;
  letter?: number;
  align?: 'left' | 'center';
  width?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  x = 0,
  y = 0,
  size = 28,
  color = '#eef3ff',
  weight = 500,
  mono = false,
  opacity = 1,
  letter = 0,
  align = 'left',
  width,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      fontFamily: mono ? FONT.mono : FONT.sans,
      fontSize: size,
      fontWeight: weight,
      color,
      opacity,
      letterSpacing: letter,
      textAlign: align,
      lineHeight: 1.35,
      ...style,
    }}
  >
    {children}
  </div>
);

/** SVG 箭头层：坐标直接用 1920×1080 画布坐标 */
export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  bend?: number;
  opacity?: number;
  dashed?: boolean;
}> = ({x1, y1, x2, y2, color = '#8ab4ff', width = 3, bend = 0, opacity = 1, dashed = false}) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - bend;
  const ang = (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity, pointerEvents: 'none'}}>
      <path
        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? '10 8' : undefined}
        strokeLinecap="round"
      />
      <polygon
        points="-13,-8 0,0 -13,8"
        fill={color}
        transform={`translate(${x2},${y2}) rotate(${ang})`}
      />
    </svg>
  );
};

/** 底部字幕：按帧淡入淡出 */
export const Caption: React.FC<{text: string; at: number; dur?: number; color?: string}> = ({
  text,
  at,
  dur = 140,
  color = '#9aa7c2',
}) => {
  const f = useF();
  const inT = prog(f, at, 14);
  const outT = prog(f, at + dur - 14, 14);
  const opacity = clamp01(inT - outT);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96,
        textAlign: 'center',
        fontFamily: FONT.sans,
        fontSize: 26,
        color,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

/** 顶部/底部 HUD：当前幕、时间码、进度条 —— 任意 seek 都立刻正确 */
export const ActHUD: React.FC<{acts: {key: string; color: string; s: number; e: number}[]}> = ({acts}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const current = acts.find((a) => f >= a.s && f < a.e) ?? acts[0];
  const t = (frame: number) => {
    const s = Math.floor(frame / fps);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: FONT.mono,
          fontSize: 20,
          color: current.color,
          letterSpacing: 3,
        }}
      >
        <span style={{width: 12, height: 12, borderRadius: 3, background: current.color, display: 'inline-block'}} />
        {current.key.toUpperCase()}
        <span style={{color: rgba('#eef3ff', 0.35), letterSpacing: 1}}>
          {t(f)} / {t(durationInFrames)}
        </span>
      </div>

      <div style={{position: 'absolute', right: 56, top: 46, fontFamily: FONT.mono, fontSize: 18, color: rgba('#eef3ff', 0.45)}}>
        1920×1080 · {fps}fps
      </div>

      <div style={{position: 'absolute', left: 56, right: 56, bottom: 44, height: 4, background: rgba('#ffffff', 0.08), borderRadius: 4}}>
        {acts.map((a) => (
          <div
            key={a.key}
            style={{
              position: 'absolute',
              left: `${(a.s / durationInFrames) * 100}%`,
              width: `${((a.e - a.s) / durationInFrames) * 100}%`,
              height: 4,
              background: rgba(a.color, 0.28),
              borderRadius: 4,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${(f / durationInFrames) * 100}%`,
            height: 4,
            background: current.color,
            borderRadius: 4,
            boxShadow: `0 0 14px ${rgba(current.color, 0.8)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
