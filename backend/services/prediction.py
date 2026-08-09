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

    print(f"[ASPIDA] Image received: {original_filename}")
    print(f"[ASPIDA] Image saved: {saved_filepath}")

    # Preprocess & extract features
    preprocessed = load_and_preprocess_image(saved_filepath)
    feat_vec, feat_dict = extract_features(preprocessed)

    # Feature vector validation
    expected_features = getattr(scaler, 'n_features_in_', len(feat_vec))
    actual_features = len(feat_vec)
    print(f"[ASPIDA] Feature count: {actual_features}")
    print(f"[ASPIDA] Expected feature count: {expected_features}")

    if actual_features != expected_features:
        raise ValueError(f"Feature count mismatch: expected {expected_features}, got {actual_features}")

    # Scale features
    feat_scaled = scaler.transform(feat_vec.reshape(1, -1))

    # ML Inference
    predicted_class = model.predict(feat_scaled)[0]
    model_classes = list(getattr(model, 'classes_', []))
    print(f"[ASPIDA] Model classes: {model_classes}")
    print(f"[ASPIDA] Prediction: {predicted_class}")
    
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(feat_scaled)[0]
        class_index = model_classes.index(predicted_class)
        raw_probability = float(probabilities[class_index])
        confidence = float(raw_probability * 100.0)
        print(f"[ASPIDA] Original model probability: {raw_probability:.4f}")
        print(f"[ASPIDA] Display confidence: {confidence:.1f}%")
    else:
        raise RuntimeError("Loaded ML model does not support probability estimation (predict_proba).")

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
    print(f"[ASPIDA] History record created: ID {detection_id}")

    image_url = f"http://127.0.0.1:5000/api/images/{unique_filename}"

    return {
        'id': detection_id,
        'success': True,
        'imageName': unique_filename,
        'image_filename': unique_filename,
        'originalFilename': original_filename,
        'imageUrl': image_url,
        'image_url': image_url,
        'prediction': predicted_class,
        'confidence': round(confidence, 1),
        'raw_probability': round(raw_probability, 4),
        'severity': severity,
        'features': feat_dict,
        'diseaseInfo': disease_info
    }

