/**
 * 9 个排序算法的快照自检。
 *
 * 检查三件事：
 *   1) 每个中间快照都是合法排列 —— 元素 id 不重复、不丢失
 *      （违反了动画里就会出现两根柱子重叠 / 柱子凭空消失）
 *   2) 最终主数组升序、元素齐全
 *   3) 步数与行数（多行 = 归并的辅助数组、基数的桶）
 *
 *   node scripts/check_sorts.mjs
 */
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

fs.mkdirSync('out', {recursive: true});

await build({
  stdin: {
    contents: `
      import fs from 'node:fs';
      import {checkSnaps, DEFAULT_INPUT} from './src/scenes/sorts/engine';
      import {insertion} from './src/scenes/sorts/algo_insertion';
      import {binInsert} from './src/scenes/sorts/algo_bininsert';
      import {shell} from './src/scenes/sorts/algo_shell';
      import {bubble} from './src/scenes/sorts/algo_bubble';
      import {quick} from './src/scenes/sorts/algo_quick';
      import {selection} from './src/scenes/sorts/algo_selection';
      import {heap} from './src/scenes/sorts/algo_heap';
      import {merge} from './src/scenes/sorts/algo_merge';
      import {radix} from './src/scenes/sorts/algo_radix';

      const algos = [insertion, binInsert, shell, bubble, quick, selection, heap, merge, radix];
      const report = [];
      let bad = 0;
      for (const a of algos) {
        const input = a.input ?? DEFAULT_INPUT;
        const steps = a.build(input);
        const problems = checkSnaps(steps, input.length);
        if (steps.length < 8) problems.push('步数太少（' + steps.length + '），镜头会一闪而过');
        if (problems.length) bad++;
        report.push({
          key: a.key, name: a.name, sub: a.sub, time: a.time, space: a.space, stable: a.stable,
          input, steps: steps.length,
          rows: Math.max(...steps.map((s) => s.rows.length)),
          notes: steps.map((s) => s.note),
          final: steps[steps.length - 1].rows[0].map((e) => e.v).join(','),
          problems,
        });
      }
      fs.writeFileSync('out/sort-report.json', JSON.stringify(report, null, 1));
      for (const r of report) {
        const mark = r.problems.length ? 'FAIL' : ' ok ';
        console.log(mark + ' ' + r.name.padEnd(7, '　') + ' 步骤 ' + String(r.steps).padStart(3) +
          ' | 行数 ' + r.rows + ' | 最终 [' + r.final + ']' + (r.problems.length ? '  ← ' + r.problems[0] : ''));
      }
      console.log(bad === 0 ? '全部 ' + report.length + ' 个算法通过' : '有 ' + bad + ' 个算法不通过');
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'out/_sorts.mjs',
  loader: {'.tsx': 'tsx', '.ts': 'ts'},
  jsx: 'automatic',
  logLevel: 'error',
  banner: {js: "import {createRequire} from 'module'; const require = createRequire(import.meta.url);"},
});

// Windows 上 import() 必须用 file:// URL，不能直接给 D:\... 这种绝对路径
await import(pathToFileURL(path.resolve('out/_sorts.mjs')).href + '?t=' + Date.now());

const report = JSON.parse(fs.readFileSync('out/sort-report.json', 'utf8'));
const failed = report.filter((r) => r.problems.length);
process.exit(failed.length === 0 ? 0 : 1);
