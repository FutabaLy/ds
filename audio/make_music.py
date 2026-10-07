"""程序化配乐：按 audio/timeline.json 的幕结构生成整条音轨。

- 120 BPM，1 小节 = 2 s = 120 帧（60fps），所以镜头天然落在小节线上；
- 只用 numpy + 标准库 wave，不依赖 scipy / soundfile / ffmpeg；
- 段落跟随 timeline.json 里的 act：intro 铺垫 → ds/co 加鼓和琶音 → fin 铃声收尾；
- 输出 public/music.wav（母带）。想压成 mp3：npm run audio:mp3

    npm run timeline && npm run audio
"""
import json
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FPS = 60.0
SEED = 408

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'music.wav'

rng = np.random.default_rng(SEED)


# ---------------------------------------------------------------- 基础工具
def mtof(m: float) -> float:
    """MIDI 音高 → 频率"""
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def t_axis(n: int) -> np.ndarray:
    return np.arange(n, dtype=np.float64) / SR


def env_ad(n: int, attack: float, decay: float, curve: float = 3.0) -> np.ndarray:
    """attack-decay 包络（秒）"""
    a = max(1, int(attack * SR))
    env = np.ones(n)
    a = min(a, n)
    env[:a] = np.linspace(0.0, 1.0, a) ** 0.6
    rest = n - a
    if rest > 0:
        env[a:] = np.exp(-np.linspace(0.0, curve * (rest / max(1, int(decay * SR))), rest))
    return env


def sine(f: float, n: int, phase: float = 0.0) -> np.ndarray:
    return np.sin(2 * np.pi * f * t_axis(n) + phase)


def saw(f: float, n: int, harmonics: int = 9) -> np.ndarray:
    """用有限谐波叠加近似锯齿（足够干净，避免混叠）"""
    out = np.zeros(n)
    for k in range(1, harmonics + 1):
        if f * k > SR / 2.4:
            break
        out += np.sin(2 * np.pi * f * k * t_axis(n)) / k
    return out * (2 / np.pi)


def pad(f: float, n: int, detune: float = 0.004) -> np.ndarray:
    voices = [saw(f * (1 + detune * d), n, 7) for d in (-1.0, 0.0, 1.0)]
    return sum(voices) / len(voices)


def pluck(f: float, n: int, bright: float = 1.0) -> np.ndarray:
    sig = (sine(f, n) + 0.42 * bright * sine(f * 2, n) + 0.18 * bright * sine(f * 3, n)) / 1.6
    return sig * env_ad(n, 0.004, 0.28, 5.0)


def bell(f: float, n: int) -> np.ndarray:
    """FM 铃铛"""
    idx = 2.6 * np.exp(-np.linspace(0, 4.0, n))
    mod = np.sin(2 * np.pi * f * 3.5 * t_axis(n)) * idx
    sig = np.sin(2 * np.pi * f * t_axis(n) + mod)
    return sig * env_ad(n, 0.002, 1.9, 4.5)


def kick(n: int) -> np.ndarray:
    t = t_axis(n)
    f = 120 * np.exp(-t * 26) + 46
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return sig * np.exp(-t * 9.0)


def hat(n: int) -> np.ndarray:
    return rng.normal(0, 1, n) * np.exp(-t_axis(n) * 60.0)


def noise_sweep(n: int, f0: float = 300.0, f1: float = 6000.0) -> np.ndarray:
    """简单的一阶滤波噪声扫频，用作 riser / whoosh"""
    src = rng.normal(0, 1, n)
    freqs = np.linspace(f0, f1, n)
    a = np.clip(2 * np.pi * freqs / SR, 0, 1)
    out = np.zeros(n)
    prev = 0.0
    for i in range(n):  # 一阶低通；n 不大（几秒），够用
        prev += a[i] * (src[i] - prev)
        out[i] = prev
    return out * np.linspace(0.2, 1.0, n)


def add(bus: np.ndarray, at_sec: float, sig: np.ndarray, gain: float = 1.0, pan: float = 0.0) -> None:
    i = int(at_sec * SR)
    if i < 0 or i >= len(bus):
        return
    n = min(len(sig), len(bus) - i)
    l = gain * (1 - max(0.0, pan))
    r = gain * (1 + min(0.0, pan))
    bus[i:i + n, 0] += sig[:n] * l
    bus[i:i + n, 1] += sig[:n] * r


def reverb(x: np.ndarray, mix: float = 0.26) -> np.ndarray:
    """几个梳状延迟凑一个廉价大厅混响"""
    out = x.copy()
    for delay_ms, fb, g in ((37, 0.42, 0.5), (61, 0.38, 0.42), (97, 0.34, 0.34)):
        d = int(SR * delay_ms / 1000)
        tail = np.zeros_like(x)
        tail[d:] = x[:-d] * g
        for _ in range(3):  # 简单反馈
            tail[d:] += tail[:-d] * fb
        out += tail * mix
    return out


