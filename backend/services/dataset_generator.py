import os
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import cv2

import numpy as np
import random
from config import DATASET_FOLDER, SAMPLE_FOLDER

CLASSES = ['Healthy', 'Alternaria Blight', 'Powdery Mildew', 'Downy Mildew', 'Anthracnose']

def draw_bitter_gourd_base_leaf():
    """
    Renders a realistic synthetic bitter gourd leaf with 5-7 deep palmate lobes,
    natural green gradient, and detailed leaf vein structure on a neutral background.
    """
    img = np.full((300, 300, 3), (235, 242, 235), dtype=np.uint8) # soft off-white background
    center = (150, 150)
    
    # Base green color with slight variation
    base_color = (
        random.randint(25, 45),   # B
        random.randint(110, 150), # G
        random.randint(30, 60)    # R
    )
    
    # Define palmate leaf contour points
    num_lobes = 5
    angles = np.linspace(0, 2 * np.pi, 200, endpoint=False)
    pts = []
    
    # Mathematical equation for a multi-lobed bitter gourd leaf boundary
    for a in angles:
        r = 100 + 35 * np.cos(5 * a) + 15 * np.sin(2 * a) + random.uniform(-2, 2)
        x = int(center[0] + r * np.cos(a))
        y = int(center[1] + r * np.sin(a))
        pts.append([x, y])
        
    leaf_contour = np.array(pts, dtype=np.int32)
    
    # Fill leaf lamina
    cv2.fillPoly(img, [leaf_contour], base_color)
    
    # Add subtle leaf texture (noise)
    noise = np.random.normal(0, 8, img.shape).astype(np.float32)
    img_float = img.astype(np.float32) + noise
    img = np.clip(img_float, 0, 255).astype(np.uint8)
    
    # Draw leaf veins (lighter green)
    vein_color = (
        min(255, base_color[0] + 40),
        min(255, base_color[1] + 50),
        min(255, base_color[2] + 40)
    )
    
    # Main veins radiating to lobe tips
    for k in range(5):
        angle = k * (2 * np.pi / 5)
        tip_x = int(center[0] + 110 * np.cos(angle))
        tip_y = int(center[1] + 110 * np.sin(angle))
        cv2.line(img, center, (tip_x, tip_y), vein_color, 2, cv2.LINE_AA)
        
        # Secondary side veins
        for t in np.linspace(0.3, 0.8, 4):
            mid_x = int(center[0] + 110 * t * np.cos(angle))
            mid_y = int(center[1] + 110 * t * np.sin(angle))
            
            sub_angle1 = angle + 0.5
            sub_angle2 = angle - 0.5
            cv2.line(img, (mid_x, mid_y), (int(mid_x + 25 * np.cos(sub_angle1)), int(mid_y + 25 * np.sin(sub_angle1))), vein_color, 1, cv2.LINE_AA)
            cv2.line(img, (mid_x, mid_y), (int(mid_x + 25 * np.cos(sub_angle2)), int(mid_y + 25 * np.sin(sub_angle2))), vein_color, 1, cv2.LINE_AA)

    # Petiole stem
    cv2.line(img, center, (150, 280), vein_color, 4, cv2.LINE_AA)
    return img

def apply_disease_patterns(img, disease_name):
    """
    Applies realistic visual symptoms onto the bitter gourd leaf lamina depending on disease type.
    """
    h, w, _ = img.shape
    
    if disease_name == 'Healthy':
        return img
    
    elif disease_name == 'Alternaria Blight':
        # Concentric brownish circular spots with yellow halos
        num_spots = random.randint(6, 12)
        for _ in range(num_spots):
            cx = random.randint(80, w - 80)
            cy = random.randint(80, h - 80)
            r = random.randint(10, 22)
            
            # Yellow Halo
            cv2.circle(img, (cx, cy), r + 6, (30, 210, 220), -1) # Yellowish (BGR)
            # Dark Concentric Rings
            cv2.circle(img, (cx, cy), r, (15, 35, 75), -1)      # Dark brown
            cv2.circle(img, (cx, cy), int(r * 0.6), (10, 20, 45), -1)
            cv2.circle(img, (cx, cy), int(r * 0.3), (25, 45, 95), -1)
            
    elif disease_name == 'Powdery Mildew':
        # White talcum-powder patches scattered across leaf surface
        num_patches = random.randint(15, 30)
        for _ in range(num_patches):
            cx = random.randint(70, w - 70)
            cy = random.randint(70, h - 70)
            rx = random.randint(8, 25)
            ry = random.randint(8, 25)
            # Soft powdery white overlay
            overlay = img.copy()
            cv2.ellipse(overlay, (cx, cy), (rx, ry), random.randint(0, 180), 0, 360, (230, 235, 230), -1)
            alpha = random.uniform(0.5, 0.8)
            cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
            
    elif disease_name == 'Downy Mildew':
        # Angular yellow chlorotic patches bounded by veins
        num_patches = random.randint(8, 16)
        for _ in range(num_patches):
            cx = random.randint(70, w - 70)
            cy = random.randint(70, h - 70)
            w_box = random.randint(15, 30)
            h_box = random.randint(15, 30)
            
            pts = np.array([
                [cx, cy],
                [cx + w_box, cy + random.randint(-5, 5)],
                [cx + w_box + random.randint(-5, 5), cy + h_box],
                [cx + random.randint(-5, 5), cy + h_box]
            ], dtype=np.int32)
            
            # Bright yellow angular patches with brownish centers
            cv2.fillPoly(img, [pts], (20, 200, 220)) # Yellow
            cv2.polylines(img, [pts], True, (10, 80, 120), 2)
            
    elif disease_name == 'Anthracnose':
        # Water-soaked dark reddish-brown lesions with shot-hole centers
        num_spots = random.randint(8, 15)
        for _ in range(num_spots):
            cx = random.randint(75, w - 75)
            cy = random.randint(75, h - 75)
            r = random.randint(8, 18)
            
            cv2.circle(img, (cx, cy), r, (15, 20, 110), -1) # Dark reddish brown
            cv2.circle(img, (cx, cy), int(r * 0.4), (235, 242, 235), -1) # Shot hole background
            
    return img

def generate_dataset(images_per_class=30):
    """
    Generates synthetic training dataset and sample test images for ASPIDA.
    """
    print("🌿 Generating Bitter Gourd Leaf Dataset...")
    for cls in CLASSES:
        cls_dir = os.path.join(DATASET_FOLDER, cls)
        os.makedirs(cls_dir, exist_ok=True)
        
        # Generate training/test set images
        for i in range(images_per_class):
            base_img = draw_bitter_gourd_base_leaf()
            leaf_img = apply_disease_patterns(base_img, cls)
            filename = f"leaf_{i+1:03d}.jpg"
            cv2.imwrite(os.path.join(cls_dir, filename), leaf_img)
            
        # Generate 1 high quality sample image in SAMPLE_FOLDER
        sample_img = draw_bitter_gourd_base_leaf()
        sample_img = apply_disease_patterns(sample_img, cls)
        sample_name = f"sample_{cls.lower().replace(' ', '_')}.jpg"
        cv2.imwrite(os.path.join(SAMPLE_FOLDER, sample_name), sample_img)
        print(f"  ✓ {cls}: Created {images_per_class} dataset images & sample image ({sample_name})")

if __name__ == '__main__':
    generate_dataset()
