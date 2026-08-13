import os
import sys
import json

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import cv2
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Adjust path to import backend services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config import DATASET_FOLDER, MODEL_PATH, SCALER_PATH, METRICS_PATH
from services.preprocessing import load_and_preprocess_image
from services.feature_extraction import extract_features, FEATURE_NAMES

CLASSES = ['Alternaria Blight', 'Anthracnose', 'Downy Mildew', 'Healthy', 'Powdery Mildew']

def augment_image(bgr_img):
    """
    Light geometric & brightness augmentations applied ONLY on TRAIN set images.
    """
    augmented = []
    # 1. Horizontal Flip
    h_flip = cv2.flip(bgr_img, 1)
    augmented.append(h_flip)
    
    # 2. Slight Rotations (-15, +15 deg)
    h, w = bgr_img.shape[:2]
    center = (w // 2, h // 2)
    for angle in [-15, 15]:
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rot = cv2.warpAffine(bgr_img, M, (w, h), borderMode=cv2.BORDER_REFLECT)
        augmented.append(rot)
        
    # 3. Brightness adjustments (+15%, -15%)
    bright_up = np.clip(bgr_img.astype(np.int16) + 30, 0, 255).astype(np.uint8)
    bright_down = np.clip(bgr_img.astype(np.int16) - 30, 0, 255).astype(np.uint8)
    augmented.extend([bright_up, bright_down])
    
    return augmented

def load_dataset_split(split_name, augment_minority=False):
    split_dir = os.path.join(DATASET_FOLDER, split_name)
    X, y = [], []
    print(f"🔬 Processing {split_name.upper()} split from: {split_dir}")
    
    for class_name in CLASSES:
        class_dir = os.path.join(split_dir, class_name)
        if not os.path.isdir(class_dir):
            continue
            
        files = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        print(f"  → Class '{class_name}': {len(files)} real images")
        
        for fname in files:
            img_path = os.path.join(class_dir, fname)
            try:
                preprocessed = load_and_preprocess_image(img_path)
                feat_vec, _ = extract_features(preprocessed)
                X.append(feat_vec)
                y.append(class_name)
                
                # Apply train-only augmentation for minority classes (< 50 images in train)
                if augment_minority and len(files) < 50:
                    bgr_orig = preprocessed['bgr']
                    aug_images = augment_image(bgr_orig)
                    for aug_bgr in aug_images:
                        aug_pre = load_and_preprocess_image(aug_bgr)
                        aug_feat, _ = extract_features(aug_pre)
                        X.append(aug_feat)
                        y.append(class_name)
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
                
    return np.array(X, dtype=np.float32), np.array(y)

def train_and_evaluate():
    print("🤖 Starting ASPIDA ML Model Training & Evaluation Pipeline...")
    
    # 1. Load Train, Validation, and Test sets
    X_train, y_train = load_dataset_split('train', augment_minority=True)
    X_val, y_val = load_dataset_split('validation', augment_minority=False)
    X_test, y_test = load_dataset_split('test', augment_minority=False)
    
    print(f"\n✅ Extracted Samples Summary:")
    print(f"   Train samples (with minority train-only aug): {len(y_train)}")
    print(f"   Validation samples (100% real): {len(y_val)}")
    print(f"   Test samples (100% real): {len(y_test)}")
    
    # 2. Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # 3. Define ML Classifiers
    classifiers = {
        'SVM': SVC(probability=True, C=10.0, kernel='rbf', class_weight='balanced', random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=15, class_weight='balanced', random_state=42),
        'KNN': KNeighborsClassifier(n_neighbors=3, weights='distance')
    }
    
    eval_results = {}
    best_f1 = -1.0
    best_model_name = None
    best_model_obj = None
    
    # 4. Train and Evaluate each Classifier on Validation & Test Sets
    for name, clf in classifiers.items():
        clf.fit(X_train_scaled, y_train)
        
        # Validation performance
        y_val_pred = clf.predict(X_val_scaled)
        val_acc = float(accuracy_score(y_val, y_val_pred))
        val_prec = float(precision_score(y_val, y_val_pred, average='macro', zero_division=0))
        val_rec = float(recall_score(y_val, y_val_pred, average='macro', zero_division=0))
        val_f1 = float(f1_score(y_val, y_val_pred, average='macro', zero_division=0))
        val_cm = confusion_matrix(y_val, y_val_pred, labels=CLASSES).tolist()
        
        # Test performance
        y_test_pred = clf.predict(X_test_scaled)
        test_acc = float(accuracy_score(y_test, y_test_pred))
        test_prec = float(precision_score(y_test, y_test_pred, average='macro', zero_division=0))
        test_rec = float(recall_score(y_test, y_test_pred, average='macro', zero_division=0))
        test_f1 = float(f1_score(y_test, y_test_pred, average='macro', zero_division=0))
        test_cm = confusion_matrix(y_test, y_test_pred, labels=CLASSES).tolist()
        
        # Calculate per-class metrics on test set
        per_class_metrics = {}
        for c in CLASSES:
            c_mask = (y_test == c)
            if np.sum(c_mask) > 0:
                c_acc = float(accuracy_score(y_test[c_mask], y_test_pred[c_mask]))
                c_prec = float(precision_score(y_test == c, y_test_pred == c, zero_division=0))
                c_rec = float(recall_score(y_test == c, y_test_pred == c, zero_division=0))
                c_f1 = float(f1_score(y_test == c, y_test_pred == c, zero_division=0))
            else:
                c_acc, c_prec, c_rec, c_f1 = 0.0, 0.0, 0.0, 0.0
                
            per_class_metrics[c] = {
                'accuracy': round(c_acc * 100, 2),
                'precision': round(c_prec * 100, 2),
                'recall': round(c_rec * 100, 2),
                'f1Score': round(c_f1 * 100, 2)
            }
        
        eval_results[name] = {
            'accuracy': round(val_acc * 100, 2),
            'precision': round(val_prec * 100, 2),
            'recall': round(val_rec * 100, 2),
            'f1Score': round(val_f1 * 100, 2),
            'confusionMatrix': val_cm,
            'testMetrics': {
                'accuracy': round(test_acc * 100, 2),
                'precision': round(test_prec * 100, 2),
                'recall': round(test_rec * 100, 2),
                'f1Score': round(test_f1 * 100, 2),
                'confusionMatrix': test_cm
            },
            'perClassMetrics': per_class_metrics
        }
        
        print(f"\n📊 [{name}] Validation F1: {val_f1*100:.2f}% | Test F1: {test_f1*100:.2f}% | Accuracy: {test_acc*100:.2f}%")
        
        if val_f1 > best_f1:
            best_f1 = val_f1
            best_model_name = name
            best_model_obj = clf
            
    print(f"\n🏆 Best Selected Classifier: {best_model_name} (Validation F1 Score: {best_f1*100:.2f}%)")
    
    # 5. Save best model, scaler, and evaluation metrics
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_model_obj, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    best_results = eval_results[best_model_name]
    
    metrics_data = {
        'selectedModel': best_model_name,
        'classes': CLASSES,
        'featureNames': FEATURE_NAMES,
        'algorithms': eval_results,
        'accuracy': best_results['testMetrics']['accuracy'],
        'precision': best_results['testMetrics']['precision'],
        'recall': best_results['testMetrics']['recall'],
        'f1Score': best_results['testMetrics']['f1Score'],
        'confusionMatrix': best_results['testMetrics']['confusionMatrix'],
        'perClassMetrics': best_results['perClassMetrics'],
        'datasetSize': {
            'total': len(y_train) + len(y_val) + len(y_test),
            'train': len(y_train),
            'validation': len(y_val),
            'test': len(y_test)
        }
    }
    
    with open(METRICS_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics_data, f, indent=2)
        
    print(f"💾 Model saved to: {MODEL_PATH}")
    print(f"💾 Scaler saved to: {SCALER_PATH}")
    print(f"💾 Metrics saved to: {METRICS_PATH}")
    return metrics_data

if __name__ == '__main__':
    train_and_evaluate()

