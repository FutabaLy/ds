/**
 * 排序演示「快照序列」的逻辑自检（和 src/scenes/SortDemo.tsx 里的 buildSteps 同一份逻辑）：
 * 每一步都必须是一份合法排列 —— 每个元素恰好出现一次、没有新增/丢失，
 * 否则动画里就会出现两根柱子重叠、下标显示成 -1 这类问题。
 *
 *   node scripts/check_sort_steps.mjs
 */
const INPUT = [5, 2, 9, 1, 7, 3];

const buildSteps = (input) => {
  const arr = input.map((v, id) => ({id, v}));
  const snap = (a, b, sorted, note) => ({arr: arr.map((e) => ({...e})), a, b, sorted, note});
  const steps = [snap(-1, -1, 0, '初始')];

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    steps.push(snap(i, -1, i - 1, `取出 ${key.v}`));
    let j = i - 1;
    while (j >= 0) {
      const cmp = arr[j].v > key.v ? '>' : '≤';
      steps.push(snap(j, i, i - 1, `比较 ${arr[j].v} ${cmp} ${key.v}`));
      if (arr[j].v > key.v) j--;
      else break;
    }
    if (j + 1 !== i) {
      arr.splice(i, 1);
      arr.splice(j + 1, 0, key);
      steps.push(snap(j + 1, -1, i, `插入 ${key.v} 到 ${j + 1}`));
    } else {
      steps.push(snap(i, -1, i, `${key.v} 已就位`));
    }
  }
  return steps;
};

const steps = buildSteps(INPUT);
const expectIds = INPUT.map((_, k) => k).join(',');
let bad = 0;

steps.forEach((s, i) => {
  const dup = new Set(s.arr.map((e) => e.id)).size !== s.arr.length;
  const missing = [...s.arr.map((e) => e.id)].sort((x, y) => x - y).join(',') !== expectIds;
  const posOk = s.a < s.arr.length && s.b < s.arr.length;
  const sortedOk = s.arr.slice(0, s.sorted + 1).every((e, k, part) => k === 0 || part[k - 1].v <= e.v);
  if (dup || missing || !posOk || !sortedOk) {
    bad++;
    console.log(
      `步 ${i} 非法: dup=${dup} missing=${missing} pos=${posOk} sortedZone=${sortedOk} -> [${s.arr
        .map((e) => e.v)
        .join(',')}]`,
    );
  }
});

const finalArr = steps[steps.length - 1].arr.map((e) => e.v);
const finalOk = finalArr.join(',') === [...INPUT].sort((a, b) => a - b).join(',');
console.log(`快照数 ${steps.length}，非法快照 ${bad} 个`);
console.log(`最终序列 [${finalArr.join(', ')}]，与排序结果一致 = ${finalOk}`);
process.exit(bad === 0 && finalOk ? 0 : 1);
