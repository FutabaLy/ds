import React from 'react';
import {Composition} from 'remotion';
import {ensureFonts} from './fonts';
import {Main} from './Main';
import {TOTAL} from './timeline';

// Studio / 渲染时先把字体加载完，避免成片里字型闪变
ensureFonts();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MV408"
    component={Main}
    durationInFrames={TOTAL}
    fps={60}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
);
