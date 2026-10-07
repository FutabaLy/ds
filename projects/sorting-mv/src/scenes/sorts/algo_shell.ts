import {Algo, Elem, Snap, mk, snap} from './engine';

/**
 * 希尔排序（Shell Sort，缩小增量排序）。
 * 增量序列取 n/2, n/4, …, 1：每个增量把数组看成 d 个「间隔为 d」的子序列，
 * 对每个子序列做插入排序。d 大时元素能一次跨很远，逆序对快速减少，
 * 最后 d=1 时数组已接近有序，插入排序几乎不用搬。
 *
 * 元素搬动同样只用 splice（取出再插到目标位置），
 * 不用 `a[j+d] = a[j]` 那种写法 —— 那会在中间态复制出重复元素。
 */
export const shell: Algo = {
  key: 'shell',
  name: '希尔排序',
  sub: 'Shell Sort',
  time: 'O(n^1.3) ~ O(n²)',
  space: 'O(1)',
  stable: false,
  idea: '按增量 d 分组插入排序，增量缩到 1 时整体已接近有序',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const out: Snap[] = [snap([a], `初始序列，长度 ${a.length}`, {})];

    // 增量序列：n/2, n/4, …, 1
    for (let gap = a.length >> 1; gap >= 1; gap >>= 1) {
      // 每个增量先亮出「第一条子序列」的两端（下标 0 与 gap），
      // 画面出现均匀的虚线感：每隔 gap 个元素同属一组
      out.push(snap([a], `下一轮：增量 d=${gap}`, {hi: [a[0].id, a[gap].id]}));

      // 对每个间隔为 gap 的子序列做插入排序
      for (let i = gap; i < a.length; i++) {
        const key = a[i];
        const at = a.indexOf(key); // key 现在的下标（前面几趟可能已经把它挪过）
        if (at <= 0 || at < gap) continue;

        out.push(snap([a], `增量 d=${gap}：取出 ${key.v} 向左比较`, {hi: [key.id]}));

        let pos = at;
        let j = at - gap;
        while (j >= 0) {
          out.push(snap([a], `增量 d=${gap}：比较 ${a[j].v} 与 ${key.v}`, {hi: [a[j].id, key.id]}));
          if (a[j].v > key.v) {
            pos = j;
            j -= gap;
          } else break;
        }

        if (pos === at) {
          out.push(snap([a], `增量 d=${gap}：${key.v} 位置已正确`, {hi: [key.id]}));
        } else {
          a.splice(at, 1);
          a.splice(pos, 0, key);
          out.push(snap([a], `增量 d=${gap}：${key.v} 插到下标 ${pos}`, {hi: [key.id]}));
        }
      }
    }

    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
