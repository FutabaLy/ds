import React, {useEffect, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {FONT_FILES} from '../src/fonts';
import {Main} from '../src/Main';
import {ACT_RANGES, SORT_CHAPTERS, SORT_RANGE, TOTAL} from '../src/timeline';

const FPS = 60;
const BASE = import.meta.env.BASE_URL;
const Q = new URLSearchParams(window.location.search);

/**
 * 默认就是「一个视频」：整屏黑底 + 16:9 画面，没有页面说明、没有章节按钮、没有进度条。
 * 需要一个参数就能把调试界面调回来：
 *   ?ui=1     显示页面 UI（标题、章节跳转按钮、播放/静音、当前帧）
 *   ?hud=1    画面里烧进 HUD（幕名 / 时间码 / 进度条）
 *   ?frame=N  直接定位到第 N 帧（深链，方便分享某个镜头）
 */
const UI = Q.get('ui') === '1';
const HUD = Q.get('hud') === '1';
const FRAME0 = (() => {
  const n = Number.parseInt(Q.get('frame') ?? '0', 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(TOTAL - 1, n)) : 0;
})();

const fmt = (frame: number) => {
  const s = Math.floor(frame / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const Btn: React.FC<{onClick: () => void; children: React.ReactNode; color?: string; active?: boolean}> = ({
  onClick,
  children,
  color = '#5b8cff',
  active = false,
}) => (
  <button
    onClick={onClick}
    style={{
      background: active ? color : '#0b1328',
      color: active ? '#04070f' : '#eef3ff',
      border: `1px solid ${color}`,
      borderLeft: `6px solid ${color}`,
      borderRadius: 8,
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: 13,
      fontFamily: 'inherit',
    }}
  >
    {children}
  </button>
);

/**
 * 叠在画面底部「时间戳条」上的透明按钮层。
 *
 * 时间戳条本身是烧进视频的（渲染成片里也有，静态信息）；
 * 这里让它在**网页实时版**上可以点击跳转 —— 位置/宽度/间距都按 1920×1080 里
 * 同一套比例算，所以和画面里那条严丝合缝地重合，按钮本身是全透明的。
 */
const ChapterStrip: React.FC<{active: number; onSeek: (frame: number) => void}> = ({active, onSeek}) => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: '6.1458%' /* 118 / 1920 */,
          right: '6.1458%',
          bottom: '4.8148%' /* 52 / 1080 */,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {SORT_CHAPTERS.map((c, i) => (
          <button
            key={c.key}
            type="button"
            data-chapter={i}
            data-start={c.start}
            title={`跳到 ${c.name}（${fmt(c.start)}）`}
            onClick={(e) => {
              e.stopPropagation();
              onSeek(c.start);
            }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              pointerEvents: 'auto',
              width: '9.6875%' /* 186 / 1920 */,
              height: '5.8%',
              minHeight: 36,
              padding: 0,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              // 只在鼠标悬停时给一点提示；「当前章节」的高亮交给画面里烧进去的那条，避免两条线错位
              background: hover === i ? 'rgba(255,255,255,0.10)' : 'transparent',
              boxShadow: hover === i ? `inset 0 0 0 1px ${c.color}88` : 'none',
              transition: 'background 120ms',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(FRAME0);
  const [mute, setMute] = useState(false);
  const [playing, setPlaying] = useState(false);
  // 当前处在第几个排序列（-1 = 不在某个算法那一段里）
  const [chapter, setChapter] = useState(() =>
    SORT_CHAPTERS.findIndex((c) => FRAME0 >= c.start && FRAME0 < c.end),
  );
  // 是否处在「排序段落」——与画面里那条烧进去的时间戳条同一个显示区间
  const [showStrip, setShowStrip] = useState(() => FRAME0 >= SORT_RANGE.from && FRAME0 <= SORT_RANGE.to);

  // 字体异步加载，不阻塞首屏；没下完先用系统字体顶（public 里没有字体时静默跳过）
  useEffect(() => {
    let dead = false;
    FONT_FILES.forEach(([family, file]) => {
      new FontFace(family, `url('${BASE}fonts/${file}')`, {weight: '100 900'})
        .load()
        .then((ff) => {
          if (!dead) document.fonts.add(ff);
        })
        .catch(() => {});
    });
    return () => {
      dead = true;
    };
  }, []);

  // 播放器通过事件把状态推出来（新版 @remotion/player 没有 onFrameUpdate 这类 prop）
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onFrame = ({detail}: {detail: {frame: number}}) => {
      if (UI) setFrame(detail.frame);
      // 只在「状态真的变了」时 setState，避免每帧重渲染整个页面
      const idx = SORT_CHAPTERS.findIndex((c) => detail.frame >= c.start && detail.frame < c.end);
      setChapter((prev) => (prev === idx ? prev : idx));
      const inRange = detail.frame >= SORT_RANGE.from && detail.frame <= SORT_RANGE.to;
      setShowStrip((prev) => (prev === inRange ? prev : inRange));
    };
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    p.addEventListener('frameupdate', onFrame);
    return () => {
      p.removeEventListener('play', onPlay);
      p.removeEventListener('pause', onPause);
      p.removeEventListener('frameupdate', onFrame);
    };
  }, []);

  const player = (
    <div style={{position: 'relative', width: UI ? '100%' : 'min(100vw, 177.78vh)'}}>
      <Player
        ref={ref}
        component={Main}
        inputProps={{musicSrc: `${BASE}music.mp3`, mute, hud: HUD}}
        durationInFrames={TOTAL}
        fps={FPS}
        compositionWidth={1920}
        compositionHeight={1080}
        initialFrame={FRAME0}
        controls={UI}
        loop
        clickToPlay
        acknowledgeRemotionLicense
        style={{width: '100%'}}
      />
      {/* 画面底部时间戳条的可点击层：与烧进画面的那条同区间显示，点击 seek 到该章节起始帧 */}
      {showStrip ? <ChapterStrip active={chapter} onSeek={(f) => ref.current?.seekTo(f)} /> : null}
    </div>
  );

  // 默认模式：只有画面。点一下播放，空格暂停/继续，双击全屏。
  if (!UI) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {player}
      </div>
    );
  }

  // ?ui=1：调试界面（章节跳转、播放/静音、当前帧）
  const current = ACT_RANGES.find((a) => frame >= a.s && frame < a.e) ?? ACT_RANGES[0];
  return (
    <div style={{maxWidth: 1280, margin: '0 auto', padding: '24px 16px 64px'}}>
      <h1 style={{fontSize: 22, margin: '8px 0 4px'}}>数据结构 · 排序 MV · 网页实时渲染版</h1>
      <p style={{color: '#9aa7c2', margin: '0 0 16px', fontSize: 14}}>
        共 {TOTAL} 帧 / {fmt(TOTAL)}（{FPS}fps，1920×1080），浏览器用 Remotion Player 实时逐帧渲染，不导出 mp4。
        当前幕：<span style={{color: current.color}}>{current.key}</span> · 当前帧：{frame}（{fmt(frame)}）
      </p>

      <div style={{borderRadius: 12, overflow: 'hidden', border: '1px solid #1c2742'}}>{player}</div>

      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16}}>
        <Btn
          color="#34d399"
          active={playing}
          onClick={() => {
            const p = ref.current;
            if (!p) return;
            p.isPlaying() ? p.pause() : p.play();
          }}
        >
          {playing ? '暂停' : '播放'}
        </Btn>
        <Btn color="#fbbf24" active={mute} onClick={() => setMute((m) => !m)}>
          {mute ? '已静音' : '有声'}
        </Btn>
        <Btn onClick={() => ref.current?.seekTo(0)}>回到开头</Btn>
        {ACT_RANGES.map((a) => (
          <Btn key={a.key} color={a.color} active={a.key === current.key} onClick={() => ref.current?.seekTo(a.s)}>
            {a.key} · {fmt(a.s)}
          </Btn>
        ))}
      </div>

      <p style={{color: '#4b5872', fontSize: 12, marginTop: 16}}>
        这是 <code>?ui=1</code> 调试模式；去掉参数就是纯画面。<code>?hud=1</code> 会把幕名/时间码烧进画面，
        <code>?frame=2200</code> 可直接定位到某一帧。
      </p>
    </div>
  );
};

export default App;
