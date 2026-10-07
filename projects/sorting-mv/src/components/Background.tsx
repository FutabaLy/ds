import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {COL, rgba} from '../theme';

type Stop = [number, string];

/**
 * 全片背景：底色随幕色渐变 + 缓慢漂移的网格 + 暗角。
 * 全部由当前帧算出来，所以任意 seek 都能得到同一画面（可实时播放、也可逐帧渲染）。
 */
export const Background: React.FC<{stops: Stop[]; total: number}> = ({stops, total}) => {
  const f = useCurrentFrame();
  const accent = interpolateColors(
    f,
    stops.map((s) => s[0]),
    stops.map((s) => s[1]),
  );
  const drift = (f * 0.35) % 72;
  const sweep = ((f * 2.2) % (total + 600)) / 60;

  return (
    <AbsoluteFill style={{background: COL.bg, overflow: 'hidden'}}>
      {/* 幕色光晕 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 700px at 22% 18%, ${rgba(accent, 0.22)} 0%, transparent 60%),
                       radial-gradient(900px 620px at 82% 84%, ${rgba(accent, 0.14)} 0%, transparent 62%)`,
        }}
      />
      {/* 网格 */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${rgba('#ffffff', 0.045)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba('#ffffff', 0.045)} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          transform: `translate(${-drift}px, ${-drift * 0.6}px)`,
          maskImage: 'radial-gradient(circle at 50% 45%, black 20%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 20%, transparent 78%)',
        }}
      />
      {/* 扫光 */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(104deg, transparent 42%, ${rgba(accent, 0.1)} 50%, transparent 58%)`,
          transform: `translateX(${(sweep % 2 < 1 ? 1 : -1) * 220}px)`,
        }}
      />
      {/* 暗角 */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.62) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
