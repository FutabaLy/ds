import React from 'react';
import {FLASH, IRIS, RISE, ShotDef, Trans, ZOOM} from './components/Shot';
import {IndexChapter, SortIndex} from './scenes/SortIndex';
import {SortScene} from './scenes/SortScene';
import {binInsert} from './scenes/sorts/algo_bininsert';
import {bubble} from './scenes/sorts/algo_bubble';
import {heap} from './scenes/sorts/algo_heap';
import {insertion} from './scenes/sorts/algo_insertion';
import {merge} from './scenes/sorts/algo_merge';
import {quick} from './scenes/sorts/algo_quick';
import {radix} from './scenes/sorts/algo_radix';
import {selection} from './scenes/sorts/algo_selection';
import {shell} from './scenes/sorts/algo_shell';
import {Algo, DEFAULT_INPUT} from './scenes/sorts/engine';
import {INTRO_DUR, Intro} from './scenes/Intro';
import {OUTRO_DUR, Outro} from './scenes/Outro';
import {COL} from './theme';

export type Mood = 'intro' | 'title' | 'concept' | 'outro';

type Entry = {id: string; C: React.FC; dur: number; mood: Mood; tin?: Trans};

const E = (id: string, C: React.FC, dur: number, mood: Mood = 'concept', tin?: Trans): Entry => ({
  id,
  C,
  dur,
  mood,
  tin,
});

/* ------------------------------------------------------------------ *
 * 正片：数据结构 · 排序全览
 * 出场顺序按 408 教材：插入类（直接插入 / 折半插入 / 希尔）
 *                     交换类（冒泡 / 快速）
 *                     选择类（简单选择 / 堆）
 *                     归并、基数
 * ------------------------------------------------------------------ */
export const SORTS: Algo[] = [insertion, binInsert, shell, bubble, quick, selection, heap, merge, radix];

const CHAPTER_COLORS = [
  '#22d3ee',
  '#38bdf8',
  '#818cf8',
  '#a78bfa',
  '#f472b6',
  '#fb923c',
  '#fbbf24',
  '#34d399',
  '#4ade80',
];

const INDEX_DUR = 540;

export type SortChapter = IndexChapter & {key: string; per: number};

/** 每个排序镜头播多久：步数 × 20 帧，夹在 8s ~ 21s 之间 */
const timingOf = (algo: Algo) => {
  const steps = algo.build(algo.input ?? DEFAULT_INPUT).length;
  const dur = Math.min(1260, Math.max(480, Math.round(steps * 20)));
  return {dur, per: Math.max(6, Math.round((dur - 70) / steps))};
};

/**
 * 章节表：序号 / 名字 / 起始时间戳 / 时长。
 * ⚠️ 它是「底部时间戳条」和「目录镜头」的数据源，必须和下面摊平出来的时间轴一致
 * —— 文件末尾有一段断言会在不一致时直接报错。
 */
export const SORT_CHAPTERS: SortChapter[] = (() => {
  let cursor = INTRO_DUR + INDEX_DUR;
  return SORTS.map((a, i) => {
    const {dur, per} = timingOf(a);
    const color = CHAPTER_COLORS[i % CHAPTER_COLORS.length];
    const ch: SortChapter = {
      index: i + 1,
      key: a.key,
      name: a.name,
      sub: a.sub,
      time: a.time,
      space: a.space,
      stable: a.stable,
      color,
      start: cursor,
      end: cursor + dur,
      per,
    };
    cursor = ch.end;
    return ch;
  });
})();

/** 底部时间戳条覆盖的范围（整段排序，含目录镜头） */
export const SORT_RANGE = {
  from: INTRO_DUR,
  to: SORT_CHAPTERS[SORT_CHAPTERS.length - 1].end,
};

const makeSortShot = (ch: SortChapter): React.FC => {
  const algo = SORTS.find((a) => a.key === ch.key)!;
  return () => React.createElement(SortScene, {algo, per: ch.per, color: ch.color});
};

const IndexShot: React.FC = () => React.createElement(SortIndex, {chapters: SORT_CHAPTERS});

/** 全片结构：开场 → 排序全览（目录 + 9 个算法）→ 结尾 */
export const ACT_DEFS: {key: string; color: string; entries: Entry[]}[] = [
  {
    key: 'intro',
    color: COL.intro,
    entries: [E('intro', Intro, INTRO_DUR, 'intro', FLASH)],
  },
  {
    key: 'sorts',
    color: COL.ds,
    entries: [
      E('sort_index', IndexShot, INDEX_DUR, 'title', IRIS(COL.ds)),
      ...SORT_CHAPTERS.map((ch) => E(`sort_${ch.key}`, makeSortShot(ch), ch.end - ch.start, 'concept', ZOOM)),
    ],
  },
  {
    key: 'fin',
    color: COL.fin,
    entries: [E('fin_outro', Outro, OUTRO_DUR, 'outro', RISE)],
  },
];

export type TShot = ShotDef & {mood: Mood; act: number};

/** 把 ACT_DEFS 摊平成一条连续时间轴（网页播放器和渲染共用） */
export const SHOTS: TShot[] = (() => {
  const out: TShot[] = [];
  let cursor = 0;
  ACT_DEFS.forEach((act, ai) => {
    act.entries.forEach((e) => {
      const start = cursor;
      const end = start + e.dur;
      out.push({id: e.id, start, end, C: e.C, tin: e.tin, mood: e.mood, act: ai});
      cursor = end;
    });
  });
  return out;
})();

/** 总帧数：最后一镜的结束帧 */
export const TOTAL = SHOTS[SHOTS.length - 1].end;

/** 每一幕的起止帧，用来生成章节跳转按钮 */
export const ACT_RANGES = ACT_DEFS.map((a, i) => {
  const shots = SHOTS.filter((s) => s.act === i);
  return {
    key: a.key,
    color: a.color,
    s: shots[0].start,
    e: shots[shots.length - 1].end,
  };
});

// 自检：章节时间戳必须和时间轴完全对齐（改了时间轴立刻在这里报错，而不是悄悄错位）
SORT_CHAPTERS.forEach((ch) => {
  const shot = SHOTS.find((s) => s.id === `sort_${ch.key}`);
  if (!shot || shot.start !== ch.start || shot.end !== ch.end) {
    throw new Error(
      `章节时间戳与时间轴不一致：${ch.name} 章节 ${ch.start}-${ch.end}，时间轴 ${shot?.start}-${shot?.end}`,
    );
  }
});
