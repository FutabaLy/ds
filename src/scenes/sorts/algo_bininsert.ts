import {Algo, Elem, Snap, idsUpTo, mk, snap} from './engine';

/**
 * 折半插入排序（Binary Insertion Sort）。
 * 和直接插入的区别只在「找插入位置」这一步：左侧有序区间用折半查找定位，
 * 比较次数从 O(n) 降到 O(log n)，但元素搬移次数不变，所以总时间仍是 O(n²)。
 *
 * 折半用「上界」语义（相等时 lo = mid + 1，插在等值元素后面），保持稳定。
 * 搬元素一律用 splice（取出再插入），保证每个快照都是合法排列。
 */

/** 折半查找：在已排序区间 a[0..hi] 内找 value 的插入下标（上界） */
const lowerBound = (a: Elem[], hi: number, value: number): number => {
  let lo = 0;
  let hiIdx = hi;
  while (lo <= hiIdx) {
    const mid = (lo + hiIdx) >> 1;
    if (a[mid].v <= value) lo = mid + 1;
    else hiIdx = mid - 1;
  }
  return lo;
};

export const binInsert: Algo = {
  key: 'bininsert',
  name: '折半插入排序',
  sub: 'Binary Insertion Sort',
  time: 'O(n²)（比较 O(n log n)）',
  space: 'O(1)',
  stable: true,
  idea: '在左侧有序区间里折半查找插入位置，再整体右移腾位',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const out: Snap[] = [snap([a], '初始：第 1 个元素自成有序区间', {done: idsUpTo(a, 0)})];

    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      out.push(snap([a], `取出 ${key.v}，折半查找插入位置`, {hi: [key.id], done: idsUpTo(a, i - 1)}));

      // 折半过程：每轮把有序区间砍一半，区间只剩 1 个候选时停下
      let lo = 0;
      let hi = i - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const mv = a[mid].v;
        out.push(
          // 用「< / ≥」标出折半的方向：往左半区间还是右半区间收
          snap([a], `折半 mid=${mid} 值${mv}：${key.v}${key.v < mv ? '<' : '≥'}${mv}`, {
            hi: [key.id, a[mid].id],
            done: idsUpTo(a, i - 1),
          }),
        );
        if (key.v < mv) hi = mid;
        else lo = mid + 1;
      }
      // 区间收到 1 个候选时，候选与 key 的最后一次比较直接决定插入位置
      const pos = lowerBound(a, i - 1, key.v);

      if (pos === i) {
        out.push(snap([a], `${key.v} 已在正确位置`, {hi: [key.id], done: idsUpTo(a, i)}));
      } else {
        out.push(snap([a], `确定位置：${key.v} 插到下标 ${pos}`, {hi: [key.id], done: idsUpTo(a, i - 1)}));
        a.splice(i, 1);
        a.splice(pos, 0, key);
        out.push(snap([a], `${key.v} 插入下标 ${pos}`, {hi: [key.id], done: idsUpTo(a, i)}));
      }
    }

    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
