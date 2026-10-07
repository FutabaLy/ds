import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useF, useShot} from '../components/Shot';
import {Txt} from '../components/ui';
import {COL, FONT, prog, rgba} from '../theme';

export type IndexChapter = {
  index: number;
  name: string;
  sub: string;
  time: string;
  space: string;
  stable: boolean;
  color: string;
  start: number;
  end: number;
};

const mmss = (frame: number) => {
  const s = Math.floor(frame / 60);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * 目录镜头：9 个排序算法一张表 —— 序号、名字、**时间戳**、复杂度、稳定性。
 * 底部那条时间戳条（ChapterBar）在整段排序里都会在，这里给它一个「总览」。
 */
export const SortIndex: React.FC<{chapters: IndexChapter[]}> = ({chapters}) => {
  const f = useF();
  const {dur} = useShot();
  const out = prog(f, dur - 26, 24);

  const W = 500;
  const H = 168;
  const GX = 40;
  const GY = 28;
  const x0 = (1920 - (W * 3 + GX * 2)) / 2;
  const y0 = 292;

  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Txt x={0} y={128} width={1920} align="center" size={76} weight={900} letter={6} opacity={prog(f, 0, 26)}>
        数据结构 · 排序全览
      </Txt>
      <Txt x={0} y={232} width={1920} align="center" size={26} color={COL.dim} opacity={prog(f, 10, 26)}>
        9 种内部排序 · 每个算法一段逐帧动画 · 下方时间戳就是章节名
      </Txt>

      {chapters.map((c, i) => {
        const t = prog(f, 26 + i * 11, 22);
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <div
            key={c.name}
            style={{
              position: 'absolute',
              left: x0 + col * (W + GX),
              top: y0 + row * (H + GY),
              width: W,
              height: H,
              borderRadius: 16,
              border: `1px solid ${rgba(c.color, 0.45)}`,
              borderLeft: `8px solid ${c.color}`,
              background: `linear-gradient(180deg, ${rgba(c.color, 0.12)}, rgba(6,10,22,0.7))`,
              padding: '16px 20px',
              boxSizing: 'border-box',
              opacity: t,
              transform: `translateY(${(1 - t) * 18}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
              <span style={{fontFamily: FONT.mono, fontSize: 26, color: c.color}}>{String(c.index).padStart(2, '0')}</span>
              <span style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, color: COL.text}}>{c.name}</span>
            </div>
            <div style={{fontFamily: FONT.mono, fontSize: 19, color: rgba('#eef3ff', 0.55), marginTop: 12}}>
              {mmss(c.start)} – {mmss(c.end)}
              <span style={{color: rgba('#eef3ff', 0.3)}}> · {c.sub}</span>
            </div>
            <div style={{fontFamily: FONT.mono, fontSize: 17, color: rgba('#eef3ff', 0.4), marginTop: 8}}>
              {c.time} · 空间 {c.space} · {c.stable ? '稳定' : '不稳定'}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
