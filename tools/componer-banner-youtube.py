from PIL import Image, ImageFilter, ImageDraw
import numpy as np

SRC = '/Users/victormiascovsky/Downloads/screen 8.png'
OUT = '/private/tmp/claude-501/-Users-victormiascovsky-Antigravity/2d180b76-b727-4218-a790-a72a7848b855/scratchpad/banner_out'
W, H = 2560, 1440
SAFE_W, SAFE_H = 1546, 423           # zona visible en TODOS los dispositivos (celular incluido)
CX, CY = W // 2, H // 2

src = Image.open(SRC).convert('RGB')
sw, sh = src.size                     # 1376 x 768

# ---------------------------------------------------------------- 1) corrección "VICTOR" -> "VÍCTOR"
# Copia la tilde de la "Ó" de INVERSIÓN (mismo estilo) y la pone sobre la "I" de VICTOR.
a = np.asarray(src).astype(float)
def lum(x): return x[..., :3].mean(axis=-1)
ax0, ay0, ax1, ay1 = 1141, 372, 1155, 381          # caja de la tilde original (pixeles de la fuente)
patch = a[ay0:ay1, ax0:ax1]
bg_l = np.median(lum(a[ay0-6:ay0-1, ax0:ax1]))     # brillo del fondo alrededor
fg_l = lum(patch).max()
alpha = np.clip((lum(patch) - bg_l) / max(fg_l - bg_l, 1), 0, 1)
fg_col = patch[lum(patch) >= fg_l - 6].mean(axis=0)  # color crema del trazo
SC = 0.92                                            # la línea de nombres es un poco más chica
ph, pw = alpha.shape
new_w, new_h = max(1, round(pw * SC)), max(1, round(ph * SC))
alpha_img = Image.fromarray((alpha * 255).astype('uint8')).resize((new_w, new_h), Image.LANCZOS)
tx, ty = 862, 429                                    # esquina sup-izq destino (centrada sobre la I, x≈868)
color_layer = Image.new('RGB', (new_w, new_h), tuple(int(c) for c in fg_col))
src_fixed = src.copy()
# (sin tilde por pedido de Vic) src_fixed.paste(color_layer, (tx, ty), alpha_img)

# ---------------------------------------------------------------- 2) fondo 2560x1440 con las partes LIMPIAS de la imagen
# arriba y abajo de la franja original hay solo bokeh; el medio se completa con esos mismos bordes en espejo.
from PIL import ImageOps
TOP_H, BOT_Y = 245, 535                                   # zonas limpias de la fuente: y 0..245 y 535..768
top = src.crop((0, 0, sw, TOP_H)).resize((W, round(TOP_H * W / sw)), Image.LANCZOS)
bot = src.crop((0, BOT_Y, sw, sh)).resize((W, round((sh - BOT_Y) * W / sw)), Image.LANCZOS)
th, bh = top.size[1], bot.size[1]
canvas = np.zeros((H, W, 3), dtype=float)
canvas[:th] = np.asarray(top)
canvas[H - bh:] = np.asarray(bot)
mirT = np.asarray(ImageOps.flip(top)).astype(float)       # continúa hacia abajo desde el borde inferior de "top"
mirB = np.asarray(ImageOps.flip(bot)).astype(float)       # continúa hacia arriba desde el borde superior de "bot"
mid_y0, mid_y1 = th, H - bh
mid = np.zeros((mid_y1 - mid_y0, W, 3))
for k, y in enumerate(range(mid_y0, mid_y1)):
    t_row = mirT[y - mid_y0] if (y - mid_y0) < th else None
    b_idx = (H - bh) - 1 - y
    b_row = mirB[(bh - 1) - ((H - bh) - 1 - y) - 0] if False else None
    # fila del espejo de "bot": distancia al borde superior de bot
    d_b = (H - bh) - 1 - y            # >=0 : cuántas filas antes del borde de bot
    b_row = mirB[bh - 1 - d_b] if d_b < bh else None
    w_b = min(max((y - 574) / (912 - 574), 0.0), 1.0)
    if t_row is None: mid[k] = b_row
    elif b_row is None: mid[k] = t_row
    else: mid[k] = t_row * (1 - w_b) + b_row * w_b
