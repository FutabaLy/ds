import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useF, useShot} from '../components/Shot';
import {Card} from '../components/kit';
import {Txt} from '../components/ui';
import {COL, FONT, prog, rgba} from '../theme';

export const OUTRO_DUR = 480;

const ROWS: [string, string, string][] = [
  ['渲染成片', 'npx remotion render MV408 out/mv.mp4', COL.intro],
  ['网页实时版', 'Remotion Player 逐帧实时渲染', COL.cn],
  ['同一份代码', '时间轴 / 场景 / 音频全部复用', COL.co],
];

export const Outro: React.FC = () => {
  const f = useF();
  const {dur} = useShot();
  const title = prog(f, 8, 26);
  const out = prog(f, dur - 34, 30);

  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Txt x={0} y={200} width={1920} align="center" size={92} weight={900} letter={8} opacity={title}>
        一套代码 · 两种输出
      </Txt>
      <Txt
        x={0}
        y={322}
        width={1920}
        align="center"
        size={26}
        color={COL.dim}
        opacity={prog(f, 26, 26)}
      >
        Remotion 把视频变成「帧号 → 画面」的纯函数，于是渲染和播放共用同一条时间轴
      </Txt>

      {ROWS.map(([k, v, c], i) => {
        const t = prog(f, 54 + i * 18, 24);
        return (
          <div key={k} style={{opacity: t, transform: `translateY(${(1 - t) * 26}px)`}}>
            <Card x={300 + i * 440} y={430} w={400} h={190} color={c} glow={t}>
              <div style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, color: c}}>{k}</div>
              <div style={{fontFamily: FONT.mono, fontSize: 17, color: COL.dim, marginTop: 18, lineHeight: 1.6}}>{v}</div>
            </Card>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 220,
          textAlign: 'center',
          fontFamily: FONT.mono,
          fontSize: 22,
          color: rgba('#eef3ff', 0.5),
          opacity: prog(f, 130, 30),
          letterSpacing: 2,
        }}
      >
        template for 408.bemly.moe style real-time web MV
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 150,
          textAlign: 'center',
          fontFamily: FONT.mono,
          fontSize: 18,
          color: rgba('#eef3ff', 0.28),
          opacity: prog(f, 150, 30),
          letterSpacing: 4,
        }}
      >
        npm run studio · npm run render · npm run web:dev
      </div>
    </AbsoluteFill>
  );
};
