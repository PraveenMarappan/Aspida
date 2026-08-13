import os
import sys
import json

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import UPLOAD_FOLDER, SAMPLE_FOLDER, REPORT_FOLDER, METRICS_PATH, MODEL_PATH, SCALER_PATH, ALLOWED_EXTENSIONS, MAX_CONTENT_LENGTH
from database.database import init_db, get_all_diseases, get_disease_by_name, get_all_detections, get_detection_by_id, get_dashboard_stats
from services.prediction import predict_leaf_disease, get_model_and_scaler
from services.report_generator import generate_pdf_report
from services.dataset_generator import generate_dataset

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize database and check model upon server startup
with app.app_context():
    init_db()
    # Ensure sample images exist
    if not os.path.exists(SAMPLE_FOLDER) or not os.listdir(SAMPLE_FOLDER):
        try:
            generate_dataset(images_per_class=30)
        except Exception as e:
            app.logger.warning(f"Sample dataset generation warning: {e}")
    # Ensure ML model is trained
    try:
        get_model_and_scaler()
    except Exception as e:
        app.logger.warning(f"Initial model check warning: {e}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'ASPIDA API is running',
        'status': 'ok'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    model_exists = os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH)
    return jsonify({
        'status': 'ok',
        'service': 'ASPIDA',
        'model_loaded': model_exists
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Check if sample image requested
        sample_name = request.form.get('sampleName')
        if sample_name:
            sample_path = os.path.join(SAMPLE_FOLDER, sample_name)
            if not os.path.exists(sample_path):
                return jsonify({'success': False, 'error': f"Sample image {sample_name} not found."}), 404
            
            result = predict_leaf_disease(sample_path, original_filename=sample_name)
            return jsonify(result)

        # Otherwise expect uploaded file
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided in request.'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected for upload.'}), 400

        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.'}), 400

        original_name = secure_filename(file.filename)
        img_bytes = file.read()
        
        result = predict_leaf_disease(img_bytes, original_filename=original_name)
        return jsonify(result)

    except Exception as e:
        app.logger.error(f"Prediction Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/diseases', methods=['GET'])
def list_diseases():
    diseases = get_all_diseases()
    return jsonify(diseases)

@app.route('/api/diseases/<name>', methods=['GET'])
def disease_detail(name):
    disease = get_disease_by_name(name)
    if not disease:
        return jsonify({'error': 'Disease not found'}), 404
    return jsonify(disease)

@app.route('/api/history', methods=['GET'])
def list_history():
    disease_filter = request.args.get('disease')
    search = request.args.get('search')
    history = get_all_detections(limit=100, disease_filter=disease_filter, search=search)
    return jsonify(history)

@app.route('/api/history/<int:detection_id>', methods=['GET'])
def history_detail(detection_id):
    detection = get_detection_by_id(detection_id)
    if not detection:
        return jsonify({'error': 'Detection record not found'}), 404
    
    disease_info = get_disease_by_name(detection['prediction'])
    detection['diseaseInfo'] = disease_info
    return jsonify(detection)

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    stats = get_dashboard_stats()
    return jsonify(stats)

@app.route('/api/metrics', methods=['GET'])
def metrics():
    if not os.path.exists(METRICS_PATH):
        return jsonify({'error': 'Metrics file not found.'}), 404
    with open(METRICS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/api/samples', methods=['GET'])
def list_samples():
    if not os.path.exists(SAMPLE_FOLDER):
        return jsonify([])
    files = [f for f in os.listdir(SAMPLE_FOLDER) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    sample_list = []
    for f in files:
        # derive friendly name
        clean_name = f.replace('sample_', '').replace('.jpg', '').replace('_', ' ').title()
        sample_list.append({
            'filename': f,
            'name': clean_name,
            'url': f"/api/samples/{f}"
        })
    return jsonify(sample_list)

@app.route('/api/report/<int:detection_id>', methods=['GET'])
def download_report(detection_id):
    try:
        pdf_path = generate_pdf_report(detection_id)
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=os.path.basename(pdf_path)
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<path:filename>')
def serve_image(filename):
    clean_fn = os.path.basename(filename)
    upload_path = os.path.join(UPLOAD_FOLDER, clean_fn)
    if os.path.exists(upload_path):
        return send_from_directory(UPLOAD_FOLDER, clean_fn)
    
    sample_path = os.path.join(SAMPLE_FOLDER, clean_fn)
    if os.path.exists(sample_path):
        return send_from_directory(SAMPLE_FOLDER, clean_fn)
        
    return jsonify({'error': f'Image {filename} not found.'}), 404

@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/samples/<path:filename>')
def serve_sample(filename):
    return send_from_directory(SAMPLE_FOLDER, filename)

if __name__ == '__main__':
    print("🚀 Starting ASPIDA Flask API Server on http://127.0.0.1:5000...")
    app.run(host='127.0.0.1', port=5000, debug=True)

