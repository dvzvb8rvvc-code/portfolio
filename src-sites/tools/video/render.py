#!/usr/bin/env python3
"""Deterministic offline depth-parallax video renderer for YTS clips.
Usage: python3 render.py <clip> [--preview]   (clips defined in CLIPS)
Backward depth-warp (fixed-point) on a softened depth map + haze, light sweep,
warm grade, grain. Camera path is periodic in t -> seamless loop."""
import sys, os, subprocess, math
import numpy as np, cv2

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'yts'))
W, H, FPS = 1920, 1080, 30
TAU = 2 * math.pi

# Scene: id, crop rect (cx, cy in source fraction; hf = rect height as fraction of source height),
# camera: Z0 base zoom, Za zoom amplitude on dolly; k depth-dolly; P0/Pa/Pb pan (rect-height units);
# Ta/Tb parallax translation per unit depth; d0 focus depth; haze amount.
CLIPS = {
  'como':     dict(sec=10, scenes=[dict(id=5,   cx=.5, cy=.50, hf=.45, Z0=1.07, Za=.06, k=.05, P0=(0,0), Pa=(0,.05), Pb=(.012,0), Ta=(0,.0), Tb=(.020,.004), d0=.55, haze=.10)]),
  'lake':     dict(sec=10, scenes=[dict(id=129, cx=.5, cy=.5, hf=1., Z0=1.06, Za=.035, k=.03, P0=(0,0), Pa=(0,0), Pb=(.10,0), Ta=(0,0), Tb=(.016,.0), d0=.25, haze=.02)]),
  'volterra': dict(sec=10, scenes=[dict(id=145, cx=.5, cy=.47, hf=.63, Z0=1.07, Za=.07, k=.05, P0=(0,0), Pa=(.02,-.02), Pb=(.012,.004), Ta=(0,0), Tb=(.018,.004), d0=.45, haze=.09)]),
  'frescoes': dict(sec=10, scenes=[
      dict(id=148, cx=.5, cy=.55, hf=.55, Z0=1.06, Za=.05, k=.07, P0=(0,0), Pa=(0,0), Pb=(.010,0), Ta=(0,0), Tb=(.018,.003), d0=.35, haze=.05),
      dict(id=156, cx=.5, cy=.56, hf=.41, Z0=1.06, Za=.05, k=.07, P0=(0,0), Pa=(0,0), Pb=(-.010,0), Ta=(0,0), Tb=(-.018,.003), d0=.35, haze=.05, phase=.5)]),
  'forest':   dict(sec=10, scenes=[dict(id=84,  cx=.5, cy=.5, hf=1., Z0=1.12, Za=.05, k=.04, P0=(0,.06), Pa=(0,0), Pb=(.03,0), Ta=(0,0), Tb=(.020,.0), d0=.35, haze=.04)]),
  'tower':    dict(sec=10, scenes=[dict(id=40,  cx=.5, cy=.60, hf=.56, Z0=1.07, Za=.04, k=.04, P0=(0,.04), Pa=(0,-.16), Pb=(.010,0), Ta=(0,0), Tb=(.016,.0), d0=.45, haze=.07)]),
}