canvas[mid_y0:mid_y1] = mid
bg = Image.fromarray(canvas.clip(0, 255).astype('uint8'))

# banda oscura translucida de lado a lado: da continuidad a la vista de escritorio (2560x423) y a la del celular
band = np.zeros(H)
b0, b1, r = 430, 1010, 90
for y in range(H):
    if b0 <= y <= b1:
        band[y] = min(1.0, (y - b0) / r, (b1 - y) / r) * 0.42
bn = np.asarray(bg).astype(float) * (1 - band[:, None, None])
bg = Image.fromarray(bn.clip(0, 255).astype('uint8'))

# ---------------------------------------------------------------- 3) contenido reescalado al ancho de la zona segura
cx0, cx1, cy0, cy1 = 90, 1235, 250, 531               # franja con el logo y el texto
content = src_fixed.crop((cx0, cy0, cx1, cy1))
cw, ch = content.size
target_w = 1490                                        # 28 px de margen a cada lado dentro de los 1546 seguros
s = target_w / cw
content = content.resize((round(cw * s), round(ch * s)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 70, 2))
cw, ch = content.size
assert cw <= SAFE_W and ch <= SAFE_H, (cw, ch)

# máscara con bordes suaves para fundirlo con el fondo
fx, fy = 44, 20
m = np.ones((ch, cw))
for i in range(fx):
    m[:, i] *= i / fx
    m[:, cw - 1 - i] *= i / fx
for i in range(fy):
    m[i, :] *= i / fy
    m[ch - 1 - i, :] *= i / fy
cmask = Image.fromarray((m * 255).astype('uint8'))
px, py = CX - cw // 2, CY - ch // 2
bg.paste(content, (px, py), cmask)

# viñeta suave para dar profundidad
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - CX) / (W / 1.25)) ** 2 + ((yy - CY) / (H / 1.15)) ** 2)
vig = np.clip(1 - 0.35 * np.clip(d - 0.35, 0, 1), 0.6, 1)
out = (np.asarray(bg).astype(float) * vig[..., None]).clip(0, 255).astype('uint8')
final = Image.fromarray(out)
final.save(OUT + '.png', optimize=True)
final.convert('RGB').save(OUT + '.jpg', quality=93, optimize=True, subsampling=0)

# ---------------------------------------------------------------- 4) simulación de cómo lo ve cada dispositivo
def crop_center(w, h):
    return final.crop((CX - w // 2, CY - h // 2, CX + w // 2, CY + h // 2))
views = [('TV (todo)', final.resize((640, 360), Image.LANCZOS)),
         ('Computadora (2560x423)', crop_center(2560, 423).resize((640, 106), Image.LANCZOS)),
         ('Tablet (1855x423)', crop_center(1855, 423).resize((640, 146), Image.LANCZOS)),
         ('Celular (1546x423)', crop_center(1546, 423).resize((640, 175), Image.LANCZOS))]
sheet = Image.new('RGB', (680, sum(v[1].size[1] + 34 for v in views) + 10), (236, 234, 228))
dr = ImageDraw.Draw(sheet)
y = 6
for name, im in views:
    dr.text((20, y), name, fill=(60, 60, 60))
    sheet.paste(im, (20, y + 16))
    y += im.size[1] + 34
sheet.save(OUT + '_dispositivos.png')
print('contenido', (cw, ch), 'posición', (px, py), 'fuera de zona segura:', not (px >= CX - SAFE_W // 2 and px + cw <= CX + SAFE_W // 2))
import os
print('PNG', round(os.path.getsize(OUT + '.png') / 1e6, 2), 'MB | JPG', round(os.path.getsize(OUT + '.jpg') / 1e6, 2), 'MB')
