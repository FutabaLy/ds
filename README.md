# ds

数据结构相关的教学 / 可视化项目合集（monorepo，与 [network](../network) 仓库同构）。每个项目独立放在 `projects/<名字>/`，各有自己的 `package.json`、README 和校验脚本。

## 项目索引

| 项目 | 内容 | 产物 | 怎么跑 |
|---|---|---|---|
| [sorting-mv](projects/sorting-mv/) | **数据结构 · 排序 MV**：9 种内部排序（直接插入 / 折半插入 / 希尔 / 冒泡 / 快速 / 简单选择 / 堆 / 归并 / 基数）逐帧动画，1920×1080@60fps，底部时间戳条可点击跳章节 | [`projects/sorting-mv/docs/screenshots/`](projects/sorting-mv/docs/screenshots/)、网页实时版 **https://futabaly.github.io/ds/** | `cd projects/sorting-mv && npm i && npm run web:dev`（预览）/ `npm run render`（出片） |

## 目录约定

```
projects/<项目名>/        每个项目自成一体
  src/                    源码（画面全部由代码生成，不放素材）
  docs/                   说明、验证文档、截图
  README.md               怎么跑、怎么导出、验证结果
.github/workflows/        CI：check.yml（校验各项目）+ deploy-web.yml（排序 MV 的 Pages 部署）
```

## 加一个新项目

1. `mkdir -p projects/<名字>`，把工程放进去（照着 `sorting-mv` 的结构来）；
2. 项目里至少要有 `README.md`（运行/导出说明）和 `npm run check`（类型检查 + 数值自检）；
3. 在上面的**项目索引**表里加一行；
4. 把项目名加进 `.github/workflows/check.yml` 的 `matrix.project` 列表（一处）；
5. 成品（视频/图/文档）放项目根目录或 `docs/`；`node_modules/`、`out/`、`dist/` 这些中间产物别提交 —— 各项目的 `.gitignore` 已经写好了。

## 跨项目约定（与 network 仓库一致）

- **视频类项目用 Remotion**：React 写动画、逐帧渲染；同一套代码既能出 MP4，也能用 `@remotion/player` 在浏览器实时播。
- **单一参数源 / 单一数据源**：画面里出现的每个数字都从一个文件算出来（排序 MV 里是 `src/timeline.ts` + 各算法的快照），结构上排除「公式与动画互相矛盾」。
- **算法动画的硬约束**：任何中间快照都必须是合法排列（元素不重复、不丢失），由 `npm run check:sorts` 全量校验。
- **交付**：可编辑源码 + 预览图/成片 + 验证说明。

## CI 与部署

- `.github/workflows/check.yml`：push / PR 时对每个项目跑 `npm ci && npm run check` 与 `npm run web:build`；
- `.github/workflows/deploy-web.yml`：改动 `projects/sorting-mv/**` 时自动构建并发布到 GitHub Pages（线上地址 **https://futabaly.github.io/ds/**）。