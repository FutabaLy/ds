import {Algo, Elem, Snap, mk, snap} from './engine';

/**
 * 冒泡排序 —— 相邻两两比较，大的往后冒。
 *
 * 关键点：
 * 1) 每轮只做「相邻交换」，数组长度不变、元素只挪位置，所以每个快照天然是合法排列，
 *    不需要额外搬元素（不写 `a[j+1] = a[j]` 那种会造出重复元素的写法）。
 * 2) 已排序区间在主数组**右端**：第 k 轮结束后末尾 k 个是全数组最大的 k 个且有序，
 *    所以 done 用「尾部切片」而不是 idsUpTo（idsUpTo 标的是左前缀）。
 * 3) 某一轮一次交换都没发生 → 剩下的区间本来就有序，标记完成并提前结束。
 */
export const bubble: Algo = {
  key: 'bubble',
  name: '冒泡排序',
  sub: 'Bubble Sort',
  time: 'O(n²)',
  space: 'O(1)',
  stable: true,
  idea: '相邻两个比大小，逆序就交换，每轮把最大值冒到右端',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const n = a.length;

    // 已归位的是主数组右端连续 sortedCount 个元素（它们是当前最大的若干个）
    const tail = (sortedCount: number): number[] => a.slice(n - sortedCount).map((e) => e.id);

    const out: Snap[] = [snap([a], '初始：从左到右两两比较')];

    let sortedCount = 0;
    let early = false; // 提前结束标记：某一轮无交换
    for (let end = n - 1; end > 0 && !early; end--) {
      out.push(snap([a], `第 ${n - end} 轮：扫描未排序区间`, {done: tail(sortedCount)}));

      let swapped = false;
      // 一轮冒泡：把 [0..end] 里的最大值顶到下标 end
      for (let j = 0; j < end; j++) {
        out.push(snap([a], `比较 ${a[j].v} 与 ${a[j + 1].v}`, {hi: [a[j].id, a[j + 1].id], done: tail(sortedCount)}));
        if (a[j].v > a[j + 1].v) {
          // 相邻交换：只调换两个元素的位置，绝不复制
          const t = a[j];
          a[j] = a[j + 1];
          a[j + 1] = t;
          swapped = true;
          // 换完之后 a[j+1] 就是刚冒上去的大数
          out.push(snap([a], `${a[j + 1].v} > ${a[j].v}，交换`, {hi: [a[j].id, a[j + 1].id], done: tail(sortedCount)}));
        }
      }

      sortedCount++;
      out.push(snap([a], `${a[end].v} 归位，本轮结束`, {hi: [a[end].id], done: tail(sortedCount)}));

      if (!swapped) {
        // 整轮没换过 → 剩下区间已经有序，后面的轮次全是白跑
        out.push(snap([a], '本轮无交换，已有序，提前结束', {done: a.map((e) => e.id)}));
        early = true;
      }
    }

    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
