import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from './components/Background';
import {Shots} from './components/Shot';
import {ActHUD} from './components/ui';
import {COL, FONT} from './theme';
import {ACT_RANGES, SHOTS, TOTAL} from './timeline';

export {TOTAL};

const STOPS: [number, string][] = ACT_RANGES.map((a) => [a.s, a.color]);
const HUD_ACTS = ACT_RANGES.map((a) => ({key: a.key, color: a.color, s: a.s, e: a.e}));

/**
 * 主合成：所有画面的唯一入口。
 * - 渲染成片时：musicSrc 不传 → 用 staticFile('music.wav')
 * - 网页实时版时：musicSrc 传 BASE + 'music.mp3'（可换成 wav 母带）
 * - hud：是否把「幕名 / 时间码 / 进度条」烧进画面。默认 false —— 只出画面，不出时间轴。
 */
export const Main: React.FC<{mute?: boolean; musicSrc?: string; hud?: boolean}> = ({
  mute,
  musicSrc,
  hud = false,
}) => (
  <AbsoluteFill style={{background: COL.bg, fontFamily: FONT.sans, color: COL.text}}>
    <Background stops={STOPS} total={TOTAL} />
    <Shots shots={SHOTS} />
    {hud ? <ActHUD acts={HUD_ACTS} /> : null}
    {mute ? null : <Audio src={musicSrc ?? staticFile('music.wav')} />}
  </AbsoluteFill>
);
