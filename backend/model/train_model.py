import os
import sys
import json

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import joblib
import numpy as np
from sklearn.model_selection import train_test_split
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
from services.dataset_generator import generate_dataset, CLASSES

def train_and_evaluate():
    print("🤖 Starting ASPIDA ML Model Training & Evaluation Pipeline...")
    
    # 1. Ensure dataset exists
    if not os.path.exists(DATASET_FOLDER) or not os.listdir(DATASET_FOLDER):
        print("Dataset directory empty. Generating synthetic Bitter Gourd leaf dataset...")
        generate_dataset(images_per_class=35)
        
    X_data = []
    y_data = []
    
    # 2. Extract features from dataset
    print("🔬 Processing images and extracting RGB + HSV + HSI + GLCM features...")
    for class_index, class_name in enumerate(CLASSES):
        class_dir = os.path.join(DATASET_FOLDER, class_name)
        if not os.path.isdir(class_dir):
            continue
            
        files = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        print(f"  → Class '{class_name}': {len(files)} images")
        
        for fname in files:
            img_path = os.path.join(class_dir, fname)
            try:
                preprocessed = load_and_preprocess_image(img_path)
                feat_vec, _ = extract_features(preprocessed)
                X_data.append(feat_vec)
                y_data.append(class_name)
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
                
    X = np.array(X_data)
    y = np.array(y_data)
    print(f"✅ Total extracted samples: {X.shape[0]} images, {X.shape[1]} features per sample")
    
    # 3. Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # 4. Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 5. Define ML Models
    classifiers = {
        'SVM': SVC(probability=True, C=10.0, kernel='rbf', random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42),
        'KNN': KNeighborsClassifier(n_neighbors=5)
    }
    
    eval_results = {}
    best_f1 = -1.0
    best_model_name = None
    best_model_obj = None
    
    # 6. Train and evaluate each classifier
    for name, clf in classifiers.items():
        clf.fit(X_train_scaled, y_train)
        y_pred = clf.predict(X_test_scaled)
        
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average='macro', zero_division=0))
        rec = float(recall_score(y_test, y_pred, average='macro', zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average='macro', zero_division=0))
        cm = confusion_matrix(y_test, y_pred, labels=CLASSES).tolist()
        
        eval_results[name] = {
            'accuracy': round(acc * 100, 2),
            'precision': round(prec * 100, 2),
            'recall': round(rec * 100, 2),
            'f1Score': round(f1 * 100, 2),
            'confusionMatrix': cm
        }
        
        print(f"📊 [{name}] Accuracy: {acc*100:.2f}% | Precision: {prec*100:.2f}% | Recall: {rec*100:.2f}% | F1: {f1*100:.2f}%")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf
            
    print(f"\n🏆 Best Selected Classifier: {best_model_name} (F1 Score: {best_f1*100:.2f}%)")
    
    # 7. Save best model, scaler, and evaluation metrics
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_model_obj, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    metrics_data = {
        'selectedModel': best_model_name,
        'classes': CLASSES,
        'featureNames': FEATURE_NAMES,
        'algorithms': eval_results,
        'datasetSize': {
            'total': len(y),
            'train': len(y_train),
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