# ---------------------------------------------------------------- 时间轴
def load_plan() -> tuple[float, list[dict]]:
    p = ROOT / 'audio' / 'timeline.json'
    if p.exists():
        tl = json.loads(p.read_text(encoding='utf-8'))
        total = tl['total'] / tl.get('fps', FPS)
        acts = [{'key': a['key'], 's': a['s'] / tl.get('fps', FPS), 'e': a['e'] / tl.get('fps', FPS)} for a in tl['acts']]
        print(f'[audio] 读取 {p.name}：{total:.1f}s / {len(acts)} 幕')
        return total, acts
    # 退化方案：没跑过 npm run timeline 时用一份默认结构
    print('[audio] 未找到 audio/timeline.json，使用默认结构（先跑 npm run timeline 可对齐时间轴）')
    return 52.0, [
        {'key': 'intro', 's': 0.0, 'e': 8.0},
        {'key': 'ds', 's': 8.0, 'e': 28.0},
        {'key': 'co', 's': 28.0, 'e': 44.0},
        {'key': 'fin', 's': 44.0, 'e': 52.0},
    ]


CHORDS = {  # 小调进行：Am - F - C - G
    'Am': [45, 48, 52, 57],
    'F': [41, 45, 48, 53],
    'C': [48, 52, 55, 60],
    'G': [43, 47, 50, 55],
}
PROG = ['Am', 'F', 'C', 'G']


def main() -> None:
    total, acts = load_plan()
    n = int(SR * (total + 2.0))
    mix = np.zeros((n, 2), dtype=np.float64)
    print(f'[audio] 生成 {total:.1f}s，{int(np.ceil(total / BAR))} 小节 @ {BPM:.0f}BPM')

    bars = int(np.ceil(total / BAR))
    for bar in range(bars):
        t0 = bar * BAR
        chord = PROG[bar % len(PROG)]
        notes = CHORDS[chord]

        # 判断这一小节落在哪一幕
        sec = 'fin'
        for a in acts:
            if a['s'] <= t0 < a['e']:
                sec = a['key']
                break

        # 铺底 Pad（每幕都有，fin 弱一点）
        pad_gain = {'intro': 0.20, 'sorts': 0.15, 'ds': 0.13, 'co': 0.16, 'fin': 0.14}.get(sec, 0.14)
        for i, m in enumerate(notes[:3]):
            sig = pad(mtof(m), int(SR * BAR * 1.2)) * env_ad(int(SR * BAR * 1.2), 0.35, 1.2, 2.5)
            add(mix, t0, sig, pad_gain, pan=0.35 if i % 2 else -0.35)

        # 低音：ds/co 走八分音符
        if sec in ('ds', 'co', 'sorts'):
            for beat in range(4):
                m = notes[0] - 12
                sig = (sine(mtof(m), int(SR * BEAT * 0.9)) * env_ad(int(SR * BEAT * 0.9), 0.005, 0.25, 4.0))
                add(mix, t0 + beat * BEAT, sig, 0.34)

        # 鼓：ds 四踩、co 两踩
        if sec in ('ds', 'sorts'):
            for beat in range(4):
                add(mix, t0 + beat * BEAT, kick(int(SR * 0.42)), 0.5)
                add(mix, t0 + beat * BEAT + BEAT / 2, hat(int(SR * 0.05)), 0.12, pan=0.25)
        elif sec == 'co':
            for beat in (0, 2):
                add(mix, t0 + beat * BEAT, kick(int(SR * 0.42)), 0.42)
            for beat in range(8):
                add(mix, t0 + beat * BEAT / 2, hat(int(SR * 0.04)), 0.07, pan=-0.25)

        # 琶音：ds 十六分、co 八分、intro 稀疏
        arp_step = {'intro': 1.0, 'sorts': 0.25, 'ds': 0.25, 'co': 0.5, 'fin': 0.5}.get(sec, 0.5)
        arp_gain = {'intro': 0.10, 'sorts': 0.12, 'ds': 0.13, 'co': 0.11, 'fin': 0.09}.get(sec, 0.1)
        k = 0
        t = 0.0
        while t < BAR - 1e-6:
            m = notes[k % len(notes)] + 12 * (1 + (k // len(notes)) % 2)
            add(mix, t0 + t, pluck(mtof(m), int(SR * 0.5)), arp_gain, pan=(-0.4 if k % 2 else 0.4))
            k += 1
            t += arp_step

        # 铃声：intro 与 fin
        if sec in ('intro', 'fin'):
            for beat in (0.0, 1.5, 2.5):
                m = notes[0] + 12 + (0 if beat == 0.0 else 7)
                add(mix, t0 + beat * BEAT, bell(mtof(m), int(SR * 2.4)), 0.16)

        # 段落切换：加一声 riser
        if any(abs(a['s'] - t0) < 1e-6 for a in acts if a['key'] != 'intro'):
            add(mix, max(0.0, t0 - BEAT), noise_sweep(int(SR * BEAT)), 0.22)

    # 收尾长音
    add(mix, max(0.0, total - 3.0), bell(mtof(69), int(SR * 3.5)), 0.2)

    # 混响 + 归一化 + 淡入淡出
    wet = reverb(mix)
    out = mix * 0.82 + wet * 0.18
    fade = int(SR * 0.8)
    out[:fade] *= np.linspace(0, 1, fade)[:, None]
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    peak = float(np.max(np.abs(out))) or 1.0
    out = out / peak * 0.92

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pcm = (out * 32767.0).astype('<i2')
    with wave.open(str(OUT), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'[audio] 写出 {OUT} （{OUT.stat().st_size / 1024 / 1024:.1f} MB）')


if __name__ == '__main__':
    main()
