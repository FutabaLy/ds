import {Algo, Elem, Slot, Snap, mk, snap} from './engine';

/** 十进制基数：桶 0 ~ 桶 9 共 10 个 */
const R = 10;

/** 取 v 在 place 位上的数字：place = 1 是个位，10 是十位（演示输入都是非负整数） */
const digitAt = (v: number, place: number): number => Math.floor(v / place) % R;

/** 一个桶里现在装着的元素 id（桶内从左往右紧凑排列，右边都是 null 空位） */
const idsIn = (bucket: Slot[]): number[] => bucket.filter((e): e is Elem => e !== null).map((e) => e.id);

/**
 * 基数排序（LSD，最低位优先）—— 多行布局：rows[0] 是主数组，rows[1..10] 是桶 0~9。
 *
 * 关键点：
 *   分配 —— 按当前位把主数组元素逐个搬进对应桶（主数组格子置 null），
 *           每个桶是**定长 n** 的数组，新元素放到桶里第一个 null 位置，
 *           所以桶内永远是从左往右紧凑的，右边剩下的虚线空位就是「桶还空着几格」。
 *   收集 —— 从桶 0 到桶 9，把元素按顺序放回主数组的连续位置（桶里对应格子置 null）。
 * 先个位、再十位……每跑一趟，元素就按「已处理的低位」整体有序一次；最后一趟收集完
 * 元素落位即最终位置，逐个标 done。
 */
export const radix: Algo = {
  key: 'radix',
  name: '基数排序',
  sub: 'Radix Sort (LSD)',
  time: 'O(d(n+r))',
  space: 'O(r)',
  stable: true,
  idea: '按个位、十位依次「分配进 10 个桶，再按桶序收集」',
  input: [21, 35, 12, 47, 58, 63, 74, 89, 96, 10],
  build(input: number[]): Snap[] {
    const n = input.length;
    const a: Slot[] = mk(input);
    // rows[1..10] = 桶 0~9，每行长度都是 n，初始全 null
    const buckets: Slot[][] = Array.from({length: R}, (): Slot[] => new Array<Slot>(n).fill(null));
    const rows = (): Slot[][] => [a, ...buckets];
    const allIds = input.map((_, id) => id);
    const done = new Set<number>(); // 最后一趟收集时元素落到最终位置，累积标 done
    const out: Snap[] = [snap(rows(), '初始：10 个桶都空着')];

    if (n < 1) {
      out.push(snap(rows(), '没有元素，天然有序'));
      out.push(snap(rows(), '完成：整体有序'));
      return out;
    }

    // 最多几位数就跑几趟：两位数 = 个位一趟 + 十位一趟
    const maxV = input.reduce((m, v) => Math.max(m, v), 0);
    const passes = Math.max(1, String(maxV).length);

    for (let p = 0; p < passes; p++) {
      const place = R ** p; // 1 = 个位，10 = 十位
      const unit = p === 0 ? '个位' : p === 1 ? '十位' : `第 ${p + 1} 位`;
      const last = p === passes - 1; // 最后一趟：收集时就地归位
      const cnt = new Array<number>(R).fill(0); // 每个桶已有几个数 → 下一个空位下标

      // —— 分配：按当前位，把主数组元素从左到右逐个搬进对应桶 ——
      out.push(snap(rows(), `第 ${p + 1} 趟：按${unit}分桶`));
      for (let i = 0; i < n; i++) {
        const e = a[i]!;
        const d = digitAt(e.v, place);
        a[i] = null; // 源格子置 null：元素此刻只存在于桶里
        buckets[d][cnt[d]] = e; // 放进桶里第一个空位，保持桶内紧凑
        cnt[d]++;
        out.push(snap(rows(), `${e.v} 的${unit}是 ${d}→桶 ${d}`, {hi: [e.id]}));
      }

      // —— 收集：从桶 0 到桶 9，把元素按顺序放回主数组的连续位置 ——
      let k = 0;
      for (let d = 0; d < R; d++) {
        const ids = idsIn(buckets[d]);
        if (!ids.length) continue; // 空桶不用收集
        out.push(snap(rows(), `收集桶 ${d}`, {hi: ids, done: [...done]}));
        for (let s = 0; s < n; s++) {
          const e = buckets[d][s];
          if (!e) continue; // 桶内空位跳过，保持左紧凑的顺序
          buckets[d][s] = null; // 桶里对应格子置 null
          a[k] = e;
          if (last) done.add(e.id); // 十位收集完的位置就是最终位置
          out.push(snap(rows(), `${e.v} 放回 a[${k}]`, {hi: [e.id], done: [...done]}));
          k++;
        }
      }

      if (!last) {
        out.push(snap(rows(), p === 0 ? '个位分配完成，开始十位' : `第 ${p + 1} 趟完成，继续下一位`, {done: [...done]}));
      }
    }

    out.push(snap(rows(), '完成：整体有序', {done: allIds}));
    return out;
  },
};
