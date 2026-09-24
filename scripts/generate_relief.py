"""Build a shaded-relief Uzbekistan image from public Mapzen DEM tiles and Natural Earth borders."""
from __future__ import annotations

import io
import json
import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, map_coordinates

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets/uzbekistan-relief.png'
BORDER_OUT = ROOT / 'dist/assets/uzbekistan-border.svg'
COUNTRIES = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
TILE = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
W, H = 1400, 760
ZOOM = 7
SCALE = .56
CENTER = (64.55, 41.36)
TILE_SIZE = 256


def mercator(lon: float, lat: float) -> tuple[float, float]:
    n = 2 ** ZOOM * TILE_SIZE
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


cx, cy = mercator(*CENTER)
left, top = cx - W / (2 * SCALE), cy - H / (2 * SCALE)
right, bottom = cx + W / (2 * SCALE), cy + H / (2 * SCALE)
minx, maxx = math.floor(left / 256), math.floor(right / 256)
miny, maxy = math.floor(top / 256), math.floor(bottom / 256)
heights = np.zeros(((maxy - miny + 1) * 256, (maxx - minx + 1) * 256), dtype=np.float32)


def get_tile(x: int, y: int):
    response = requests.get(TILE.format(z=ZOOM, x=x, y=y), timeout=30)
    response.raise_for_status()
    data = np.asarray(Image.open(io.BytesIO(response.content)).convert('RGB'), dtype=np.float32)
    return x, y, data[:, :, 0] * 256 + data[:, :, 1] + data[:, :, 2] / 256 - 32768


with ThreadPoolExecutor(max_workers=12) as pool:
    jobs = [pool.submit(get_tile, x, y) for x in range(minx, maxx + 1) for y in range(miny, maxy + 1)]
    for job in as_completed(jobs):
        x, y, tile = job.result()
        sx, sy = (x - minx) * 256, (y - miny) * 256
        heights[sy:sy + 256, sx:sx + 256] = tile

xx = left + (np.arange(W, dtype=np.float32) + .5) / SCALE - minx * 256
yy = top + (np.arange(H, dtype=np.float32) + .5) / SCALE - miny * 256
sample_y, sample_x = np.meshgrid(yy, xx, indexing='ij')
dem = map_coordinates(heights, [sample_y, sample_x], order=1, mode='nearest')
smooth = gaussian_filter(dem, 1.4)
dy, dx = np.gradient(smooth)
# A low northern light makes the Pamir and Tian Shan foothills legible at this scale.
nx, ny, nz = -dx * .043, -dy * .043, np.ones_like(dx)
normal_len = np.sqrt(nx * nx + ny * ny + nz * nz)
light = (-.52, -.44, .73)
shade = np.clip((nx * light[0] + ny * light[1] + nz * light[2]) / normal_len, 0, 1)
shade = gaussian_filter(shade, .45)
stops = np.array([-300, 0, 250, 600, 1200, 2200, 3600, 5500], dtype=np.float32)
colors = np.array([
    [38, 65, 58], [49, 74, 62], [72, 91, 70], [91, 105, 77],
    [119, 126, 94], [153, 151, 113], [189, 182, 146], [218, 211, 181]
], dtype=np.float32)
rgb = np.stack([np.interp(dem, stops, colors[:, i]) for i in range(3)], axis=-1)
rgb = np.clip(rgb * (.57 + .72 * shade[..., None]), 0, 255).astype(np.uint8)
# Quiet elevation contours retain the look of a physical relief sheet.
levels = np.floor(gaussian_filter(dem, 2.2) / 300)
contour = (levels[:, 1:] != levels[:, :-1])
line = np.zeros((H, W), dtype=bool)
line[:, 1:] |= contour
line[1:, :] |= levels[1:, :] != levels[:-1, :]
rgb[line] = np.clip(rgb[line].astype(np.float32) * .72 + np.array([45, 49, 38]), 0, 255).astype(np.uint8)

geo = requests.get(COUNTRIES, timeout=35).json()
uzb = next(feature for feature in geo['features'] if feature['properties'].get('ADM0_A3') == 'UZB')
geometry = uzb['geometry']
polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']

def point(p):
    x, y = mercator(p[0], p[1])
    return ((x - cx) * SCALE + W / 2, (y - cy) * SCALE + H / 2)

mask = Image.new('L', (W, H), 0)
draw = ImageDraw.Draw(mask)
paths = []
for polygon in polygons:
    outer = [point(p) for p in polygon[0]]
    draw.polygon(outer, fill=255)
    paths.append('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in outer) + ' Z')
    for ring in polygon[1:]:
        draw.polygon([point(p) for p in ring], fill=0)

canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow = Image.new('RGBA', (W, H), (151, 187, 131, 0))
soft = mask.filter(ImageFilter.GaussianBlur(23))
glow.putalpha(soft.point(lambda a: int(a * .24)))
canvas.alpha_composite(glow)
shadow = Image.new('RGBA', (W, H), (0, 8, 5, 0))
shifted = Image.new('L', (W, H), 0)
shifted.paste(mask, (0, 17))
shadow.putalpha(shifted.filter(ImageFilter.GaussianBlur(17)).point(lambda a: int(a * .72)))
canvas.alpha_composite(shadow)
terrain = Image.fromarray(rgb, 'RGB').convert('RGBA')
terrain.putalpha(mask)
canvas.alpha_composite(terrain)
canvas.save(OUT, optimize=True)
BORDER_OUT.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><path d="{" ".join(paths)}" fill="none" stroke="#b5c99b" stroke-opacity=".54" stroke-width="2" stroke-linejoin="round"/></svg>')
print('saved', OUT, OUT.stat().st_size)
for name, lon, lat in [
    ('hub', 65.4, 40.6), ('west', 58.8, 42.5), ('north', 62.6, 44.2),
    ('east', 71.2, 40.8), ('south', 67.2, 38.4), ('center', 68.2, 40.1),
]:
    x, y = point((lon, lat))
    print(name, round(x, 1), round(y, 1), 'inside', mask.getpixel((int(x), int(y))) > 0)
