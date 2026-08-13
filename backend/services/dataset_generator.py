import os
import sys
import shutil

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from config import DATASET_FOLDER, SAMPLE_FOLDER

CLASSES = ['Alternaria Blight', 'Anthracnose', 'Downy Mildew', 'Healthy', 'Powdery Mildew']

def generate_dataset(images_per_class=30):
    """
    Populates sample folder with genuine bitter gourd leaf images from raw dataset.
    Prevents synthetic image generation.
    """
    print("🌿 Ensuring Real Bitter Gourd Leaf Sample Dataset...")
    os.makedirs(SAMPLE_FOLDER, exist_ok=True)
    raw_dir = os.path.join(DATASET_FOLDER, 'raw')
    
    for cls in CLASSES:
        cls_raw_dir = os.path.join(raw_dir, cls)
        if not os.path.exists(cls_raw_dir):
            cls_raw_dir = os.path.join(DATASET_FOLDER, cls)
            
        sample_name = f"sample_{cls.lower().replace(' ', '_')}.jpg"
        sample_path = os.path.join(SAMPLE_FOLDER, sample_name)
        
        if os.path.exists(cls_raw_dir):
            files = [f for f in os.listdir(cls_raw_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
            if files:
                src = os.path.join(cls_raw_dir, files[0])
                shutil.copy2(src, sample_path)
                print(f"  ✓ {cls}: Set real sample image -> {sample_name}")

if __name__ == '__main__':
    generate_dataset()

