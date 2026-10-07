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
      <Txt x={140} y={890} size={21} mono color={COL.faint}>
        平均 {algo.time} · 空间 {algo.space} · {algo.stable ? '稳定排序' : '不稳定排序'}
      </Txt>
    </AbsoluteFill>
  );
};
