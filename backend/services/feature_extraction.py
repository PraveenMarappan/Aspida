import numpy as np
import cv2
from skimage.feature import graycomatrix, graycoprops

FEATURE_NAMES = [
    'R_mean', 'R_std',
    'G_mean', 'G_std',
    'B_mean', 'B_std',
    'H_mean', 'H_std',
    'S_mean', 'S_std',
    'V_mean', 'V_std',
    'I_mean', 'I_std',
    'glcm_contrast',
    'glcm_correlation',
    'glcm_energy',
    'glcm_homogeneity',
    'glcm_entropy'
]

def extract_features(preprocessed_dict):
    """
    Extracts numerical feature vector containing RGB, HSV, HSI stats and GLCM texture properties.
    Returns:
        features_vector: np.ndarray shape (1, 19)
        features_dict: dict of feature_name -> float value
    """
    rgb = preprocessed_dict['rgb']
    hsv = preprocessed_dict['hsv']
    hsi = preprocessed_dict['hsi']
    bgr = preprocessed_dict['bgr']

    # 1. RGB Features (Mean & Std Dev)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    r_mean, r_std = float(np.mean(r)), float(np.std(r))
    g_mean, g_std = float(np.mean(g)), float(np.std(g))
    b_mean, b_std = float(np.mean(b)), float(np.std(b))

    # 2. HSV Features (Mean & Std Dev)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    h_mean, h_std = float(np.mean(h)), float(np.std(h))
    s_mean, s_std = float(np.mean(s)), float(np.std(s))
    v_mean, v_std = float(np.mean(v)), float(np.std(v))

    # 3. HSI Features (Intensity Mean & Std Dev)
    i = hsi[:, :, 2]
    i_mean, i_std = float(np.mean(i)), float(np.std(i))

    # 4. GLCM Texture Features
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray_small = cv2.resize(gray, (128, 128), interpolation=cv2.INTER_AREA)
    
    # Calculate GLCM with distance=1 across 4 angles (0, 45, 90, 135 deg)
    glcm = graycomatrix(gray_small, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4], levels=256, symmetric=True, normed=True)

    contrast = float(np.mean(graycoprops(glcm, 'contrast')))
    correlation = float(np.mean(graycoprops(glcm, 'correlation')))
    energy = float(np.mean(graycoprops(glcm, 'energy')))
    homogeneity = float(np.mean(graycoprops(glcm, 'homogeneity')))
    
    # Calculate GLCM Entropy
    glcm_norm = glcm / (np.sum(glcm) + 1e-12)
    glcm_nz = glcm_norm[glcm_norm > 0]
    entropy = float(-np.sum(glcm_nz * np.log2(glcm_nz)))

    features_dict = {
        'R_mean': r_mean, 'R_std': r_std,
        'G_mean': g_mean, 'G_std': g_std,
        'B_mean': b_mean, 'B_std': b_std,
        'H_mean': h_mean, 'H_std': h_std,
        'S_mean': s_mean, 'S_std': s_mean,
        'V_mean': v_mean, 'V_std': v_std,
        'I_mean': i_mean, 'I_std': i_std,
        'glcm_contrast': contrast,
        'glcm_correlation': correlation,
        'glcm_energy': energy,
        'glcm_homogeneity': homogeneity,
        'glcm_entropy': entropy
    }

    feature_vector = np.array([features_dict[name] for name in FEATURE_NAMES], dtype=np.float32)

    return feature_vector, features_dict
