import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from config import REPORT_FOLDER
from database.database import get_detection_by_id, get_disease_by_name

def generate_pdf_report(detection_id):
    """
    Generates a PDF diagnostic report using ReportLab for a given detection ID.
    Returns the absolute filepath to the generated PDF.
    """
    detection = get_detection_by_id(detection_id)
    if not detection:
        raise ValueError(f"Detection with ID {detection_id} not found.")

    disease_info = get_disease_by_name(detection['prediction'])

    pdf_filename = f"ASPIDA_Report_{detection_id:04d}_{detection['prediction'].replace(' ', '_')}.pdf"
    pdf_path = os.path.join(REPORT_FOLDER, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=colors.HexColor('#15803d'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        textColor=colors.HexColor('#4b5563'),
        spaceAfter=15
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor('#166534'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1f2937')
    )

    elements = []

    # Header
    elements.append(Paragraph("🌿 ASPIDA — Bitter Gourd Leaf Disease Analysis Report", title_style))
    elements.append(Paragraph("Machine Learning Based Agricultural Decision Support System", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#22c55e'), spaceAfter=15))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Report ID:</b>", body_style), Paragraph(f"#ASPIDA-{detection['id']:04d}", body_style),
         Paragraph("<b>Date & Time:</b>", body_style), Paragraph(str(detection['created_at']), body_style)],
        [Paragraph("<b>Image File:</b>", body_style), Paragraph(str(detection['original_filename']), body_style),
         Paragraph("<b>System Model:</b>", body_style), Paragraph("RGB+HSV+HSI+GLCM SVM/RF", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[80, 180, 80, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#bbf7d0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 15))

    # Results Table & Leaf Image
    image_path = detection['image_path']
    img_element = None
    if os.path.exists(image_path):
        img_element = RLImage(image_path, width=160, height=160)

    status_color = "#16a34a" if detection['prediction'] == 'Healthy' else "#dc2626"
    status_paragraph = Paragraph(
        f"<font color='{status_color}'><b>{detection['prediction']}</b></font>",
        ParagraphStyle('PredStatus', parent=body_style, fontSize=14, leading=16)
    )

    results_data = [
        [Paragraph("<b>Diagnostic Prediction:</b>", body_style), status_paragraph],
        [Paragraph("<b>Confidence Score:</b>", body_style), Paragraph(f"<b>{detection['confidence']:.1f}%</b>", body_style)],
        [Paragraph("<b>Severity Status:</b>", body_style), Paragraph(f"<b>{detection['severity']}</b>", body_style)],
        [Paragraph("<b>Primary Category:</b>", body_style), Paragraph(disease_info['category'] if disease_info else 'Crop Disease', body_style)],
    ]
    results_table = Table(results_data, colWidths=[140, 200])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fafafa')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))

    if img_element:
        combo_table = Table([[img_element, results_table]], colWidths=[170, 350])
        combo_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (0,0), (0,0), 'CENTER'),
        ]))
        elements.append(combo_table)
    else:
        elements.append(results_table)

    elements.append(Spacer(1, 15))

    # Feature Vector Table if available
    features = detection.get('features', {})
    if features:
        elements.append(Paragraph("Extracted Image Feature Descriptors (RGB + HSV + HSI + GLCM)", section_heading))
        feat_rows = [
            [Paragraph("<b>RGB Means:</b>", body_style), Paragraph(f"R: {features.get('R_mean',0):.2f}, G: {features.get('G_mean',0):.2f}, B: {features.get('B_mean',0):.2f}", body_style),
             Paragraph("<b>HSV Means:</b>", body_style), Paragraph(f"H: {features.get('H_mean',0):.2f}, S: {features.get('S_mean',0):.2f}, V: {features.get('V_mean',0):.2f}", body_style)],
            [Paragraph("<b>HSI Intensity:</b>", body_style), Paragraph(f"I Mean: {features.get('I_mean',0):.2f}, Std: {features.get('I_std',0):.2f}", body_style),
             Paragraph("<b>GLCM Texture:</b>", body_style), Paragraph(f"Contrast: {features.get('glcm_contrast',0):.3f}, Energy: {features.get('glcm_energy',0):.3f}, Entropy: {features.get('glcm_entropy',0):.3f}", body_style)]
        ]
        feat_table = Table(feat_rows, colWidths=[90, 170, 90, 170])
        feat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(feat_table)
        elements.append(Spacer(1, 10))

    # Disease Details & Symptoms
    if disease_info:
        elements.append(Paragraph("Description & Symptoms", section_heading))
        elements.append(Paragraph(f"<b>Overview:</b> {disease_info['description']}", body_style))
        elements.append(Spacer(1, 6))

        symptoms_formatted = disease_info['symptoms'].replace('\n', '<br/>')
        elements.append(Paragraph(f"<b>Key Visual Symptoms:</b><br/>{symptoms_formatted}", body_style))
        elements.append(Spacer(1, 12))

        # Recommendations & Action Plan
        elements.append(Paragraph("Preventive Measures & Management Recommendations", section_heading))
        prev_formatted = disease_info['prevention'].replace('\n', '<br/>')
        mgmt_formatted = disease_info['management'].replace('\n', '<br/>')

        rec_data = [
            [Paragraph("<b>Preventive Measures</b>", body_style), Paragraph("<b>Active Management Plan</b>", body_style)],
            [Paragraph(prev_formatted, body_style), Paragraph(mgmt_formatted, body_style)]
        ]
        rec_table = Table(rec_data, colWidths=[260, 260])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e0f2fe')),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(rec_table)


    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9ca3af'), spaceAfter=10))
    elements.append(Paragraph("<i>Disclaimer: ASPIDA ML diagnostic reports are generated for decision-support purposes based on digital image feature analysis. Consult a certified agricultural extension officer for severe outbreaks.</i>", ParagraphStyle('Disclaimer', parent=body_style, fontSize=8, textColor=colors.HexColor('#6b7280'))))

    doc.build(elements)
    return pdf_path
