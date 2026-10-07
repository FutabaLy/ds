import {Algo, Elem, Snap, mk, snap} from './engine';

/**
 * 快速排序 —— Lomuto 划分，基准**固定取区间末位元素**（不用随机数，保证可复现）。
 *
 * 可视化关键点：
 * 1) 全程只用 swap，天然保证每个快照都是合法排列（元素不会重复、不会消失）。
 * 2) 划分：i 是「小于基准区」的右边界，j 从左往右扫；
 *    a[j] < 基准 就把 a[j] 换到 i 处、i++，否则 i 不动，扫完把基准换到 i。
 * 3) 划分结束后基准落到下标 i：左边全 < 基准、右边全 ≥ 基准，
 *    所以它的最终位置已经确定，立刻标 done；区间长度 ≤ 1 的元素同理。
 * 4) pivot 字段把基准染成品红，hi 标出这一步正在比较/交换的元素。
 */
export const quick: Algo = {
  key: 'quick',
  name: '快速排序',
  sub: 'Quick Sort',
  time: 'O(n log n)',
  space: 'O(log n)',
  stable: false,
  idea: '取末位元素为基准划分，小的归左、大的归右，再递归两侧（最坏 O(n²)）',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const out: Snap[] = [snap([a], '初始：以末位元素为基准划分')];
    const done: number[] = []; // 最终位置已经确定的元素 id

    /** 交换两个格子里的元素：只交换不复制，排列始终合法 */
    const swap = (x: number, y: number) => {
      const t = a[x];
      a[x] = a[y];
      a[y] = t;
    };

    /** 对闭区间 [lo, hi] 做一趟 Lomuto 划分，再递归左右两段 */
    const qs = (lo: number, hi: number) => {
      if (lo > hi) return; // 空区间
      if (lo === hi) {
        // 区间只剩一个元素：它必然在最终位置上
        done.push(a[lo].id);
        out.push(snap([a], `区间只剩 ${a[lo].v}，直接归位`, {done: [...done]}));
        return;
      }

      const p = a[hi]; // 基准固定取区间末位
      out.push(snap([a], `划分 [${lo},${hi}]，基准 ${p.v}（末位）`, {pivot: p.id, done: [...done]}));

      let i = lo; // 下标 < i 的部分都小于基准
      for (let j = lo; j < hi; j++) {
        const vj = a[j].v;
        const rel = vj < p.v ? '<' : vj > p.v ? '>' : '=';
        out.push(snap([a], `比较 a[${j}]=${vj} 与基准 ${p.v}`, {hi: [a[j].id, p.id], pivot: p.id, done: [...done]}));

        if (vj < p.v) {
          if (i !== j) {
            swap(i, j);
            out.push(
              snap([a], `a[${j}]=${vj} < 基准，交换到 i=${i}`, {
                hi: [a[i].id, a[j].id],
                pivot: p.id,
                done: [...done],
              }),
            );
          } else {
            out.push(snap([a], `a[${j}]=${vj} < 基准，i 自增`, {hi: [a[j].id], pivot: p.id, done: [...done]}));
          }
          i++;
        } else {
          // 不小于基准：留在右区，左边界 i 不动
          out.push(
            snap([a], `a[${j}]=${vj} ${rel} 基准，i 不动`, {hi: [a[j].id, p.id], pivot: p.id, done: [...done]}),
          );
        }
      }

      if (i === hi) {
        out.push(snap([a], `基准 ${p.v} 本来就在下标 ${i}`, {hi: [p.id], pivot: p.id, done: [...done]}));
      } else {
        swap(i, hi);
        out.push(snap([a], `基准 ${p.v} 归位到下标 ${i}`, {hi: [p.id], pivot: p.id, done: [...done]}));
      }
      done.push(p.id);
      out.push(snap([a], `基准 ${p.v} 就位，分治左右区间`, {done: [...done]}));

      qs(lo, i - 1); // 左段全部 < 基准
      qs(i + 1, hi); // 右段全部 ≥ 基准
      out.push(snap([a], `区间 [${lo},${hi}] 已有序`, {done: [...done]}));
    };

    qs(0, a.length - 1);
    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
