import sqlite3
import os
import json
from config import DATABASE_PATH, BASE_DIR

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    schema_path = os.path.join(BASE_DIR, 'database', 'schema.sql')
    conn = get_db_connection()
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()
    seed_diseases(conn)
    conn.close()

def seed_diseases(conn):
    cursor = conn.cursor()
    
    disease_records = [
        (
            "Healthy",
            "Momordica charantia (Normal)",
            "Normal Leaf",
            "The bitter gourd leaf exhibits vibrant green pigmentation, uniform surface texture, intact margins, and clear vein architecture without discoloration or necrotic lesions.",
            "• Uniform dark green pigmentation\n• Intact leaf margins and sharp lobes\n• Smooth, healthy cuticle\n• Vigorous leaf venation",
            "Optimal growing conditions, balanced nutrients, proper irrigation, and pest management.",
            "• Continue regular visual inspections\n• Maintain balanced N-P-K fertigation\n• Ensure adequate sunlight and air circulation\n• Practice crop rotation and weed control",
            "• Routine monitoring twice weekly\n• Mulch around plant base to preserve soil moisture\n• Inspect underside of leaves for early aphid/mite activity",
            "Low"
        ),
        (
            "Alternaria Blight",
            "Alternaria cucumerina",
            "Fungal Infection",
            "Alternaria Leaf Blight is a destructive fungal disease affecting bitter gourd crops. It causes concentric brownish circular spots on older leaves first, gradually coalescing into target-board necrotic lesions.",
            "• Small circular brown spots with concentric ring pattern\n• Yellow chlorotic halos surrounding lesions\n• premature leaf wilting and defoliation\n• Sunscald on fruit due to canopy loss",
            "Fungal spores (Alternaria cucumerina) spread via wind-blown rain, splashing irrigation water, and humid leaves (>85% RH).",
            "• Remove and destroy infected leaves immediately\n• Avoid overhead sprinkler irrigation; use drip system\n• Maintain wide vine spacing for optimal canopy aeration\n• Apply preventative copper-based or Mancozeb fungicides",
            "• Prune lower infected foliage\n• Spray recommended fungicide (e.g. Chlorothalonil or Azoxystrobin) at 10-14 day intervals\n• Clear plant debris post-harvest to reduce spore survival",
            "High"
        ),
        (
            "Powdery Mildew",
            "Podosphaera xanthii / Erysiphe cichoracearum",
            "Fungal Infection",
            "Powdery Mildew appears as talcum powder-like white fungal spots on the upper and lower surfaces of bitter gourd leaves, stems, and petioles, leading to premature senescence.",
            "• White to grayish powdery fungal patches on leaf surfaces\n• Chlorosis (yellowing) beneath infected areas\n• Brittle, distorted, and dry leaf edges\n• Reduced photosynthesis leading to stunted fruit growth",
            "High humidity accompanied by dry leaf surfaces and warm temperatures (20°C–28°C) favor rapid sporulation and airborne transmission.",
            "• Plant mildew-resistant cucurbit varieties\n• Ensure full sunlight exposure and open trellis structure\n• Apply neem oil or potassium bicarbonate early upon detection\n• Avoid excessive nitrogen fertilizers that stimulate tender foliage",
            "• Spray bio-fungicide (Bacillus subtilis) or sulfur-based sprays\n• Remove severely encrusted leaves to reduce inocula\n• Ensure canopy air exchange to drop microclimate humidity",
            "Moderate"
        ),
        (
            "Downy Mildew",
            "Pseudoperonospora cubensis",
            "Oomycete / Water Mold",
            "Downy Mildew causes angular chlorotic yellow lesions bounded by leaf veins on the upper surface, while a purplish-gray velvety downy spore growth develops on the lower leaf surface under humid conditions.",
            "• Bright yellow, angular lesions sharply restricted by leaf veins\n• Purplish-gray fuzzy/downy growth on leaf undersides\n• Rapid leaf scorching and browning under wet conditions\n• Severe canopy collapse within days if untreated",
            "Pseudoperonospora cubensis water mold thrives in cooler humid nights and warm wet days with high dew formation.",
            "• Avoid morning leaf wetness and overhead watering\n• Orient rows to maximize morning sun and wind drainage\n• Apply protective contact fungicides (Metalaxyl, Cymoxanil, or Mancozeb) before wet spells",
            "• Remove early infected leaves immediately\n• Systemic fungicide application (Fosetyl-Al or Dimethomorph)\n• Destroy infected crop residue promptly after harvest",
            "Severe"
        ),
        (
            "Anthracnose",
            "Colletotrichum orbiculare",
            "Fungal Infection",
            "Anthracnose causes water-soaked spots that rapidly turn dark brown or black on bitter gourd leaves. Lesions can dry up and drop out, giving the leaf a 'shot-hole' appearance.",
            "• Circular water-soaked lesions expanding into reddish-brown spots\n• Central necrosis leading to shot-hole perforations in leaves\n• Sunken black lesions on stems and developing gourds\n• Pinkish spore masses emerging in moist humid weather",
            "Colletotrichum fungal spores are transmitted through infected seeds, rain splash, contaminated field tools, and wet foliage.",
            "• Use certified disease-free seeds\n• Practice a minimum 2-year crop rotation with non-cucurbit crops\n• Disinfect farm tools and stakes regularly\n• Keep canopy dry with drip lines",
            "• Apply systemic fungicides like Carbendazim or Copper Oxychloride\n• Destroy severely infected plants\n• Deep plow soil post-harvest to bury fungal sclerotia",
            "High"
        )
    ]
    
    for row in disease_records:
        cursor.execute("""
            INSERT INTO diseases (name, scientific_name, category, description, symptoms, causes, prevention, management, severity_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
                scientific_name=excluded.scientific_name,
                category=excluded.category,
                description=excluded.description,
                symptoms=excluded.symptoms,
                causes=excluded.causes,
                prevention=excluded.prevention,
                management=excluded.management,
                severity_level=excluded.severity_level
        """, row)
    
    conn.commit()

