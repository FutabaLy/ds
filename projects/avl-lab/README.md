# AVL 旋转实验室

在线地址：https://futabaly.github.io/ds/avl-lab/

交互演示平衡二叉搜索树插入后的 LL、RR、LR、RL 四种调整。

- 分步前进、回退、自动播放和速度切换。
- 显示平衡因子、中序序列与子树连接变化。
- 默认包含插入 48 的例题：最终 37 的左右孩子为 24、53。
- 支持输入 1–12 个不同整数（−999～999）构建 AVL 树。
- 四种旋转对照表和类型判断练习。

## 本地运行

需要 Node.js 24；项目没有第三方 npm 依赖。

```sh
npm ci
npm run check
npm run web:build
python -m http.server 8000 --directory dist
```

浏览器打开 http://localhost:8000 。也可用其他静态 HTTP 服务托管 `dist/`，无需 Python。

## 源码与验证

`src/engine.js` 实现 AVL 插入与旋转步骤，`src/app.js` 实现交互与 SVG 动画；`src/index.html` 和 `src/style.css` 是页面与样式。构建只复制静态文件，资源使用相对路径，可部署于 GitHub Pages 子目录。

`npm run check` 检查脚本语法，验证四类旋转、例题最终结构、中序顺序保持以及 200 组插入排列的 AVL 平衡和二叉搜索树性质。页面已验证分步切换和自定义序列。

仅演示插入后的平衡调整，不包含删除操作。字体使用 Google Fonts，无法加载时回退到系统字体。
