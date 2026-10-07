/**
 * 排序可视化引擎（纯逻辑，不依赖 React）。
 *
 * 设计：**算法只负责产出「快照序列」，画面由 SortStage 统一渲染。**
 * 这样 9 个排序算法共用一套动画/插值/配色，加算法只要写一个文件。
 *
 * 一条硬性约束：任何中间快照都必须是同一组元素的**合法排列**
 * —— 每个元素 id 恰好出现一次，不许凭空重复或消失。
 * 原因：渲染器按元素 id 追踪位置做插值，出现重复就会有两根柱子重叠、
 * 消失就会让柱子闪没。所以移位类算法要用 splice 真正搬元素，
 * 不能用 `arr[j+1] = arr[j]` 那种「中间态有重复」的写法；
 * 归并/基数这类需要辅助空间的，用 rows[1..] 当缓冲区/桶，主数组里允许留 null 空洞。
 */
export type Elem = {id: number; v: number};
export type Slot = Elem | null;

export type Snap = {
  /** rows[0] = 主数组；rows[1..] = 辅助数组 / 桶 / 缓冲区 */
  rows: Slot[][];
  /** 正在比较或移动的元素（琥珀色高亮） */
  hi?: number[];
  /** 已归位的元素（青色） */
  done?: number[];
  /** 基准元素（品红，快排/归并用） */
  pivot?: number;
  /** 这一步在做什么：会显示在画面下方当字幕，中文、尽量 ≤ 16 字 */
  note: string;
};

export type AlgoMeta = {
  key: string;
  /** 章节名（会出现在底部时间戳条上） */
  name: string;
  sub: string;
  time: string;
  space: string;
  stable: boolean;
  /** 一句话思路 */
  idea: string;
  /** 这个算法演示时用的输入（不填就用 DEFAULT_INPUT）；基数排序需要两位数 */
  input?: number[];
};

export type Algo = AlgoMeta & {build: (input: number[]) => Snap[]};

/** 比较类排序统一用的演示输入：8 个互不相同的数 */
export const DEFAULT_INPUT = [5, 2, 9, 1, 7, 3, 8, 4];

export const mk = (input: number[]): Elem[] => input.map((v, id) => ({id, v}));

export const cloneRows = (rows: Slot[][]): Slot[][] => rows.map((r) => r.map((e) => (e ? {...e} : null)));

export const snap = (
  rows: Slot[][],
  note: string,
  extra: {hi?: number[]; done?: number[]; pivot?: number} = {},
): Snap => ({
  rows: cloneRows(rows),
  hi: extra.hi ? [...extra.hi] : [],
  done: extra.done ? [...extra.done] : [],
  pivot: extra.pivot,
  note,
});

/** 元素现在在哪个格子；找不到返回 null */
export const colOf = (rows: Slot[][], id: number): {row: number; col: number} | null => {
  for (let r = 0; r < rows.length; r++) {
    const c = rows[r].findIndex((e) => e !== null && e.id === id);
    if (c >= 0) return {row: r, col: c};
  }
  return null;
};

/** 主数组（第一行）里前 upTo 个元素（含）的 id，用来标「已排序区间」 */
export const idsUpTo = (row: Slot[], upTo: number): number[] =>
  row.slice(0, upTo + 1).filter((e): e is Elem => e !== null).map((e) => e.id);

export const valuesOf = (row: Slot[]): number[] =>
  row.filter((e): e is Elem => e !== null).map((e) => e.v);

/** 每个快照的行数/列数上限（渲染器据此算格子大小） */
export const shapeOf = (steps: Snap[]) => {
  let rows = 1;
  let cols = 1;
  let maxVal = 1;
  steps.forEach((s) => {
    rows = Math.max(rows, s.rows.length);
    s.rows.forEach((r) => {
      cols = Math.max(cols, r.length);
      r.forEach((e) => {
        if (e) maxVal = Math.max(maxVal, e.v);
      });
    });
  });
  return {rows, cols, maxVal};
};

/**
 * 自检：跑完一组快照，检查
 * 1) 每个快照里元素 id 不重复、不丢失；2) 最终主数组升序；3) 步数合理。
 * scripts/check_sorts.mjs 会用它把 9 个算法全过一遍。
 */
export const checkSnaps = (steps: Snap[], n: number): string[] => {
  const problems: string[] = [];
  if (steps.length < 3) problems.push(`快照只有 ${steps.length} 个，太少`);
  steps.forEach((s, i) => {
    const seen = new Set<number>();
    s.rows.flat().forEach((e) => {
      if (!e) return;
      if (seen.has(e.id)) problems.push(`快照 ${i}：元素 ${e.id} 重复出现`);
      seen.add(e.id);
    });
    if (seen.size !== n) problems.push(`快照 ${i}：只有 ${seen.size}/${n} 个元素（有元素消失了）`);
  });
  const finalRow = steps[steps.length - 1].rows[0];
  const vals = valuesOf(finalRow);
  if (vals.length !== n) problems.push(`最终主数组只有 ${vals.length}/${n} 个元素`);
  for (let i = 1; i < vals.length; i++) {
    if (vals[i - 1] > vals[i]) {
      problems.push(`最终结果不是升序：[${vals.join(',')}]`);
      break;
    }
  }
  return problems;
};
