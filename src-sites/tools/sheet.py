# usage: python3 tools/sheet.py <pngPrefix>  -> <pngPrefix>-sheet.png (6 desktop + 5 mobile)
import sys
from PIL import Image
pre = sys.argv[1]
d = [Image.open(f'{pre}-d{i}.png').resize((640, 400)) for i in range(6)]
m = [Image.open(f'{pre}-m{i}.png').resize((195, 422)) for i in range(5)]
W = Image.new('RGB', (1280 + 5 * 195, 1200), 'white')
for i, im in enumerate(d): W.paste(im, ((i % 2) * 640, (i // 2) * 400))
for i, im in enumerate(m): W.paste(im, (1280 + i * 195, 0))
W.save(f'{pre}-sheet.png')