def save_detection(image_name, original_filename, image_path, prediction, confidence, severity, features_dict=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    features_json = json.dumps(features_dict) if features_dict else "{}"
    cursor.execute("""
        INSERT INTO detections (image_name, original_filename, image_path, prediction, confidence, severity, features_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (image_name, original_filename, image_path, prediction, float(confidence), severity, features_json))
    detection_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return detection_id


def get_detection_by_id(detection_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM detections WHERE id = ?", (detection_id,)).fetchone()
    conn.close()
    if row:
        d = dict(row)
        if d.get('features_json'):
            try:
                d['features'] = json.loads(d['features_json'])
            except Exception:
                d['features'] = {}
        else:
            d['features'] = {}
        return d
    return None

def get_all_detections(limit=100, disease_filter=None, search=None):
    conn = get_db_connection()
    query = "SELECT * FROM detections WHERE 1=1"
    params = []
    
    if disease_filter and disease_filter != 'All':
        query += " AND prediction = ?"
        params.append(disease_filter)
        
    if search:
        query += " AND (original_filename LIKE ? OR prediction LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        if d.get('features_json'):
            try:
                d['features'] = json.loads(d['features_json'])
            except Exception:
                d['features'] = {}
        else:
            d['features'] = {}
        results.append(d)
        
    return results


def get_all_diseases():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM diseases ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_disease_by_name(name):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM diseases WHERE name = ?", (name,)).fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_dashboard_stats():
    conn = get_db_connection()
    total_scans = conn.execute("SELECT COUNT(*) FROM detections").fetchone()[0]
    healthy_scans = conn.execute("SELECT COUNT(*) FROM detections WHERE prediction = 'Healthy'").fetchone()[0]
    diseased_scans = total_scans - healthy_scans
    
    # Disease breakdown
    rows = conn.execute("""
        SELECT prediction, COUNT(*) as count 
        FROM detections 
        GROUP BY prediction 
        ORDER BY count DESC
    """).fetchall()
    
    distribution = [{'disease': r['prediction'], 'count': r['count']} for r in rows]
    
    # Recent scans
    recent_rows = conn.execute("SELECT * FROM detections ORDER BY created_at DESC LIMIT 5").fetchall()
    recent_scans = [dict(r) for r in recent_rows]
    
    conn.close()
    return {
        'totalScans': total_scans,
        'healthyCount': healthy_scans,
        'diseasedCount': diseased_scans,
        'healthyRate': round((healthy_scans / total_scans * 100), 1) if total_scans > 0 else 100.0,
        'distribution': distribution,
        'recentScans': recent_scans
    }
