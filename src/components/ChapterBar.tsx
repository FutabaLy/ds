import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, FONT, clamp01, prog, rgba} from '../theme';

export type Chapter = {index: number; label: string; start: number; end: number; color: string};

const mmss = (frame: number) => {
  const s = Math.floor(frame / 60);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * 画面底部的时间戳条：**每个排序的名字 + 起始时间**，当前那一段高亮。
 * 挂在 Main 上覆盖所有镜头，只在排序段落里淡入淡出（不是网页 UI，是烧进视频的）。
 */
export const ChapterBar: React.FC<{chapters: Chapter[]; from: number; to: number}> = ({chapters, from, to}) => {
  const f = useCurrentFrame();
  const opacity = clamp01(prog(f, from, 22) - prog(f, to - 22, 22));
  if (opacity <= 0) return null;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <div
        style={{
          position: 'absolute',
          left: 118,
          right: 118,
          bottom: 52,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {chapters.map((c) => {
          const active = f >= c.start && f < c.end;
          const past = f >= c.end;
          const o = active ? 1 : past ? 0.5 : 0.28;
          return (
            <div key={c.label} style={{width: 186, textAlign: 'center', opacity: o}}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 16,
                  color: active ? c.color : rgba('#eef3ff', 0.5),
                  letterSpacing: 1,
                }}
              >
                {mmss(c.start)}
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 18,
                  marginTop: 4,
                  color: active ? COL.text : rgba('#eef3ff', 0.62),
                  fontWeight: active ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {String(c.index).padStart(2, '0')} {c.label}
              </div>
              <div
                style={{
                  height: 3,
                  marginTop: 7,
                  borderRadius: 3,
                  background: active ? c.color : rgba('#ffffff', 0.12),
                  boxShadow: active ? `0 0 14px ${rgba(c.color, 0.8)}` : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
