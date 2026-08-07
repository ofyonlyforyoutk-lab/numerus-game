"""
Analyze PDF pages to detect card-like regions and extract them.
Cards typically appear as lighter rectangles with borders on the parchment background.
"""
from PIL import Image, ImageOps
import os
import sys

def analyze_grid(path, label):
    img = Image.open(path)
    w, h = img.size
    print(f"\n=== {label} ({w}x{h}) ===")
    gray = ImageOps.grayscale(img)
    for row in range(0, h, 80):
        cells = []
        for col in range(0, w, 80):
            region = gray.crop((col, row, min(col + 80, w), min(row + 80, h)))
            pixels = list(region.getdata())
            avg = sum(pixels) / len(pixels)
            cells.append(f"{avg:3.0f}")
        print(f"y{row:4d}: " + " ".join(cells))

def find_card_regions(path, min_width=40, min_height=60):
    """
    Find rectangular regions that look like cards:
    - lighter background than surroundings (or darker, depending on scan)
    - have a distinct border
    Uses a simple connected-component approach on thresholded edge map.
    """
    from PIL import ImageFilter
    img = Image.open(path).convert('RGB')
    w, h = img.size
    gray = ImageOps.grayscale(img)

    # Edge detection
    edges = gray.filter(ImageFilter.FIND_EDGES)
    # Binarize edges
    edge_data = list(edges.getdata())
    threshold = 60
    binary = Image.new('L', (w, h))
    binary.putdata([255 if v > threshold else 0 for v in edge_data])

    # Find bounding boxes of connected edge clusters using simple scan
    # We'll look for runs of edge pixels forming rectangles
    px = binary.load()
    regions = []
    visited = set()

    from collections import deque
    for y in range(h):
        for x in range(w):
            if px[x, y] > 100 and (x, y) not in visited:
                # BFS flood fill
                queue = deque([(x, y)])
                visited.add((x, y))
                min_x, max_x = x, x
                min_y, max_y = y, y
                while queue:
                    cx, cy = queue.popleft()
                    min_x = min(min_x, cx); max_x = max(max_x, cx)
                    min_y = min(min_y, cy); max_y = max(max_y, cy)
                    for dx, dy in [(1,0),(-1,0),(0,1),(0,-1)]:
                        nx, ny = cx+dx, cy+dy
                        if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                            if px[nx, ny] > 100:
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                rw = max_x - min_x
                rh = max_y - min_y
                if rw >= min_width and rh >= min_height:
                    regions.append((min_x, min_y, max_x, max_y, rw, rh))

    # Sort by area descending, dedupe overlapping
    regions.sort(key=lambda r: r[4] * r[5], reverse=True)
    kept = []
    for r in regions:
        overlap = False
        for k in kept:
            # Check if centers are close
            rc = (r[0] + r[2]) / 2, (r[1] + r[3]) / 2
            kc = (k[0] + k[2]) / 2, (k[1] + k[3]) / 2
            dist = ((rc[0] - kc[0]) ** 2 + (rc[1] - kc[1]) ** 2) ** 0.5
            if dist < 50:
                overlap = True
                break
        if not overlap:
            kept.append(r)
        if len(kept) >= 12:
            break

    return kept[:12]

def main():
    pages = {
        '../page_7.jpg': 'Instrumentos (cards demo)',
        '../page_9.jpg': 'Construção da Equação (card examples)'
    }
    for path, label in pages.items():
        if not os.path.exists(path):
            print(f'  SKIP: {path} not found')
            continue
        analyze_grid(path, label)
        regions = find_card_regions(path)
        print(f"\n  Found {len(regions)} candidate card regions:")
        for i, (x1, y1, x2, y2, rw, rh) in enumerate(regions):
            print(f"    Card {i+1}: ({x1},{y1})-({x2},{y2}) {rw}x{rh}")
            # Crop and save
            img = Image.open(path)
            # Add small padding
            pad = 3
            crop = img.crop((max(0, x1-pad), max(0, y1-pad), min(img.width, x2+pad), min(img.height, y2+pad)))
            out = f'extracted_card_{label.split()[0]}_{i+1}.png'
            crop.save(out)
            print(f"      Saved {out}")

if __name__ == '__main__':
    main()
