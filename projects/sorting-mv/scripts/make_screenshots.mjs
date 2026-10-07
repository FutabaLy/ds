/**
 * 重新生成 docs/screenshots/ 里的文档截图。
 *
 *   node scripts/make_screenshots.mjs
 *
 * 前 4 张用 Remotion 逐帧渲染（帧号按 src/timeline.ts 的章节位置算出来，不写死），
 * 最后 1 张是网页实时版的真实截图（构建 dist → 起静态服务 → 无头 Chrome 截图）。
 *
 * 什么时候需要重跑：改了文案/配色/字体（例如补上字体后字型变了），
 * 让文档截图和成片、网页版保持一致。
 */
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';

const OUT = 'docs/screenshots';
const FPS = 60;
const COMP = 'MV408';

fs.mkdirSync(OUT, {recursive: true});
fs.mkdirSync('out', {recursive: true});

/* ---------------- 1. 取时间轴信息（帧号不写死） ---------------- */
await build({
  stdin: {
    contents: [
      "import fs from 'node:fs';",
      "import {SHOTS, SORT_CHAPTERS, SORT_RANGE, TOTAL} from './src/timeline';",
      "fs.writeFileSync('out/_shots.json', JSON.stringify({",
      '  shots: SHOTS.map((s) => ({id: s.id, start: s.start, end: s.end})),',
      '  chapters: SORT_CHAPTERS.map((c) => ({name: c.name, start: c.start, end: c.end})),',
      '  range: SORT_RANGE, total: TOTAL,',
      '}));',
    ].join('\n'),
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'out/_shots.mjs',
  loader: {'.tsx': 'tsx', '.ts': 'ts', '.json': 'json', '.png': 'dataurl', '.mp3': 'dataurl', '.wav': 'dataurl', '.ttf': 'dataurl'},
  jsx: 'automatic',
  logLevel: 'error',
  banner: {js: "import {createRequire} from 'module'; const require = createRequire(import.meta.url);"},
});
await import(pathToFileURL(path.resolve('out/_shots.mjs')).href + '?t=' + Date.now());
const tl = JSON.parse(fs.readFileSync('out/_shots.json', 'utf8'));

const shotAt = (kw, offset) => {
  const s = tl.shots.find((x) => x.id.toLowerCase().includes(kw));
  if (!s) throw new Error(`时间轴里找不到含「${kw}」的镜头（现有：${tl.shots.map((x) => x.id).join(', ')}）`);
  return s.start + offset;
};
const chapAt = (kw, offset) => {
  const c = tl.chapters.find((x) => x.name.includes(kw));
  if (!c) throw new Error(`找不到排序章节「${kw}」（现有：${tl.chapters.map((x) => x.name).join(', ')}）`);
  return c.start + offset;
};

const stills = [
  ['00-index.png', shotAt('index', 90), '目录镜头（9 种排序一览）'],
  ['01-insert.png', chapAt('直接插入', 90), '直接插入排序'],
  ['02-merge.png', chapAt('归并', 120), '归并排序'],
  ['03-radix.png', chapAt('基数', 120), '基数排序'],
];

console.log(`总帧数 ${tl.total}（${(tl.total / FPS).toFixed(1)} s @${FPS}fps）\n`);

for (const [file, frame, label] of stills) {
  console.log(`渲染 ${file} ← frame=${frame}（${label}）`);
  // stdio 必须 inherit：本机沙箱下管道捕获子进程输出会被拒绝
  const r = spawnSync('npx', ['remotion', 'still', COMP, path.join(OUT, file), `--frame=${frame}`], {
    stdio: 'inherit',
    shell: true,
  });
  if (r.status !== 0) {
    console.error(`  ✗ 失败（exit ${r.status}）`);
    process.exitCode = 1;
  }
}

/* ---------------- 2. 网页实时版截图 ---------------- */
const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => fs.existsSync(p));

if (!chrome) {
  console.log('\n找不到 Chrome，跳过 04-web-ui.png（其余截图已完成）');
} else {
  console.log('\n构建网页版并截图 04-web-ui.png');
  execFileSync('npm', ['run', 'web:build'], {stdio: 'inherit', shell: true});

  // 起一个后台静态服务（detached + unref，截完图再 kill）
  const {spawn} = await import('node:child_process');
  const srv = spawn('python', ['-m', 'http.server', '5399', '--directory', 'dist'], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });
  srv.unref();
  await new Promise((r) => setTimeout(r, 2500));

  const profile = path.join(process.env.TEMP ?? '/tmp', 'mv-shots-profile');
  fs.rmSync(profile, {recursive: true, force: true});
  // 注意：Chrome 的 --screenshot 不认相对路径，必须给绝对路径，否则报「系统找不到指定的路径」
  const target = path.resolve(OUT, '04-web-ui.png');
  fs.rmSync(target, {force: true});
  spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--mute-audio',
      `--user-data-dir=${profile}`,
      '--window-size=1600,1000',
      '--virtual-time-budget=25000',
      `--screenshot=${target}`,
      'http://127.0.0.1:5399/?ui=1',
    ],
    {stdio: 'inherit'},
  );
  srv.kill();
  fs.rmSync(profile, {recursive: true, force: true});
  console.log(fs.existsSync(target) ? `  ✓ ${target}` : '  ✗ 截图失败');
}

console.log('\n=== docs/screenshots ===');
for (const f of fs.readdirSync(OUT)) {
  const kb = (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0);
  console.log(`  ${f.padEnd(18)} ${kb} KB`);
}
