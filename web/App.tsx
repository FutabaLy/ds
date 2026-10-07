import React, {useEffect, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {FONT_FILES} from '../src/fonts';
import {Main} from '../src/Main';
import {ACT_RANGES, TOTAL} from '../src/timeline';

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

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(FRAME0);
  const [mute, setMute] = useState(false);
  const [playing, setPlaying] = useState(false);

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
    if (!UI) {
      p.addEventListener('play', onPlay);
      p.addEventListener('pause', onPause);
      return () => {
        p.removeEventListener('play', onPlay);
        p.removeEventListener('pause', onPause);
      };
    }
    const onFrame = ({detail}: {detail: {frame: number}}) => setFrame(detail.frame);
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
      style={UI ? {width: '100%'} : {width: 'min(100vw, 177.78vh)'}}
    />
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
      <h1 style={{fontSize: 22, margin: '8px 0 4px'}}>408 MV · 网页实时渲染版（模板）</h1>
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
