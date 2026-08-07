"""
Extract precise card images from PDF page 9 (Construção da Equação examples).
The detected regions at known coordinates are the illustrated cards.
"""
from PIL import Image
import os

os.makedirs('client/public/assets/cards', exist_ok=True)

img = Image.open('../page_9.jpg')
print(f'Source: {img.size}')

# Card regions detected (cards shown in equation examples on page 9)
# Format: (name, x1, y1, x2, y2)
card_regions = [
    ('carta_exemplo_1', 296, 633, 432, 830),   # first card row
    ('carta_exemplo_2', 467, 633, 603, 831),
    ('carta_exemplo_3', 556, 648, 623, 842),
    ('carta_exemplo_4', 313, 387, 436, 578),   # second row
    ('carta_exemplo_5', 624, 390, 750, 580),
    ('carta_exemplo_6', 790, 393, 918, 582),
]

# Also try to find cards from page 7 (Instrumentos section)
img7 = Image.open('../page_7.jpg')
card_regions7 = [
    ('carta_instrumento_1', 552, 460, 615, 528),
    ('carta_instrumento_2', 555, 836, 602, 921),
    ('carta_instrumento_3', 609, 836, 655, 925),
    ('carta_instrumento_4', 668, 839, 714, 923),
    ('carta_instrumento_5', 718, 836, 765, 926),
]

for name, x1, y1, x2, y2 in card_regions:
    crop = img.crop((x1, y1, x2, y2))
    # Upscale a bit for better visibility
    scale = 2
    crop = crop.resize((crop.width * scale, crop.height * scale), Image.LANCZOS)
    path = f'client/public/assets/cards/{name}.png'
    crop.save(path)
    print(f'Saved {path} ({crop.width}x{crop.height})')

for name, x1, y1, x2, y2 in card_regions7:
    crop = img7.crop((x1, y1, x2, y2))
    scale = 2
    crop = crop.resize((crop.width * scale, crop.height * scale), Image.LANCZOS)
    path = f'client/public/assets/cards/{name}.png'
    crop.save(path)
    print(f'Saved {path} ({crop.width}x{crop.height})')

print('\nDone! Cards saved to client/public/assets/cards/')
