/**
 * 把 src/timeline.ts 里那份「唯一真相」导出成 JSON，给音频生成脚本用。
 * 这样配乐的小节数、段落划分、时长都跟着时间轴自动走，改镜头不用改音乐代码。
 *
 *   npm run timeline
 */
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

fs.mkdirSync('out', {recursive: true});
fs.mkdirSync('audio', {recursive: true});

await build({
  stdin: {
    contents: `
      import fs from 'node:fs';
      import {ACT_RANGES, SHOTS, TOTAL} from './src/timeline';
      fs.writeFileSync('audio/timeline.json', JSON.stringify({
        fps: 60,
        total: TOTAL,
        acts: ACT_RANGES,
        shots: SHOTS.map((s) => ({id: s.id, start: s.start, end: s.end, mood: s.mood, act: s.act})),
      }, null, 1));
      console.log('shots', SHOTS.length, '| total frames', TOTAL, '|', (TOTAL / 60).toFixed(1), 's');
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'out/_timeline.mjs',
  loader: {'.tsx': 'tsx', '.ts': 'ts'},
  jsx: 'automatic',
  logLevel: 'error',
  banner: {js: "import {createRequire} from 'module'; const require = createRequire(import.meta.url);"},
});

await import(path.resolve('out/_timeline.mjs') + '?t=' + Date.now());
