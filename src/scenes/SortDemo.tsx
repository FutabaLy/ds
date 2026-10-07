import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Arrow, Caption, Txt} from '../components/ui';
import {useF} from '../components/Shot';
import {COL, FONT, clamp01, eInOut, lerp, prog, rgba} from '../theme';

export const SORT_DUR = 960;

const INPUT = [5, 2, 9, 1, 7, 3];

/** 元素带稳定 id：动画只移动 id，不靠「值」去认元素，所以不会出现重复/丢失 */
type Elem = {id: number; v: number};
type Snap = {arr: Elem[]; a: number; b: number; sorted: number; note: string};

/**
 * 直接插入排序的每一步快照。
 * 关键点：每一步都是一份**合法排列**（取出 → 比较 → 整体后移 → 插入），
 * 而不是经典写法里 arr[j+1] = arr[j] 那种「中间态有重复元素」的形式 ——
 * 后者做成动画会出现两根柱子重叠、被取出的元素短暂消失。
 */
const buildSteps = (input: number[]): Snap[] => {
  const arr: Elem[] = input.map((v, id) => ({id, v}));
  const steps: Snap[] = [{arr: arr.map((e) => ({...e})), a: -1, b: -1, sorted: 0, note: '初始：只把第 1 个元素当作已排序区间'}];

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    steps.push({arr: arr.map((e) => ({...e})), a: i, b: -1, sorted: i - 1, note: `取出 ${key.v}，向左逐个比较`});

    let j = i - 1;
    while (j >= 0) {
      const cmp = arr[j].v > key.v ? '>' : '≤';
      steps.push({
        arr: arr.map((e) => ({...e})),
        a: j,
        b: i,
        sorted: i - 1,
        note: `比较 ${arr[j].v} ${cmp} ${key.v}${cmp === '>' ? ' → 继续左移' : ' → 位置确定'}`,
      });
      if (arr[j].v > key.v) j--;
      else break;
    }

    if (j + 1 !== i) {
      arr.splice(i, 1);
      arr.splice(j + 1, 0, key);
      steps.push({
        arr: arr.map((e) => ({...e})),
        a: j + 1,
        b: -1,
        sorted: i,
        note: `${key.v} 插入下标 ${j + 1}，中间元素整体右移一位`,
      });
    } else {
      steps.push({arr: arr.map((e) => ({...e})), a: i, b: -1, sorted: i, note: `${key.v} 已在正确位置`});
    }
  }
  steps.push({arr: arr.map((e) => ({...e})), a: -1, b: -1, sorted: arr.length - 1, note: '完成：整体有序'});
  return steps;
};

const STEPS = buildSteps(INPUT);
const PER = Math.max(14, Math.floor((SORT_DUR - 110) / STEPS.length));
const START = 40;

const W = 118;
const GAP = 22;
const X0 = (1920 - (INPUT.length * W + (INPUT.length - 1) * GAP)) / 2;
const BASE_Y = 760;
const H = (v: number) => 40 + v * 42;
const xOf = (i: number) => X0 + i * (W + GAP);
const idxOf = (arr: Elem[], id: number) => arr.findIndex((e) => e.id === id);

export const SortDemo: React.FC = () => {
  const f = useF();
  const raw = (f - START) / PER;
  const idx = Math.max(0, Math.min(STEPS.length - 1, Math.floor(raw)));
  const prev = STEPS[Math.max(0, idx - 1)];
  const cur = STEPS[idx];
  // 步骤切换的前 12 帧做位置插值，元素是「滑过去」而不是瞬移
  const t = eInOut(clamp01(((raw - idx) * PER) / 12));

  const done = idx === STEPS.length - 1;
  const comparing = cur.b >= 0;

  return (
    <AbsoluteFill>
      <Txt x={140} y={120} size={64} weight={800} letter={2}>
        插入排序 · 逐步可视化
      </Txt>
      <Txt x={140} y={206} size={24} color={COL.dim}>
        每一帧都从「当前步骤快照」重算坐标 —— 拖动进度条任意跳转，画面永远自洽
      </Txt>

      <div
        style={{
          position: 'absolute',
          left: X0 - 60,
          top: BASE_Y + 6,
          width: 1920 - 2 * (X0 - 60),
          height: 2,
          background: rgba('#ffffff', 0.14),
        }}
      />

      {INPUT.map((_, id) => {
        const elem = cur.arr.find((e) => e.id === id) ?? prev.arr.find((e) => e.id === id)!;
        const to = idxOf(cur.arr, id);
        const from = idxOf(prev.arr, id);
        const x = lerp(xOf(from < 0 ? to : from), xOf(to < 0 ? from : to), t);
        const active = comparing && (to === cur.a || to === cur.b);
        const isSorted = to <= cur.sorted;
        const color = done ? COL.cn : active ? COL.co : isSorted ? COL.ds : '#5a6b83';
        const h = H(elem.v);
        return (
          <div key={id} style={{position: 'absolute', left: x, top: BASE_Y - h, width: W, height: h}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 12,
                background: active
                  ? `linear-gradient(180deg, ${rgba(color, 0.95)}, ${rgba(color, 0.45)})`
                  : `linear-gradient(180deg, ${rgba(color, 0.34)}, ${rgba(color, 0.06)})`,
                border: `2px solid ${rgba(color, active ? 1 : 0.5)}`,
                boxShadow: active
                  ? `0 0 34px ${rgba(color, 0.65)}`
                  : isSorted
                    ? `0 0 16px ${rgba(COL.ds, 0.25)}`
                    : undefined,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -52,
                textAlign: 'center',
                fontFamily: FONT.mono,
                fontSize: 34,
                color: active ? '#ffffff' : COL.text,
                opacity: active ? 1 : 0.85,
              }}
            >
              {elem.v}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -40,
                textAlign: 'center',
                fontFamily: FONT.mono,
                fontSize: 18,
                color: rgba('#eef3ff', 0.35),
              }}
            >
              {to}
            </div>
          </div>
        );
      })}

      {comparing ? (
        <Arrow
          x1={xOf(cur.a) + W / 2}
          y1={BASE_Y + 44}
          x2={xOf(cur.b) + W / 2}
          y2={BASE_Y + 44}
          color={COL.co}
          bend={26}
        />
      ) : null}

      <Caption text={cur.note} at={START} dur={SORT_DUR - START - 20} color={done ? COL.cn : COL.dim} />

      <Txt x={140} y={880} size={22} color={COL.faint} mono opacity={clamp01(prog(f, START, 30))}>
        step {idx + 1}/{STEPS.length} · 最好 O(n)、最坏 O(n²) · 稳定排序
      </Txt>
    </AbsoluteFill>
  );
};
