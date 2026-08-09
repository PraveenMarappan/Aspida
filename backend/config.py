import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
REPORT_FOLDER = os.path.join(BASE_DIR, 'reports')
SAMPLE_FOLDER = os.path.join(BASE_DIR, 'samples')
DATASET_FOLDER = os.path.join(BASE_DIR, 'dataset')
MODEL_FOLDER = os.path.join(BASE_DIR, 'model')
DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'aspida.db')

MODEL_PATH = os.path.join(MODEL_FOLDER, 'disease_model.pkl')
SCALER_PATH = os.path.join(MODEL_FOLDER, 'scaler.pkl')
METRICS_PATH = os.path.join(MODEL_FOLDER, 'metrics.json')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limit

# Ensure required directories exist
for path in [UPLOAD_FOLDER, REPORT_FOLDER, SAMPLE_FOLDER, DATASET_FOLDER, MODEL_FOLDER, os.path.dirname(DATABASE_PATH)]:
    os.makedirs(path, exist_ok=True)
