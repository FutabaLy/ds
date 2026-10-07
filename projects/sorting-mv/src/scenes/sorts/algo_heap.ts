import {Algo, Elem, Snap, mk, snap} from './engine';

/**
 * 堆排序 —— 大顶堆，下标从 0 开始（左孩子 2i+1、右孩子 2i+2）。
 *
 * 可视化关键点：
 * 1) 全程只用 swap，天然保证每个快照都是合法排列（元素不会重复、不会消失）。
 * 2) 两个阶段：
 *    ① 建堆：从最后一个非叶结点 ⌊n/2⌋-1 开始往前，每个结点下沉一次；
 *    ② 取最大：堆顶（全局最大）与当前堆的末尾交换 → 堆大小减一 → 新堆顶下沉。
 * 3) 堆大小 size 是变化的：下标 ≥ size 的那一段已经排好，全部标 done。
 * 4) 下沉（sift-down）：先把 i 与左孩子比、取较大者，再与右孩子比，挑出更大的孩子；
 *    孩子更大就交换，然后从新位置继续往下沉，
 *    直到没有孩子（叶子）或者已经不比孩子小。
 */
export const heap: Algo = {
  key: 'heap',
  name: '堆排序',
  sub: 'Heap Sort',
  time: 'O(n log n)',
  space: 'O(1)',
  stable: false,
  idea: '先把数组整理成大顶堆，再反复把堆顶换到末尾并让新堆顶下沉',
  build(input: number[]): Snap[] {
    const a: Elem[] = mk(input);
    const n = a.length;
    const out: Snap[] = [snap([a], '初始：先自底向上建大顶堆')];
    const done: number[] = []; // 已经换到末尾、最终位置确定的元素 id

    if (n === 0) {
      out.push(snap([a], '完成：整体有序', {done: []}));
      return out;
    }

    /** 交换两个格子里的元素：只交换不复制，排列始终合法 */
    const swap = (x: number, y: number) => {
      const t = a[x];
      a[x] = a[y];
      a[y] = t;
    };

    /** 让下标 i 的元素在「大小为 size 的堆」里下沉到合适位置 */
    const siftDown = (i: number, size: number) => {
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l >= size) {
          out.push(snap([a], `下标 ${i} 是叶子，下沉结束`, {hi: [a[i].id], done: [...done]}));
          return;
        }

        let big = i; // 当前最大的那个：先和自己比
        out.push(snap([a], `下沉：比较 ${a[big].v} 与左孩子 ${a[l].v}`, {hi: [a[big].id, a[l].id], done: [...done]}));
        if (a[l].v > a[big].v) big = l;

        if (r < size) {
          out.push(snap([a], `比较 ${a[big].v} 与右孩子 ${a[r].v}`, {hi: [a[big].id, a[r].id], done: [...done]}));
          if (a[r].v > a[big].v) big = r;
        }

        if (big === i) {
          out.push(snap([a], `${a[i].v} 不比孩子小，下沉结束`, {hi: [a[i].id], done: [...done]}));
          return;
        }

        out.push(snap([a], `孩子 ${a[big].v} 更大，与 ${a[i].v} 交换`, {hi: [a[i].id, a[big].id], done: [...done]}));
        swap(i, big);
        out.push(snap([a], `换下来的 ${a[big].v} 继续下沉`, {hi: [a[big].id], done: [...done]}));
        i = big; // 从孩子的位置继续往下比较
      }
    };

    // ① 建堆：叶子本来就是一个合法堆，所以从最后一个非叶结点往前扫
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      out.push(snap([a], `建堆：从下标 ${i} 开始下沉`, {hi: [a[i].id]}));
      siftDown(i, n);
    }
    out.push(snap([a], '大顶堆建成：堆顶是全局最大', {hi: [a[0].id]}));

    // ② 取最大：堆顶换到当前末尾，堆缩小一格，再让新堆顶下沉
    for (let end = n - 1; end >= 1; end--) {
      out.push(
        snap([a], `堆顶 ${a[0].v} ↔ 末尾 ${a[end].v}，堆大小 ${end}`, {hi: [a[0].id, a[end].id], done: [...done]}),
      );
      swap(0, end);
      done.push(a[end].id); // 换到末尾的就是这一段的最大值，位置已定
      out.push(snap([a], `最大值 ${a[end].v} 归位到下标 ${end}`, {done: [...done]}));

      if (end > 1) {
        out.push(snap([a], `堆大小 ${end}，新堆顶 ${a[0].v} 下沉`, {hi: [a[0].id], done: [...done]}));
        siftDown(0, end);
      }
    }

    done.push(a[0].id); // 堆里只剩一个元素，它自己也归位
    out.push(snap([a], '完成：整体有序', {done: a.map((e) => e.id)}));
    return out;
  },
};