def load(sid):
    def pick(kind):
        xl = f'{ROOT}/{kind}/{sid}-xl.webp'
        return xl if os.path.exists(xl) else f'{ROOT}/{kind}/{sid}.webp'
    img = cv2.imread(pick('img'), cv2.IMREAD_COLOR)[:, :, ::-1].astype(np.float32) / 255.0
    img = img ** 2.2  # to linear
    d = cv2.imread(pick('depth'), cv2.IMREAD_GRAYSCALE).astype(np.float32)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
    d = np.clip((d - lo) / max(hi - lo, 1), 0, 1)
    # soften discontinuities: grow near objects slightly, then blur
    r = max(3, int(d.shape[1] / 160))
    d = cv2.dilate(d, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2*r+1, 2*r+1)))
    d = cv2.GaussianBlur(d, (0, 0), d.shape[1] / 180)
    d = cv2.resize(d, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    return img, d

class Scene:
    def __init__(s, cfg):
        s.c = cfg
        s.img, s.depth = load(cfg['id'])
        sh, sw = s.img.shape[:2]
        s.rh = cfg['hf'] * sh                 # rect height in source px
        s.rw = s.rh * W / H
        if s.rw > sw:  # clamp to width
            s.rw = sw; s.rh = sw * H / W
        s.cx = float(np.clip(cfg['cx'] * sw, s.rw/2, sw - s.rw/2))
        s.cy = float(np.clip(cfg['cy'] * sh, s.rh/2, sh - s.rh/2))
        # low-res output grid (rect-height units) for the fixed-point solve
        s.lw, s.lh = W // 2, H // 2
        ys, xs = np.mgrid[0:s.lh, 0:s.lw].astype(np.float32)
        s.ux = (xs + .5) / s.lh - (s.lw / s.lh) / 2
        s.uy = (ys + .5) / s.lh - .5
        s.dsmall = cv2.resize(s.depth, (max(8, int(sw/2)), max(8, int(sh/2))), interpolation=cv2.INTER_AREA)
        s.dscale = s.dsmall.shape[1] / sw

    def maps(s, t):
        c = s.c
        th = TAU * (t + c.get('phase', 0))
        a = (1 - math.cos(th)) / 2; b = math.sin(th)
        Z = c['Z0'] + c['Za'] * a
        k = c['k'] * a
        Px = c['P0'][0] + c['Pa'][0]*a + c['Pb'][0]*b; Py = c['P0'][1] + c['Pa'][1]*a + c['Pb'][1]*b
        Tx = c['Ta'][0]*a + c['Tb'][0]*b;               Ty = c['Ta'][1]*a + c['Tb'][1]*b
        d0 = c['d0']
        d = np.full_like(s.ux, d0, dtype=np.float32)
        for _ in range(5):
            m = Z * (1 + k * (d - d0))
            sx = Px + (s.ux - Tx * (d - d0)) / m
            sy = Py + (s.uy - Ty * (d - d0)) / m
            px = (s.cx + sx * s.rh) * s.dscale; py = (s.cy + sy * s.rh) * s.dscale
            dn = cv2.remap(s.dsmall, px.astype(np.float32), py.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            d = d * .4 + dn * .6
        mx = cv2.resize((s.cx + sx * s.rh).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
        my = cv2.resize((s.cy + sy * s.rh).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
        dd = cv2.resize(d, (W, H), interpolation=cv2.INTER_LINEAR)
        return mx, my, dd, a, b

    def render(s, t):
        mx, my, dd, a, b = s.maps(t)
        col = cv2.remap(s.img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        col = np.clip(col, 0, 1)
        # atmospheric haze by depth (far = 0)
        hz = s.c['haze'] * (1 - dd) ** 2.2 * (1 + .25 * a)
        haze_col = np.array([0.80, 0.70, 0.56], np.float32) ** 2.2
        col = col * (1 - hz[..., None]) + haze_col * hz[..., None]
        return col, dd

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
NX = (XX / W - .5) * (W / H); NY = YY / H - .5
VIG = np.clip(1 - .38 * (NX**2 + NY**2) ** 1.1 * 1.6, 0, 1)

def finish(col, t, f):
    th = TAU * t
    # gentle light sweep: diagonal soft band drifting (periodic)
    pos = .55 * math.cos(th + .9)
    band = np.exp(-((NX * .8 + NY * .6 - pos) / .55) ** 2)
    lum = col @ np.array([.2126, .7152, .0722], np.float32)
    sweep = (.06 * band * (.35 + lum))[..., None] * np.array([1.0, .82, .58], np.float32)
    col = col + sweep
    # to display gamma
    col = np.clip(col, 0, None) ** (1 / 2.2)
    # warm luxury grade: soft filmic shoulder, lifted blacks, warm highlights, cool-neutral shadows
    col = col / (1 + .12 * col) * 1.12
    col = col + (col - .5) * .10 * (1 - np.abs(col - .5) * 2)  # gentle S
    l = col @ np.array([.299, .587, .114], np.float32)
    hi = np.clip((l - .45) / .55, 0, 1)[..., None]
    col = col * (1 - hi * .06) + hi * .06 * np.array([1.0, .86, .66], np.float32) * l[..., None] * 1.1
    col = .022 * np.array([1.0, .93, .84], np.float32) + col * (1 - .03)
    l = (col @ np.array([.299, .587, .114], np.float32))[..., None]
    col = l + (col - l) * .98  # slight desaturation
    col = col * VIG[..., None]
    # fine film grain (deterministic per frame), luminance-weighted towards mids
    rng = np.random.default_rng(1000 + f)
    g = rng.standard_normal((H // 2, W // 2)).astype(np.float32)
    g = cv2.resize(g, (W, H), interpolation=cv2.INTER_LINEAR)
    l = col.mean(axis=2)
    col = col + (g * .008 * (1 - np.abs(l - .5) * 1.2))[..., None]
    return (np.clip(col, 0, 1) * 255 + .5).astype(np.uint8)

def weights(name, t):
    if name != 'frescoes':
        return [1.0]
    def ss(x): x = min(max(x, 0), 1); return x * x * (3 - 2 * x)
    w2 = ss((t - .40) / .14) - ss((t - .86) / .14)
    return [1 - w2, w2]

def main():
    name = sys.argv[1]; preview = '--preview' in sys.argv
    cfg = CLIPS[name]; N = cfg['sec'] * FPS
    scenes = [Scene(c) for c in cfg['scenes']]
    out = f'{ROOT}/video'
    if preview:
        frames = [int(N * x) for x in (0, .125, .25, .375, .5, .625, .75, .875)]
        tiles = []
        for f in frames:
            t = f / N; ws = weights(name, t)
            col = sum(w * sc.render(t)[0] for w, sc in zip(ws, scenes) if w > 1e-4)
            tiles.append(cv2.resize(finish(col, t, f), (640, 360), interpolation=cv2.INTER_AREA))
        grid = np.vstack([np.hstack(tiles[i:i+4]) for i in (0, 4)])
        p = sys.argv[sys.argv.index('--preview') + 1]
        cv2.imwrite(p, grid[:, :, ::-1]); return
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-filter_complex', '[0:v]split=2[a][b];[b]scale=1280:720:flags=lanczos[c]',
           '-map', '[a]', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', os.environ.get('CRF', '22'), '-maxrate', '4.4M', '-bufsize', '8M', '-pix_fmt', 'yuv420p', '-tune', 'grain' if os.environ.get('TUNE') else 'film', '-g', '60', '-movflags', '+faststart', '-an', f'{out}/{name}-1080.mp4',
           '-map', '[c]', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', os.environ.get('CRF720', '23'), '-maxrate', '1.8M', '-bufsize', '3.2M', '-pix_fmt', 'yuv420p', '-tune', 'film', '-g', '60', '-movflags', '+faststart', '-an', f'{out}/{name}-720.mp4']
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(N):
        t = f / N; ws = weights(name, t)
        col = sum(w * sc.render(t)[0] for w, sc in zip(ws, scenes) if w > 1e-4)
        fr = finish(col, t, f)
        if f == 0:
            im = cv2.resize(fr, (1600, 900), interpolation=cv2.INTER_AREA)
            cv2.imwrite(f'{out}/{name}.jpg', im[:, :, ::-1], [cv2.IMWRITE_JPEG_QUALITY, 80])
        pr.stdin.write(fr.tobytes())
    pr.stdin.close(); pr.wait()

if __name__ == '__main__':
    main()
