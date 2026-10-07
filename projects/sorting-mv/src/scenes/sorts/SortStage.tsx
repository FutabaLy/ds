import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {useF} from '../../components/Shot';
import {COL, FONT, clamp, clamp01, eInOut, lerp, rgba} from '../../theme';
import {AlgoMeta, Snap, colOf, shapeOf} from './engine';

type Geo = {x: number; y: number; w: number; h: number};

/**
 * 排序动画的共用渲染器：把 Snap[] 画成柱子/格子，并在相邻快照之间做位置插值。
 *
 * - 单行（比较类排序）→ 柱状图模式，柱子高度 ∝ 数值，数字标在柱子上方
 * - 多行（归并的辅助数组、基数的 10 个桶）→ 格子模式，空位画虚线框
 * 元素位置一律按 **id** 追踪，所以跨行移动（主数组 → 辅助数组 → 桶）也是平滑的。
 */
export const SortStage: React.FC<{
  steps: Snap[];
  meta: AlgoMeta;
  start: number;
  per: number;
  box?: {x: number; y: number; w: number; h: number};
  rowLabels?: string[];
}> = ({steps, meta, start, per, box, rowLabels}) => {
  const f = useF();
  const raw = (f - start) / per;
  const idx = clamp(Math.floor(raw), 0, steps.length - 1);
  const cur = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  // 步与步之间用 10 帧做插值，元素是「滑过去」而不是瞬移
  const t = eInOut(clamp01(((raw - idx) * per) / 10));

  const shape = useMemo(() => shapeOf(steps), [steps]);
  const elems = useMemo(() => {
    const m = new Map<number, number>();
    steps.forEach((s) => s.rows.forEach((r) => r.forEach((e) => e && m.set(e.id, e.v))));
    return [...m.entries()].map(([id, v]) => ({id, v}));
  }, [steps]);

  const area = box ?? {x: 240, y: 246, w: 1440, h: 470};
  const single = shape.rows === 1;
  const gapX = single ? 24 : 8;
  const gapY = 10;
  const colW = single
    ? Math.min(168, (area.w - gapX * (shape.cols - 1)) / shape.cols)
    : Math.min(146, (area.w - gapX * (shape.cols - 1)) / shape.cols);
  const rowH = single ? area.h : Math.min(90, (area.h - gapY * (shape.rows - 1)) / shape.rows);
  // 多行模式把整块行区域在舞台里垂直居中，不然归并这种两行的会贴在最上面、下面空一大片
  const totalH = single ? area.h : shape.rows * rowH + gapY * (shape.rows - 1);
  const y0 = single ? area.y : area.y + (area.h - totalH) / 2;
  const totalW = shape.cols * colW + gapX * (shape.cols - 1);
  const x0 = area.x + (area.w - totalW) / 2;

  const geoOf = (row: number, col: number, v: number): Geo => {
    if (single) {
      const h = 64 + (v / shape.maxVal) * (area.h - 120);
      return {x: x0 + col * (colW + gapX), y: area.y + area.h - h, w: colW, h};
    }
    return {
      x: x0 + col * (colW + gapX) + 3,
      y: y0 + row * (rowH + gapY) + 3,
      w: colW - 6,
      h: rowH - 6,
    };
  };

  const hi = cur.hi ?? [];
  const done = cur.done ?? [];

  const labels = rowLabels ?? (meta.key === 'radix' && !single ? ['主数组', ...new Array(cur.rows.length - 1).fill(0).map((_, i) => `桶 ${i}`)] : null);

  return (
    <AbsoluteFill>
      {/* 多行模式下先把空位画出来，能看清桶/缓冲区的形状 */}
      {!single
        ? cur.rows.map((row, r) =>
            row.map((slot, c) => {
              if (slot) return null;
              const g = geoOf(r, c, 0);
              return (
                <div
                  key={`slot-${r}-${c}`}
                  style={{
                    position: 'absolute',
                    left: g.x,
                    top: g.y,
                    width: g.w,
                    height: g.h,
                    borderRadius: 8,
                    border: `1px dashed ${rgba('#ffffff', 0.09)}`,
                  }}
                />
              );
            }),
          )
        : null}

      {/* 行标签 */}
      {labels
        ? cur.rows.map((_, r) => (
            <div
              key={`label-${r}`}
              style={{
                position: 'absolute',
                left: x0 - 150,
                top: y0 + r * (rowH + gapY) + rowH / 2 - 12,
                width: 130,
                textAlign: 'right',
                fontFamily: FONT.mono,
                fontSize: 18,
                color: rgba('#eef3ff', 0.42),
              }}
            >
              {labels[r]}
            </div>
          ))
        : null}

      {/* 元素 */}
      {elems.map(({id, v}) => {
        const p1 = colOf(prev.rows, id) ?? colOf(cur.rows, id);
        const p2 = colOf(cur.rows, id) ?? p1;
        if (!p1 || !p2) return null;
        const g1 = geoOf(p1.row, p1.col, v);
        const g2 = geoOf(p2.row, p2.col, v);
        const g = {
          x: lerp(g1.x, g2.x, t),
          y: lerp(g1.y, g2.y, t),
          w: lerp(g1.w, g2.w, t),
          h: lerp(g1.h, g2.h, t),
        };
        const isDone = done.includes(id);
        const isHi = hi.includes(id);
        const isPivot = cur.pivot === id;
        const active = isDone || isHi || isPivot;
        const color = isDone ? COL.cn : isPivot ? '#f472b6' : isHi ? COL.co : single ? COL.ds : '#5a6b83';
        const font = single ? Math.min(30, colW * 0.34) : Math.min(24, Math.min(colW * 0.26, rowH * 0.44));
        return (
          <div key={id} style={{position: 'absolute', left: g.x, top: g.y, width: g.w, height: g.h}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: single ? 10 : 8,
                background: active
                  ? `linear-gradient(180deg, ${rgba(color, 0.95)}, ${rgba(color, 0.45)})`
                  : `linear-gradient(180deg, ${rgba(color, 0.34)}, ${rgba(color, 0.06)})`,
                border: `2px solid ${rgba(color, active ? 1 : 0.5)}`,
                boxShadow: active ? `0 0 30px ${rgba(color, 0.6)}` : undefined,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: single ? -40 : 0,
                bottom: single ? undefined : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT.mono,
                fontSize: font,
                color: active ? (single ? '#ffffff' : '#04070f') : COL.text,
                marginLeft: single ? 0 : 8,
              }}
            >
              {v}
            </div>
          </div>
        );
      })}

      {/* 这一步在做什么 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: area.y + area.h + 46,
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontSize: 30,
          color: COL.dim,
        }}
      >
        {cur.note}
      </div>

      {/* 步骤计数（放右下角，避免和标题/副标题打架） */}
      <div
        style={{
          position: 'absolute',
          right: 150,
          top: area.y + area.h + 50,
          fontFamily: FONT.mono,
          fontSize: 19,
          color: rgba('#eef3ff', 0.62),
        }}
      >
        步骤 {idx + 1}/{steps.length}
      </div>
    </AbsoluteFill>
  );
};
