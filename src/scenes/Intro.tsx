import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useF, useShot} from '../components/Shot';
import {Chip} from '../components/kit';
import {COL, FONT, clamp01, prog, rgba} from '../theme';

export const INTRO_DUR = 480;

// 确定性伪随机：同一帧永远得到同一片星空（渲染和实时播放结果完全一致）
const STARS = new Array(110).fill(0).map((_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {x: r(1) * 1920, y: r(2) * 1080, s: 1 + r(3) * 2.4, ph: r(4) * 120};
});

export const Intro: React.FC = () => {
  const f = useF();
  const {dur} = useShot();
  const out = prog(f, dur - 30, 28);
  // 注意：第 0 帧就是网页版的「封面帧」，所以标题不能从全透明开始
  const t0 = prog(f, 0, 34);
  const title = 0.25 + 0.75 * t0;
  const titleScale = 0.94 + t0 * 0.06;

  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <AbsoluteFill>
        {STARS.map((s, i) => {
          const tw = 0.35 + 0.65 * Math.abs(Math.sin((f + s.ph) * 0.05));
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: s.x,
                top: s.y,
                width: s.s,
                height: s.s,
                borderRadius: '50%',
                background: rgba('#cfe0ff', tw * 0.8),
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${titleScale})`, opacity: title}}>
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 168,
            fontWeight: 900,
            letterSpacing: 10,
            background: `linear-gradient(92deg, ${COL.intro}, ${COL.cn} 55%, ${COL.co})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: `drop-shadow(0 0 42px ${rgba(COL.intro, 0.45)})`,
          }}
        >
          408 MV
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 32, color: COL.dim, marginTop: 26, letterSpacing: 6, opacity: 0.15 + 0.85 * prog(f, 6, 30)}}>
          数据结构 · 组成原理 · 操作系统 · 计算机网络
        </div>
        <div style={{marginTop: 44, opacity: 0.1 + 0.9 * prog(f, 12, 30)}}>
          <Chip text="Remotion 4" color={COL.intro} />
          <Chip text="1920×1080" color={COL.cn} />
          <Chip text="60fps" color={COL.co} />
          <Chip text="网页实时渲染" color={COL.os} />
        </div>
        <div
          style={{
            marginTop: 60,
            fontFamily: FONT.mono,
            fontSize: 20,
            color: rgba('#eef3ff', 0.4),
            opacity: clamp01(prog(f, 110, 30) - prog(f, dur - 60, 30)),
          }}
        >
          空格播放/暂停 · 双击全屏
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
