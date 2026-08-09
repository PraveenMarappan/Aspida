CREATE TABLE IF NOT EXISTS diseases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    scientific_name TEXT,
    category TEXT DEFAULT 'Bitter Gourd Disease',
    description TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    causes TEXT NOT NULL,
    prevention TEXT NOT NULL,
    management TEXT NOT NULL,
    severity_level TEXT DEFAULT 'Moderate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_name TEXT NOT NULL,
    original_filename TEXT,
    image_path TEXT NOT NULL,
    prediction TEXT NOT NULL,
    confidence REAL NOT NULL,
    severity TEXT NOT NULL,
    features_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
