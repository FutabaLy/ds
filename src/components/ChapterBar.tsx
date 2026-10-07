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
 *
 * 网页实时版里 `web/App.tsx` 会在同一条的位置上叠一层透明按钮，点击跳转到对应章节；
 * 渲染成片时它就只是一条静态信息（视频里当然点不了）。
 */
export const ChapterBar: React.FC<{chapters: Chapter[]; from: number; to: number}> = ({chapters, from, to}) => {
  const f = useCurrentFrame();
  const opacity = clamp01(prog(f, from, 22) - prog(f, to - 22, 22));
  if (opacity <= 0) return null;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      {/* 压暗底部，保证时间戳在任何画面上都读得清 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 200,
          background: 'linear-gradient(180deg, rgba(2,4,10,0) 0%, rgba(2,4,10,0.55) 45%, rgba(2,4,10,0.85) 100%)',
        }}
      />
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
          // 未到 / 已过 的章节也保持足够对比度，不能「浅到看不见」
          const dim = active ? 1 : past ? 0.9 : 0.7;
          return (
            <div key={c.label} style={{width: 186, textAlign: 'center'}}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 17,
                  letterSpacing: 1,
                  color: active ? c.color : rgba('#dce6ff', 0.78 * dim),
                  textShadow: active ? `0 0 14px ${rgba(c.color, 0.7)}` : '0 1px 6px rgba(0,0,0,0.9)',
                }}
              >
                {mmss(c.start)}
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 18,
                  marginTop: 5,
                  fontWeight: active ? 700 : 500,
                  whiteSpace: 'nowrap',
                  color: active ? COL.text : rgba('#e8eeff', 0.86 * dim),
                  textShadow: '0 1px 8px rgba(0,0,0,0.95)',
                }}
              >
                {String(c.index).padStart(2, '0')} {c.label}
              </div>
              <div
                style={{
                  height: 3,
                  marginTop: 8,
                  borderRadius: 3,
                  background: active ? c.color : rgba('#ffffff', 0.22),
                  boxShadow: active ? `0 0 14px ${rgba(c.color, 0.85)}` : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
