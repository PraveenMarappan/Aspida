import cv2
import numpy as np

def load_and_preprocess_image(image_path_or_bytes, target_size=(224, 224)):
    """
    Loads an image from file path or byte array, resizes to target_size,
    applies Gaussian blur for noise reduction, and converts to RGB, HSV, HSI.
    """
    if isinstance(image_path_or_bytes, str):
        bgr = cv2.imread(image_path_or_bytes)
        if bgr is None:
            raise ValueError(f"Could not load image from path: {image_path_or_bytes}")
    elif isinstance(image_path_or_bytes, bytes):
        nparr = np.frombuffer(image_path_or_bytes, np.uint8)
        bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("Could not decode image bytes.")
    else:
        # Assuming numpy array (BGR)
        bgr = image_path_or_bytes

    # 1. Resize image to standard resolution
    bgr_resized = cv2.resize(bgr, target_size, interpolation=cv2.INTER_AREA)

    # 2. Gaussian Blur for noise reduction
    bgr_blurred = cv2.GaussianBlur(bgr_resized, (5, 5), 0)

    # 3. Colour space conversions
    rgb = cv2.cvtColor(bgr_blurred, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(bgr_blurred, cv2.COLOR_BGR2HSV)
    hsi = bgr_to_hsi(bgr_blurred)

    return {
        'bgr': bgr_resized,
        'rgb': rgb,
        'hsv': hsv,
        'hsi': hsi
    }

def bgr_to_hsi(bgr_img):
    """
    Converts BGR image to HSI (Hue, Saturation, Intensity) color space
    using standard RGB to HSI mathematical conversion formulas.
    """
    img_float = bgr_img.astype(np.float32) / 255.0
    b = img_float[:, :, 0]
    g = img_float[:, :, 1]
    r = img_float[:, :, 2]

    # Intensity = (R + G + B) / 3
    intensity = (r + g + b) / 3.0

    # Saturation = 1 - (3 / (R + G + B + eps)) * min(R, G, B)
    min_rgb = np.minimum(np.minimum(r, g), b)
    sum_rgb = r + g + b
    sum_rgb[sum_rgb == 0] = 1e-6  # Prevent division by zero
    saturation = 1.0 - (3.0 / sum_rgb) * min_rgb

    # Hue calculation
    num = 0.5 * ((r - g) + (r - b))
    den = np.sqrt((r - g) ** 2 + (r - b) * (g - b)) + 1e-6
    theta = np.arccos(np.clip(num / den, -1.0, 1.0))

    hue = np.copy(theta)
    hue[b > g] = 2 * np.pi - hue[b > g]
    hue = hue / (2 * np.pi)  # Normalize to [0, 1]

    hsi = np.zeros_like(bgr_img, dtype=np.float32)
    hsi[:, :, 0] = hue * 255.0
    hsi[:, :, 1] = saturation * 255.0
    hsi[:, :, 2] = intensity * 255.0

    return hsi.astype(np.uint8)
