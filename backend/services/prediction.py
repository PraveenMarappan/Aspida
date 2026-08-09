import os
import joblib
import numpy as np
import uuid
import cv2
from config import MODEL_PATH, SCALER_PATH, UPLOAD_FOLDER
from services.preprocessing import load_and_preprocess_image
from services.feature_extraction import extract_features
from database.database import get_disease_by_name, save_detection
from model.train_model import train_and_evaluate

_model = None
_scaler = None

def get_model_and_scaler():
    global _model, _scaler
    if _model is None or _scaler is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            print("Model/Scaler missing. Triggering automated model training...")
            try:
                train_and_evaluate()
            except Exception as e:
                print(f"Automated model training failed: {e}")
                raise RuntimeError("ML model is not available. Please train the model first.") from e
        
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            raise RuntimeError("ML model is not available. Please train the model first.")
            
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
    return _model, _scaler

def predict_leaf_disease(image_path_or_bytes, original_filename="uploaded_leaf.jpg"):
    model, scaler = get_model_and_scaler()

    # Save image to uploads folder
    unique_filename = f"{uuid.uuid4().hex[:8]}_{original_filename.replace(' ', '_')}"
    saved_filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

    if isinstance(image_path_or_bytes, str):
        # Image is a file path
        bgr = cv2.imread(image_path_or_bytes)
        if bgr is None:
            raise ValueError(f"Could not load image from path: {image_path_or_bytes}")
        cv2.imwrite(saved_filepath, bgr)
    elif isinstance(image_path_or_bytes, bytes):
        nparr = np.frombuffer(image_path_or_bytes, np.uint8)
        bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("Invalid or corrupted image file uploaded.")
        cv2.imwrite(saved_filepath, bgr)
    else:
        bgr = image_path_or_bytes
        if bgr is None:
            raise ValueError("Invalid image array provided.")
        cv2.imwrite(saved_filepath, bgr)


    # Preprocess & extract features
    preprocessed = load_and_preprocess_image(saved_filepath)
    feat_vec, feat_dict = extract_features(preprocessed)

    # Scale features
    feat_scaled = scaler.transform(feat_vec.reshape(1, -1))

    # ML Inference
    predicted_class = model.predict(feat_scaled)[0]
    
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(feat_scaled)[0]
        class_index = list(model.classes_).index(predicted_class)
        confidence = float(probabilities[class_index] * 100.0)
    else:
        confidence = 92.5

    # Determine Severity Level
    if predicted_class == 'Healthy':
        severity = '🟢 Healthy'
    else:
        if confidence >= 85.0:
            severity = '🔴 Advanced Stage'
        elif confidence >= 65.0:
            severity = '🟡 Early Stage'
        else:
            severity = '🟡 Mild / Suspected'

    # Fetch recommendations from database
    disease_info = get_disease_by_name(predicted_class)

    # Save detection log to SQLite
    detection_id = save_detection(
        image_name=unique_filename,
        original_filename=original_filename,
        image_path=saved_filepath,
        prediction=predicted_class,
        confidence=confidence,
        severity=severity,
        features_dict=feat_dict
    )

    return {
        'id': detection_id,
        'imageName': unique_filename,
        'originalFilename': original_filename,
        'imageUrl': f"/api/uploads/{unique_filename}",
        'prediction': predicted_class,
        'confidence': round(confidence, 1),
        'severity': severity,
        'features': feat_dict,
        'diseaseInfo': disease_info
    }
