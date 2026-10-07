import {Algo, Elem, Snap, idsUpTo, mk, snap} from './engine';

/**
 * 直接插入排序 —— 参考实现（其它算法照这个模子写）。
 * 注意：真正搬元素用 splice，保证每个快照都是合法排列。
 */
export const insertion: Algo = {
  key: 'insert',
  name: '直接插入排序',
  sub: 'Insertion Sort',
  time: 'O(n²)',
  space: 'O(1)',
  stable: true,
  idea: '把每个元素插到左侧已排序区间的正确位置',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const out: Snap[] = [snap([a], '初始：第 1 个元素自成有序区间', {done: idsUpTo(a, 0)})];

    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      out.push(snap([a], `取出 ${key.v}，向左逐个比较`, {hi: [key.id], done: idsUpTo(a, i - 1)}));

      let j = i - 1;
      while (j >= 0) {
        out.push(snap([a], `比较 ${a[j].v} 与 ${key.v}`, {hi: [a[j].id, key.id], done: idsUpTo(a, i - 1)}));
        if (a[j].v > key.v) j--;
        else break;
      }

      if (j + 1 !== i) {
        a.splice(i, 1);
        a.splice(j + 1, 0, key);
        out.push(snap([a], `${key.v} 插入下标 ${j + 1}，中间元素右移`, {hi: [key.id], done: idsUpTo(a, i)}));
      } else {
        out.push(snap([a], `${key.v} 已在正确位置`, {hi: [key.id], done: idsUpTo(a, i)}));
      }
    }

    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
