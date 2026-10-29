import os
from PIL import Image

artifact_dir = r"C:\Users\devas\.gemini\antigravity\brain\c1d9029b-828c-409e-818a-d36c0af1dd96"
cars_dir = r"c:\Users\devas\OneDrive\Desktop\New folder\assets\cars"
os.makedirs(cars_dir, exist_ok=True)

def convert_to_webp(src_name, dest_name):
    src = os.path.join(artifact_dir, src_name)
    if os.path.exists(src):
        im = Image.open(src).convert("RGB")
        w, h = im.size
        h_1600 = int(round(1600 * h / w))
        im_1600 = im.resize((1600, h_1600), Image.Resampling.LANCZOS)
        im_1600.save(os.path.join(cars_dir, dest_name), "WEBP", quality=85)
        print(f"Saved {dest_name} from {src_name}")

convert_to_webp("noctis_s_sedan_1793290454839.jpg", "s.webp")
convert_to_webp("noctis_x_suv_1793290479322.jpg", "x.webp")
convert_to_webp("noctis_r_track_1793290504756.jpg", "r.webp")

# ONE: Use first dismantle frame placeholder as instructed
ref_dismantle_first = r"c:\Users\devas\OneDrive\Desktop\New folder\assets\frames\dismantle\frame_0001.webp"
if os.path.exists(ref_dismantle_first) and not os.path.exists(os.path.join(cars_dir, "one.webp")):
    im_one = Image.open(ref_dismantle_first).convert("RGB")
    im_one.save(os.path.join(cars_dir, "one.webp"), "WEBP", quality=85)
    print("Saved one.webp using first dismantle frame as placeholder!")

print("All lineup cars processed!")
