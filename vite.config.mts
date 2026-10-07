import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 网页实时版（Remotion Player）的构建配置。
 *
 * 关键点是 publicDir：**网页版的静态资源单独放 web-public/**，
 * 而不是复用 Remotion 渲染用的 public/。两边需求不一样：
 *   public/       → 渲染成片用（母带 music.wav、全量字体，体积大，不进仓库）
 *   web-public/   → 网页上线用（压缩后的 music.mp3、子集字体、CNAME，进仓库）
 * 这样 `npm run web:build` 出来的 dist/ 不会把 9MB 的母带一起带上线。
 * base: './' → 产物放 GitHub Pages 项目页子路径也能跑。
 */
export default defineConfig({
  base: './',
  publicDir: 'web-public',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
});
