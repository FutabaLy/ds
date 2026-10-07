import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {Txt} from '../components/ui';
import {COL, FONT, rgba} from '../theme';
import {Algo, DEFAULT_INPUT} from './sorts/engine';
import {SortStage} from './sorts/SortStage';

/** 一个排序算法 = 一个镜头：标题 + 动画舞台 + 复杂度脚注 */
export const SortScene: React.FC<{algo: Algo; per: number; color: string}> = ({algo, per, color}) => {
  const steps = useMemo(() => algo.build(algo.input ?? DEFAULT_INPUT), [algo]);

  return (
    <AbsoluteFill>
      <Txt x={140} y={92} size={62} weight={800} letter={1}>
        {algo.name}
      </Txt>
      <Txt x={142} y={174} size={23} color={COL.dim}>
        {algo.sub} · {algo.idea}
      </Txt>
      <div
        style={{
          position: 'absolute',
          right: 150,
          top: 104,
          width: 6,
          height: 52,
          borderRadius: 3,
          background: color,
          boxShadow: `0 0 22px ${rgba(color, 0.8)}`,
        }}
      />
      <SortStage steps={steps} meta={algo} start={30} per={per} />
      {/* 复杂度脚注：原来用 COL.faint(#4b5872) 太暗，几乎看不清；关键值用本段主题色点出来 */}
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 884,
          fontFamily: FONT.mono,
          fontSize: 22,
          letterSpacing: 0.5,
          color: 'rgba(223,232,255,0.82)',
        }}
      >
        平均 <span style={{color, fontWeight: 700}}>{algo.time}</span>
        <span style={{color: 'rgba(223,232,255,0.45)'}}> · </span>
        空间 <span style={{color, fontWeight: 700}}>{algo.space}</span>
        <span style={{color: 'rgba(223,232,255,0.45)'}}> · </span>
        <span style={{color: algo.stable ? '#4ade80' : '#fb923c', fontWeight: 700}}>
          {algo.stable ? '稳定排序' : '不稳定排序'}
        </span>
      </div>
    </AbsoluteFill>
  );
};
