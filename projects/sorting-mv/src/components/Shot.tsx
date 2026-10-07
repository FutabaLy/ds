import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {clamp01, eIn, eInOut, eOut, lerp, rgba} from '../theme';

/**
 * 转场系统。
 * 每个镜头只声明自己的「入场转场」(tin)，出场时复用下一个镜头的入场转场，
 * 于是相邻镜头天然重叠 pre+post 帧，形成连续的运镜，而不是硬切。
 */
export type TransType = 'zoom' | 'slide' | 'rise' | 'iris' | 'flash';
export type Trans = {type: TransType; pre: number; post: number; color?: string};

export const ZOOM: Trans = {type: 'zoom', pre: 14, post: 16};
export const SLIDE: Trans = {type: 'slide', pre: 14, post: 16};
export const RISE: Trans = {type: 'rise', pre: 14, post: 16};
export const IRIS = (color: string): Trans => ({type: 'iris', pre: 0, post: 44, color});
export const FLASH: Trans = {type: 'flash', pre: 0, post: 30};

export type ShotDef = {id: string; start: number; end: number; C: React.FC; tin?: Trans};

type Ctx = {offset: number; dur: number};
export const ShotCtx = createContext<Ctx>({offset: 0, dur: 600});
export const useShot = () => useContext(ShotCtx);
/** 场景内帧号：0 = 这个镜头的「正片」起点（不含转场重叠区） */
export const useF = () => useCurrentFrame() - useContext(ShotCtx).offset;

const ShotFrame: React.FC<{
  tin: Trans | null;
  tout: Trans | null;
  dur: number;
  children: React.ReactNode;
}> = ({tin, tout, dur, children}) => {
  const lf = useCurrentFrame();
  const inLen = tin ? tin.pre + tin.post : 1;
  const a = tin ? clamp01(lf / inLen) : 1;
  const outLen = tout ? tout.pre + tout.post : 1;
  const b = tout ? clamp01((lf - (dur - outLen)) / outLen) : 0;

  const tf: string[] = [];
  let opacity = 1;
  let blur = 0;
  let clip: string | undefined;
  let mask: string | undefined;
  let ring: React.ReactNode = null;

  if (tin && a < 1) {
    const t = eInOut(a);
    switch (tin.type) {
      case 'zoom':
        opacity *= t;
        tf.push(`scale(${lerp(0.86, 1, eOut(a))})`);
        blur += (1 - t) * 14;
        break;
      case 'slide':
        opacity *= clamp01(a * 1.6);
        tf.push(`translateX(${(1 - eOut(a)) * 520}px)`);
        blur += (1 - t) * 10;
        break;
      case 'rise':
        opacity *= clamp01(a * 1.6);
        tf.push(`translateY(${(1 - eOut(a)) * 320}px)`);
        blur += (1 - t) * 10;
        break;
      case 'iris': {
        const r = lerp(0, 1180, t);
        clip = `circle(${r}px at 50% 50%)`;
        const c = tin.color ?? '#ffffff';
        ring = (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <div
              style={{
                position: 'absolute',
                left: 960 - r,
                top: 540 - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                border: `${lerp(10, 2, t)}px solid ${rgba(c, 1 - t * 0.6)}`,
                boxShadow: `0 0 60px 18px ${rgba(c, 0.7 * (1 - t))}, inset 0 0 80px 20px ${rgba(c, 0.55 * (1 - t))}`,
              }}
            />
            <AbsoluteFill
              style={{
                background: `radial-gradient(circle at 50% 50%, ${rgba('#ffffff', 0.9)} 0%, ${rgba(c, 0.5)} 30%, transparent 70%)`,
                opacity: Math.max(0, 1 - lf / 22) * 0.85,
              }}
            />
          </AbsoluteFill>
        );
        break;
      }
      case 'flash':
        opacity *= eOut(a);
        tf.push(`scale(${lerp(1.1, 1, eOut(a))})`);
        ring = (
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${rgba('#9ec5ff', 0.6)} 35%, transparent 75%)`,
              opacity: Math.max(0, 1 - lf / 26),
            }}
          />
        );
        break;
    }
  }

  if (tout && b > 0) {
    const t = eInOut(b);
    switch (tout.type) {
      case 'zoom':
        opacity *= 1 - t;
        tf.push(`scale(${lerp(1, 1.16, eIn(b))})`);
        blur += t * 14;
        break;
      case 'slide':
        opacity *= 1 - clamp01(b * 1.6 - 0.6);
        tf.push(`translateX(${-eIn(b) * 520}px)`);
        blur += t * 10;
        break;
      case 'rise':
        opacity *= 1 - clamp01(b * 1.6 - 0.6);
        tf.push(`translateY(${-eIn(b) * 320}px)`);
        blur += t * 10;
        break;
      case 'iris': {
        const r = lerp(0, 1180, t);
        mask = `radial-gradient(circle at 50% 50%, transparent ${r}px, black ${r + 1}px)`;
        tf.push(`scale(${lerp(1, 1.12, eIn(b))})`);
        break;
      }
      case 'flash':
        opacity *= 1 - eOut(b);
        tf.push(`scale(${lerp(1, 1.08, eOut(b))})`);
        break;
    }
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity, clipPath: clip, WebkitMaskImage: mask, maskImage: mask}}>
        <AbsoluteFill
          style={{
            transform: tf.join(' ') || undefined,
            filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      {ring}
    </AbsoluteFill>
  );
};

export const Shots: React.FC<{shots: ShotDef[]}> = ({shots}) => (
  <>
    {shots.map((s, i) => {
      const tin = i === 0 ? null : (s.tin ?? ZOOM);
      const next = shots[i + 1];
      const tout = next ? (next.tin ?? ZOOM) : null;
      const pre = tin ? tin.pre : 0;
      const post = tout ? tout.post : 0;
      return (
        <Sequence key={s.id} from={s.start - pre} durationInFrames={s.end - s.start + pre + post} name={s.id}>
          <ShotFrame tin={tin} tout={tout} dur={s.end - s.start + pre + post}>
            <ShotCtx.Provider value={{offset: pre, dur: s.end - s.start}}>
              <s.C />
            </ShotCtx.Provider>
          </ShotFrame>
        </Sequence>
      );
    })}
  </>
);
