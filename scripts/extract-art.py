"""
Crops the supplied 3D character / element references out of the visual pack and
removes their light tile backgrounds (edge-connected flood fill), producing
transparent PNGs in public/art. Usage:
  python3 scripts/extract-art.py <path-to>/02_mobile_pwa_ui_reference.png
These are prototype reference assets, not official Groww artwork.
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

SRC = sys.argv[1]
OUT = "public/art/"

characters = {
    "char-phone": (1540, 118, 1662, 305),
    "char-coins": (1666, 118, 1784, 305),
    "char-idea": (1788, 118, 1906, 305),
    "char-growth": (1540, 350, 1662, 500),
    "char-laptop": (1666, 355, 1784, 500),
    "char-celebrate": (1788, 350, 1906, 500),
    "char-thinking": (1540, 545, 1650, 700),
    "char-insight": (1666, 545, 1784, 700),
    "char-saving": (1788, 545, 1906, 700),
}
elements = {
    "el-coin": (1552, 778, 1632, 868),
    "el-arrow": (1634, 778, 1716, 868),
    "el-piggy": (1718, 782, 1804, 860),
    "el-laptop": (1816, 782, 1906, 862),
    "el-plant": (1550, 868, 1626, 962),
    "el-target": (1628, 872, 1700, 958),
    "el-cap": (1700, 880, 1768, 950),
    "el-bulb": (1766, 868, 1822, 958),
    "el-wallet": (1822, 868, 1904, 962),
}
# kept with its own backdrop, shown inside a shaped container
scenes = {"scene-splash": (40, 225, 262, 512)}


def is_bg(p):
    r, g, b = p[:3]
    return min(r, g, b) > 205 and max(r, g, b) - min(r, g, b) < 26


def cut_out(img):
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    bg = [[False] * h for _ in range(w)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(px[x, y]):
                bg[x][y] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(px[x, y]) and not bg[x][y]:
                bg[x][y] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        c = px[x, y]
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[nx][ny]:
                n = px[nx, ny]
                if is_bg(n) and sum(abs(n[i] - c[i]) for i in range(3)) < 24:
                    bg[nx][ny] = True
                    q.append((nx, ny))
    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    for x in range(w):
        for y in range(h):
            if bg[x][y]:
                mp[x, y] = 0
    # soften the edge a touch so cut-outs don't look jagged
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    img.putalpha(mask)
    bbox = mask.point(lambda v: 255 if v > 20 else 0).getbbox()
    return img.crop(bbox) if bbox else img


src = Image.open(SRC)
for name, box in {**characters, **elements}.items():
    out = cut_out(src.crop(box))
    # 2x upscale for smoother rendering on high-density screens
    out = out.resize((out.width * 2, out.height * 2), Image.LANCZOS)
    out.save(f"{OUT}{name}.png", optimize=True)
    print(name, out.size)
for name, box in scenes.items():
    s = src.crop(box).convert("RGB")
    s = s.resize((s.width * 2, s.height * 2), Image.LANCZOS)
    s.save(f"{OUT}{name}.png", optimize=True)
    print(name, s.size)
