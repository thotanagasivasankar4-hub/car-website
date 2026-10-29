import os
import re
import shutil
import concurrent.futures
from PIL import Image, ImageEnhance

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

base_dir = r"c:\Users\devas\OneDrive\Desktop\New folder"
frames_hero = os.path.join(base_dir, "frames", "hero section")
frames_dismantle = os.path.join(base_dir, "frames", "dismantle")

out_hero = os.path.join(base_dir, "assets", "frames", "hero")
out_hero_mob = os.path.join(base_dir, "assets", "frames", "hero-mobile")
out_dismantle = os.path.join(base_dir, "assets", "frames", "dismantle")
out_dismantle_mob = os.path.join(base_dir, "assets", "frames", "dismantle-mobile")
out_cars = os.path.join(base_dir, "assets", "cars")

for d in [out_hero, out_hero_mob, out_dismantle, out_dismantle_mob, out_cars]:
    os.makedirs(d, exist_ok=True)

# 1. Collect Hero frames
c1_dir = os.path.join(frames_hero, "clip 1")
c2_dir = os.path.join(frames_hero, "clip 2")
c3_dir = os.path.join(frames_hero, "clip 3")

c1_files = [os.path.join(c1_dir, f) for f in sorted(os.listdir(c1_dir), key=natural_sort_key) if f.endswith(('.jpg', '.png'))]
c2_files = [os.path.join(c2_dir, f) for f in sorted(os.listdir(c2_dir), key=natural_sort_key) if f.endswith(('.jpg', '.png'))]
c3_files = [os.path.join(c3_dir, f) for f in sorted(os.listdir(c3_dir), key=natural_sort_key) if f.endswith(('.jpg', '.png'))]

hero_sources = list(c1_files)
hero_sources.extend(c2_files[1:]) # Skip duplicate join frame
hero_sources.extend(c3_files[1:]) # Skip duplicate join frame

# 2. Collect Dismantle frames
dismantle_sources = [os.path.join(frames_dismantle, f) for f in sorted(os.listdir(frames_dismantle), key=natural_sort_key) if f.endswith(('.jpg', '.png'))]

def process_frame(args):
    src_path, desk_out, mob_out = args
    if os.path.exists(desk_out) and os.path.exists(mob_out) and os.path.getsize(desk_out) > 0 and os.path.getsize(mob_out) > 0:
        return
    with Image.open(src_path) as im:
        im = im.convert("RGB")
        w, h = im.size
        # Desktop 1600px wide, quality 78
        h_1600 = int(round(1600 * h / w))
        im_desk = im.resize((1600, h_1600), Image.Resampling.LANCZOS)
        im_desk.save(desk_out, "WEBP", quality=78)

        # Mobile 960px wide, quality 72
        h_960 = int(round(960 * h / w))
        im_mob = im.resize((960, h_960), Image.Resampling.LANCZOS)
        im_mob.save(mob_out, "WEBP", quality=72)

# Prepare jobs for Hero
hero_jobs = []
for i, src in enumerate(hero_sources, start=1):
    desk = os.path.join(out_hero, f"frame_{i:04d}.webp")
    mob = os.path.join(out_hero_mob, f"frame_{i:04d}.webp")
    hero_jobs.append((src, desk, mob))

# Prepare jobs for Dismantle
dismantle_jobs = []
for i, src in enumerate(dismantle_sources, start=1):
    desk = os.path.join(out_dismantle, f"frame_{i:04d}.webp")
    mob = os.path.join(out_dismantle_mob, f"frame_{i:04d}.webp")
    dismantle_jobs.append((src, desk, mob))

print(f"Converting {len(hero_jobs)} Hero frames and {len(dismantle_jobs)} Dismantle frames with ThreadPoolExecutor...")
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    list(executor.map(process_frame, hero_jobs + dismantle_jobs))

def get_folder_stats(folder):
    files = [f for f in os.listdir(folder) if f.endswith('.webp')]
    total_bytes = sum(os.path.getsize(os.path.join(folder, f)) for f in files)
    return len(files), total_bytes / (1024 * 1024)

hero_d_cnt, hero_d_mb = get_folder_stats(out_hero)
hero_m_cnt, hero_m_mb = get_folder_stats(out_hero_mob)
dism_d_cnt, dism_d_mb = get_folder_stats(out_dismantle)
dism_m_cnt, dism_m_mb = get_folder_stats(out_dismantle_mob)

print(f"Hero Desktop: {hero_d_cnt} frames, {hero_d_mb:.2f} MB")
print(f"Hero Mobile: {hero_m_cnt} frames, {hero_m_mb:.2f} MB")
print(f"Dismantle Desktop: {dism_d_cnt} frames, {dism_d_mb:.2f} MB")
print(f"Dismantle Mobile: {dism_m_cnt} frames, {dism_m_mb:.2f} MB")

# Product lineup images
ref_k4 = r"C:\Users\devas\OneDrive\Desktop\car video\k4 car.png"
if os.path.exists(ref_k4):
    k4_im = Image.open(ref_k4).convert("RGB")
    car_crop = k4_im.crop((550, 480, 1080, 735))
    cc_w, cc_h = car_crop.size
    scale = 1120.0 / cc_w
    car_scaled = car_crop.resize((1120, int(round(cc_h * scale))), Image.Resampling.LANCZOS)
    csw, csh = car_scaled.size

    bg_color = (7, 8, 10)
    def create_car_shot(style):
        base = Image.new("RGB", (1600, 900), bg_color)
        if style == "gt-e": # matte graphite grand tourer
            variant = car_scaled.copy()
            variant = ImageEnhance.Contrast(variant).enhance(1.05)
        elif style == "s": # satin bone white
            variant = car_scaled.copy()
            r, g, b = variant.split()
            # brighten body towards bone white
            variant = ImageEnhance.Brightness(variant).enhance(1.35)
            variant = ImageEnhance.Contrast(variant).enhance(1.1)
        elif style == "x": # midnight blue SUV coupe
            variant = car_scaled.copy()
            r, g, b = variant.split()
            r = r.point(lambda p: int(p * 0.7))
            g = g.point(lambda p: int(p * 0.8))
            b = b.point(lambda p: min(255, int(p * 1.4)))
            variant = Image.merge("RGB", (r, g, b))
        elif style == "r": # track coupe satin black
            variant = car_scaled.copy()
            variant = ImageEnhance.Contrast(variant).enhance(1.3)
            variant = ImageEnhance.Brightness(variant).enhance(0.85)
        elif style == "one": # hypercar liquid silver
            # low and long
            v_low = car_crop.resize((1180, int(round(cc_h * scale * 0.82))), Image.Resampling.LANCZOS)
            variant = ImageEnhance.Contrast(v_low).enhance(1.3)
            variant = ImageEnhance.Brightness(variant).enhance(1.2)
        
        vw, vh = variant.size
        v_top_y = int(round(648 - 0.92 * vh))
        v_left_x = int(round((1600 - vw) / 2))
        base.paste(variant, (v_left_x, v_top_y))
        return base

    for name, st in [("gt-e.webp", "gt-e"), ("s.webp", "s"), ("x.webp", "x"), ("r.webp", "r"), ("one.webp", "one")]:
        shot = create_car_shot(st)
        shot.save(os.path.join(out_cars, name), "WEBP", quality=85)
        print(f"Generated car lineup image: {name}")

print("DONE!")
