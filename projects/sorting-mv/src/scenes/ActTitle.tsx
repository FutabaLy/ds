import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useShot} from '../components/Shot';
import {COL, FONT, prog, rgba} from '../theme';
import {useF} from '../components/Shot';

/** 每个 Act 的开场标题卡：拿到一个 (标题, 副标题, 颜色) 就能复用 */
export const ActTitle: React.FC<{title: string; sub: string; color: string}> = ({title, sub, color}) => {
  const f = useF();
  const {dur} = useShot();
  const sweep = prog(f, 6, 40);
  const fadeOut = prog(f, dur - 26, 24);
  const opacity = 1 - fadeOut;

  return (
    <AbsoluteFill style={{opacity}}>
      {/* 横向扫过的色带 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 470,
          width: 1920 * sweep,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 240,
          top: 400,
          opacity: prog(f, 4, 20),
          transform: `translateX(${(1 - prog(f, 4, 26)) * -40}px)`,
        }}
      >
        <div style={{fontFamily: FONT.mono, fontSize: 22, color: rgba(color, 0.85), letterSpacing: 8}}>
          {sub.toUpperCase()}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 108, fontWeight: 800, color: COL.text, letterSpacing: 6, marginTop: 12}}>
          {title}
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 24, color: COL.dim, marginTop: 16, opacity: prog(f, 24, 20)}}>
          frame = f(t) · 所有画面都由当前帧算出来
        </div>
      </div>
    </AbsoluteFill>
  );
};
