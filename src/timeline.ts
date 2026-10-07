import React from 'react';
import {FLASH, IRIS, RISE, ShotDef, SLIDE, Trans, ZOOM} from './components/Shot';
import {ActTitle} from './scenes/ActTitle';
import {CACHE_DUR, CacheDemo} from './scenes/CacheDemo';
import {INTRO_DUR, Intro} from './scenes/Intro';
import {OUTRO_DUR, Outro} from './scenes/Outro';
import {SORT_DUR, SortDemo} from './scenes/SortDemo';
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

/** 标题卡工厂：一个 (标题, 副标题, 颜色) 就是一个镜头 */
const Title = (title: string, sub: string, color: string): React.FC => () =>
  React.createElement(ActTitle, {title, sub, color});

/**
 * 全片时间轴：**这是唯一需要改的地方**。
 * 每个 Act 里按顺序列出镜头（组件 + 时长 + 转场），下面会自动摊平成带 start/end 的 SHOTS。
 */
export const ACT_DEFS: {key: string; color: string; entries: Entry[]}[] = [
  {
    key: 'intro',
    color: COL.intro,
    entries: [E('intro', Intro, INTRO_DUR, 'intro', FLASH)],
  },
  {
    key: 'ds',
    color: COL.ds,
    entries: [
      E('ds_title', Title('数据结构', 'Data Structure', COL.ds), 240, 'title', IRIS(COL.ds)),
      E('ds_sort', SortDemo, SORT_DUR, 'concept', ZOOM),
    ],
  },
  {
    key: 'co',
    color: COL.co,
    entries: [
      E('co_title', Title('计算机组成原理', 'Computer Organization', COL.co), 240, 'title', IRIS(COL.co)),
      E('co_cache', CacheDemo, CACHE_DUR, 'concept', SLIDE),
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

/** 总帧数：最后一镜的结束帧。网页播放器的 durationInFrames 就是它 */
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
