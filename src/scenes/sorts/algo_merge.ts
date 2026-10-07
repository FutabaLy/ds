import {Algo, Elem, Slot, Snap, mk, snap} from './engine';

/** 某一行 [from..to] 范围内元素的 id（跳过已经被搬走的 null 空位） */
const idsIn = (row: Slot[], from: number, to: number): number[] =>
  row
    .slice(from, to + 1)
    .filter((e): e is Elem => e !== null)
    .map((e) => e.id);

/**
 * 二路归并排序 —— 多行布局：rows[0] 是主数组，rows[1] 是**等长**的辅助数组。
 *
 * 关键点：辅助数组和主数组共用同一套下标，元素只是在「上面一行 / 下面一行」之间
 * 垂直移动，画面里能直接看出「先把两段整段搬下去，比较后再一个个搬回来」。
 *
 * 两个阶段：
 *   阶段一 搬下去：a[lo..hi] 逐个写进 aux[同一个下标]，主数组对应格子置 null；
 *   阶段二 写回来：比较 aux 里两段的当前头元素，小的写回 a[k]，aux 对应格子置 null。
 * 任一时刻元素都只存在于一个格子里，所以每个快照都是合法排列（checkSnaps 会验证）。
 */
export const merge: Algo = {
  key: 'merge',
  name: '二路归并排序',
  sub: 'Merge Sort',
  time: 'O(n log n)',
  space: 'O(n)',
  stable: true,
  idea: '自底向上两两归并：整段先搬到辅助数组，比较后按序写回',
  build(input: number[]): Snap[] {
    const n = input.length;
    const a: Slot[] = mk(input); // 主数组：元素被搬走的位置留 null 空洞
    const aux: Slot[] = new Array<Slot>(n).fill(null); // 辅助数组：与主数组同一套下标
    const allIds = input.map((_, id) => id);
    const done = new Set<number>(); // 已经并成有序段的下标区间里的元素（累积标青色）
    const out: Snap[] = [snap([a, aux], '初始：主数组待归并')];

    if (n < 2) {
      out.push(snap([a, aux], '只有 1 个元素，天然有序', {done: allIds}));
      out.push(snap([a, aux], '完成：整体有序', {done: allIds}));
      return out;
    }

    // 区间长度 1 → 2 → 4 → 8：每一轮把相邻的两个有序段并成一个更长的有序段
    for (let width = 1; width < n; width *= 2) {
      out.push(snap([a, aux], `区间长度 ${width}：两两归并`));

      for (let lo = 0; lo < n; lo += 2 * width) {
        const mid = Math.min(lo + width - 1, n - 1);
        const hi = Math.min(lo + 2 * width - 1, n - 1);

        // 尾巴上只剩一段（没有右段可并）：它上一轮已经有序，直接标 done
        if (mid >= hi) {
          idsIn(a, lo, hi).forEach((id) => done.add(id));
          out.push(snap([a, aux], `a[${lo}..${hi}] 单独成段，已有序`, {done: [...done]}));
          continue;
        }

        // —— 阶段一：把 a[lo..hi] 逐个搬到辅助数组的同一下标 ——
        out.push(snap([a, aux], `把 a[${lo}..${hi}] 搬到辅助数组`, {hi: idsIn(a, lo, hi)}));
        for (let i = lo; i <= hi; i++) {
          const e = a[i]!;
          aux[i] = e;
          a[i] = null; // 源格子必须置 null，否则同一个 id 会在快照里出现两次
          out.push(snap([a, aux], `${i <= mid ? '左段' : '右段'} ${e.v} 搬到辅助数组`, {hi: [e.id]}));
        }

        // —— 阶段二：比较两段的当前头元素，小的写回主数组 ——
        let i = lo;
        let j = mid + 1;
        let k = lo;
        while (i <= mid && j <= hi) {
          const l = aux[i]!;
          const r = aux[j]!;
          if (l.v <= r.v) {
            // 相等时先取左段：这就是归并排序「稳定」的原因
            aux[i] = null;
            a[k] = l;
            out.push(snap([a, aux], `左${l.v} ≤ 右${r.v}，放回 a[${k}]`, {hi: [l.id]}));
            i++;
          } else {
            aux[j] = null;
            a[k] = r;
            out.push(snap([a, aux], `右${r.v} < 左${l.v}，放回 a[${k}]`, {hi: [r.id]}));
            j++;
          }
          k++;
        }

        // 有一段先取完：另一段剩下的本身有序，按原顺序直接放回
        if (j > hi) {
          out.push(snap([a, aux], '右段取完，左段剩余直接放回', {hi: idsIn(aux, i, mid)}));
          while (i <= mid) {
            const e = aux[i]!;
            aux[i] = null;
            a[k] = e;
            out.push(snap([a, aux], `左段 ${e.v} 放回 a[${k}]`, {hi: [e.id]}));
            i++;
            k++;
          }
        } else {
          out.push(snap([a, aux], '左段取完，右段剩余直接放回', {hi: idsIn(aux, j, hi)}));
          while (j <= hi) {
            const e = aux[j]!;
            aux[j] = null;
            a[k] = e;
            out.push(snap([a, aux], `右段 ${e.v} 放回 a[${k}]`, {hi: [e.id]}));
            j++;
            k++;
          }
        }

        // 这一段全部写回完毕 → 整段有序，累积标 done
        idsIn(a, lo, hi).forEach((id) => done.add(id));
        out.push(snap([a, aux], `a[${lo}..${hi}] 已归并有序`, {done: [...done]}));
      }
    }

    out.push(snap([a, aux], '完成：整体有序', {done: allIds}));
    return out;
  },
};
