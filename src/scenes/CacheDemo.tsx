import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Arrow, Caption, Txt} from '../components/ui';
import {useF} from '../components/Shot';
import {COL, FONT, clamp01, eInOut, lerp, prog, rgba} from '../theme';

export const CACHE_DUR = 720;

const LINES = 8;
const ACCESS: number[] = [2, 3, 2, 6, 2, 3, 10, 6, 2, 3];

type Step = {addr: number; line: number; tag: number; hit: boolean; evicted: number | null; hits: number; misses: number; lines: (number | null)[]};

/** 直接映射 Cache：line = 主存块号 % 8，tag = 主存块号 / 8 */
const buildSteps = (): Step[] => {
  const lines: (number | null)[] = new Array(LINES).fill(null);
  let hits = 0;
  let misses = 0;
  return ACCESS.map((addr) => {
    const line = addr % LINES;
    const tag = Math.floor(addr / LINES);
    const hit = lines[line] === tag;
    let evicted: number | null = null;
    if (hit) hits++;
    else {
      misses++;
      evicted = lines[line];
      lines[line] = tag;
    }
    return {addr, line, tag, hit, evicted, hits, misses, lines: [...lines]};
  });
};

const STEPS = buildSteps();
const PER = Math.max(16, Math.floor((CACHE_DUR - 120) / STEPS.length));
const START = 60;

const LX = 980;
const LY = 300;
const LW = 340;
const LH = 58;
const LGY = 76;

export const CacheDemo: React.FC = () => {
  const f = useF();
  const raw = (f - START) / PER;
  const idx = Math.max(0, Math.min(STEPS.length - 1, Math.floor(raw)));
  const cur = STEPS[idx];
  const prev = STEPS[Math.max(0, idx - 1)];
  const t = eInOut(clamp01(((raw - idx) * PER) / 12));
  const titleIn = prog(f, 8, 24);

  // 探针：从主存块飞到命中的 cache 行
  const probe = clamp01(prog(f, START + idx * PER, PER * 0.8));
  const px = lerp(660, LX + LW + 40, probe);
  const py = lerp(178, LY + cur.line * LGY + LH / 2, probe);

  const flash = cur.hit ? prog(f, START + idx * PER + 6, 18) : 0;

  return (
    <AbsoluteFill>
      <Txt x={140} y={112} size={64} weight={800} letter={2} opacity={titleIn}>
        直接映射 Cache · 命中与替换
      </Txt>
      <Txt x={140} y={198} size={24} color={COL.dim} opacity={titleIn * 0.9}>
        line = 块号 mod 8 · tag = 块号 / 8 —— 冲突时只能替换同一行
      </Txt>

      {/* 主存块序列 */}
      <Txt x={140} y={300} size={20} color={COL.faint} mono>
        主存块号访问序列
      </Txt>
      {ACCESS.map((a, i) => {
        const active = i === idx;
        const past = i < idx;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 140 + i * 52,
              top: 336,
              width: 44,
              height: 44,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.mono,
              fontSize: 20,
              color: active ? '#04070f' : past ? '#7f8ba6' : COL.text,
              background: active ? COL.co : rgba('#0b1328', 0.9),
              border: `1px solid ${active ? COL.co : rgba(COL.co, 0.35)}`,
              boxShadow: active ? `0 0 20px ${rgba(COL.co, 0.6)}` : undefined,
            }}
          >
            {a}
          </div>
        );
      })}

      {/* 当前访问信息 */}
      <Txt x={140} y={430} size={26} color={COL.dim} mono>
        块 {cur.addr} → 行 {cur.line}，tag = {cur.tag}
      </Txt>
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 486,
          padding: '10px 20px',
          borderRadius: 12,
          fontFamily: FONT.mono,
          fontSize: 30,
          color: cur.hit ? COL.cn : '#ff6b8b',
          border: `2px solid ${rgba(cur.hit ? COL.cn : '#ff6b8b', 0.6)}`,
          background: rgba(cur.hit ? COL.cn : '#ff6b8b', 0.1 + flash * 0.25),
          boxShadow: `0 0 30px ${rgba(cur.hit ? COL.cn : '#ff6b8b', 0.25 + flash * 0.4)}`,
        }}
      >
        {cur.hit ? 'HIT' : `MISS → 装入${cur.evicted === null ? '' : `，替换旧 tag ${cur.evicted}`}`}
      </div>

      <Txt x={140} y={620} size={22} color={COL.faint} mono>
        命中 {cur.hits} · 缺失 {cur.misses} · 命中率 {(cur.hits / (cur.hits + cur.misses) * 100).toFixed(0)}%
      </Txt>

      {/* Cache 行 */}
      <div
        style={{
          position: 'absolute',
          left: LX,
          top: LY - 88,
          width: LW,
          height: (LH + 18) * LINES + 70,
          borderRadius: 20,
          border: `1px solid ${rgba(COL.co, 0.35)}`,
          background: 'linear-gradient(180deg, rgba(251,191,36,0.08), rgba(6,10,22,0.75))',
        }}
      />
      <Txt x={LX + 20} y={LY - 74} size={20} color={rgba(COL.co, 0.9)} mono letter={2}>
        CACHE · 8 LINES
      </Txt>
      {new Array(LINES).fill(0).map((_, i) => {
        const isProbe = i === cur.line;
        const tag = cur.lines[i];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: LX + 20,
              top: LY + i * LGY,
              width: LW - 40,
              height: LH,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              boxSizing: 'border-box',
              fontFamily: FONT.mono,
              fontSize: 20,
              color: isProbe ? '#04070f' : COL.text,
              background: isProbe
                ? rgba(cur.hit ? COL.cn : COL.co, 0.35 + flash * 0.5)
                : rgba('#0b1328', 0.85),
              border: `1px solid ${isProbe ? rgba(cur.hit ? COL.cn : COL.co, 0.95) : rgba('#ffffff', 0.1)}`,
              boxShadow: isProbe ? `0 0 26px ${rgba(cur.hit ? COL.cn : COL.co, 0.5)}` : undefined,
            }}
          >
            <span style={{opacity: 0.75}}>line {i}</span>
            <span>{tag === null ? '—' : `tag ${tag}`}</span>
          </div>
        );
      })}

      <Arrow x1={320} y1={358} x2={px} y2={py} color={cur.hit ? COL.cn : COL.co} bend={60} opacity={0.7} dashed={!cur.hit} />

      <Caption
        text={
          idx === 0 && f < START
            ? '第一次访问必然缺失：冷启动'
            : cur.hit
              ? `块 ${cur.addr} 的 tag 已在行 ${cur.line} —— 命中，零替换开销`
              : `块 ${cur.addr} 与行 ${cur.line} 上的旧 tag 冲突 —— 直接映射没有选择余地`
        }
        at={START - 40}
        dur={CACHE_DUR - 40}
        color={cur.hit ? COL.cn : COL.dim}
      />
    </AbsoluteFill>
  );
};
