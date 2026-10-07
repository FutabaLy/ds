import {Algo, Elem, Snap, idsUpTo, mk, snap} from './engine';

/**
 * 简单选择排序 —— 每轮在未排序区间里挑出最小值，与区间首位交换。
 *
 * 关键点：
 * 1) 扫描阶段只移动 minIdx 这个「下标游标」，数组本身不动；
 * 2) 每轮最多一次交换，交换用「临时变量三角换位」，长度不变 → 每个快照都是合法排列；
 * 3) 已排序区间在主数组**左端**：每轮结束后 [0..i] 有序且是全局最小的 i+1 个，
 *    所以 done 直接用 idsUpTo(a, i)。
 */
export const selection: Algo = {
  key: 'select',
  name: '简单选择排序',
  sub: 'Selection Sort',
  time: 'O(n²)',
  space: 'O(1)',
  stable: false,
  idea: '每轮从未排序区间选出最小值，交换到区间最前面',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const n = a.length;

    const out: Snap[] = [snap([a], '初始：整个数组待排序')];

    for (let i = 0; i < n - 1; i++) {
      // 区间 [0..i-1] 已经归位，本轮要在 [i..n-1] 里找最小
      out.push(snap([a], `第 ${i + 1} 轮：假设首位最小`, {hi: [a[i].id], done: idsUpTo(a, i - 1)}));

      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        out.push(snap([a], `比较 ${a[j].v} 与最小 ${a[minIdx].v}`, {hi: [a[minIdx].id, a[j].id], done: idsUpTo(a, i - 1)}));
        if (a[j].v < a[minIdx].v) {
          // 只记住下标，不动数组
          minIdx = j;
          out.push(snap([a], `当前最小 = ${a[j].v}（下标 ${j}）`, {hi: [a[j].id], done: idsUpTo(a, i - 1)}));
        }
      }

      if (minIdx !== i) {
        // 最小值与区间首位交换：两个元素换位，长度不变
        const t = a[i];
        a[i] = a[minIdx];
        a[minIdx] = t;
        out.push(snap([a], `最小 ${a[i].v} 与 ${a[minIdx].v} 交换`, {hi: [a[i].id, a[minIdx].id], done: idsUpTo(a, i)}));
      } else {
        out.push(snap([a], `${a[i].v} 已在区间首位`, {hi: [a[i].id], done: idsUpTo(a, i)}));
      }
    }

    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
