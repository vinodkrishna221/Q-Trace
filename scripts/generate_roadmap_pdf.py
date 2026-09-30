"""
Generate executive-grade Roadmap PDF for Q-Trace project.
Integrates the generated Nano Banana Pro / Imagen 3 visual roadmap infographic
along with structured phase milestones, technical deliverables, and national impact metrics.
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
    PageBreak,
    HRFlowable,
)

def create_roadmap_pdf(output_paths, image_path):
    # Page setup: A4 Landscape (841.89 x 595.27 points)
    page_width, page_height = landscape(A4)
    margin = 36 # 0.5 inch

    for output_path in output_paths:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=landscape(A4),
            leftMargin=margin,
            rightMargin=margin,
            topMargin=28,
            bottomMargin=28,
        )

        styles = getSampleStyleSheet()

        # Custom high-contrast styles
        title_style = ParagraphStyle(
            'CoverTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4,
        )

        subtitle_style = ParagraphStyle(
            'CoverSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=10,
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=6,
        )

        phase_title = ParagraphStyle(
            'PhaseTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10.5,
            leading=13,
            textColor=colors.HexColor('#0284C7'),
        )

        phase_body = ParagraphStyle(
            'PhaseBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#334155'),
        )

        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
        )

        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#0284C7'),
        )

        meta_val_style = ParagraphStyle(
            'MetaVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#475569'),
        )

        story = []

        # ================= PAGE 1: EXECUTIVE INFOGRAPHIC COVER =================
        header_table_data = [
            [
                Paragraph("<b>Q-TRACE: STRATEGIC TECHNOLOGY & IMPACT ROADMAP</b>", title_style),
                Paragraph("<b>National Quantum Mission (NQM)</b><br/><font color='#64748B'>SIH Problem Statement: SIH26140</font>", meta_val_style)
            ],
            [
                Paragraph("A 4-Horizon Pathway for Deep-Tech Quantum Capacity Building Across 10,000+ Technical Institutions", subtitle_style),
                Paragraph("<font color='#0284C7'><b>Status:</b> Ready for Evaluation</font>", meta_val_style)
            ]
        ]
        header_table = Table(header_table_data, colWidths=[540, 230])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(header_table)
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=4, spaceAfter=8))

        # Main Infographic Image
        # Available width = 841.89 - 72 = 769.89 pt. 16:9 ratio -> 750 pt x 421 pt fits nicely
        if os.path.exists(image_path):
            img = Image(image_path, width=760, height=410)
            story.append(img)
        else:
            story.append(Paragraph(f"Image not found at: {image_path}", phase_body))

        story.append(Spacer(1, 6))

        # Page 1 Footer Summary Cards
        footer_summary_data = [
            [
                Paragraph("<b>HORIZON 1 (M 1–6)</b><br/>25 AICTE Pilot Colleges<br/>Diagnostic Telemetry Calibrated", phase_body),
                Paragraph("<b>HORIZON 2 (M 6–18)</b><br/>State University Rollout<br/>DIKSHA & SWAYAM Integration", phase_body),
                Paragraph("<b>HORIZON 3 (M 18–30)</b><br/>500 Institutions on NIC Cloud<br/>DigiLocker / NAD Credentialing", phase_body),
                Paragraph("<b>HORIZON 4 (M 30–48)</b><br/>Indigenous QPU Execution<br/>25,000 Quantum Workforce Target", phase_body),
            ]
        ]
        footer_table = Table(footer_summary_data, colWidths=[190, 190, 190, 190])
        footer_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(footer_table)

        story.append(PageBreak())

        # ================= PAGE 2: COMPREHENSIVE SPECIFICATIONS =================
        story.append(Paragraph("<b>DETAILED PHASE SPECIFICATIONS & DELIVERABLE MATRIX</b>", section_heading))
        story.append(Paragraph("Structured Operational Plan: Human Capital Development, Digital Public Infrastructure (DPI), and Hardware Convergence", subtitle_style))
        story.append(Spacer(1, 4))

        # Detailed 4-Phase Grid
        phase_matrix_data = [
            [
                Paragraph("<b>PHASE 1: Institutional Testbed</b><br/><font color='#64748B'>Timeline: Months 1–6</font>", phase_title),
                Paragraph("<b>PHASE 2: State University Federation</b><br/><font color='#64748B'>Timeline: Months 6–18</font>", phase_title),
            ],
            [
                Paragraph("""
<b>Objective:</b> Rigorous pilot rollout across 25 select AICTE technical colleges engaging 5,000 active learners.<br/><br/>
<b>Key Technical Deliverables:</b><br/>
• Production deployment of Quantum Flight Recorder with AST security sandboxing.<br/>
• Calibrated Misconception Taxonomy mapped to 40+ cognitive divergence patterns.<br/>
• Instructor Failure Topology Dashboard pilot for automated faculty remediation.<br/>
• Baseline performance verification: sub-1500ms simulation & 0% AI hallucination.<br/><br/>
<b>Regulatory & Procurement:</b><br/>
• GeM (Government e-Marketplace) OEM catalog listing & AICTE NEAT 4.0 onboarding.<br/>
• CERT-In security clearance and vulnerability assessment sign-off.<br/><br/>
<b>Impact Target:</b> 60% relative comprehension boost in quantum algorithms.
""", phase_body),
                Paragraph("""
<b>Objective:</b> Federation with State Technical Universities (AKTU, VTU, Anna Univ) scaling to 50,000 learners.<br/><br/>
<b>Key Technical Deliverables:</b><br/>
• Direct federation with SWAYAM / NPTEL and DIKSHA national course platforms.<br/>
• National Knowledge Network (NKN) campus edge caching for sub-10ms latency.<br/>
• Tri-Engine Conformance Arena: Qiskit Aer, PennyLane, and Google Cirq interoperability.<br/>
• Module 3 Expansion: Shor's Factoring, QAOA Optimization, and VQE Chemistry templates.<br/><br/>
<b>Financial & Operational Milestones:</b><br/>
• Operational cash-flow breakeven achieved via Campus Core institutional licenses.<br/>
• Train-the-trainer AICTE ATAL Academy workshops certifying 1,000+ master faculty.<br/><br/>
<b>Impact Target:</b> ₹12+ Crore saved in institutional physical lab setups.
""", phase_body),
            ],
            [
                Paragraph("<b>PHASE 3: Pan-India NQM Deployment</b><br/><font color='#64748B'>Timeline: Months 18–30</font>", phase_title),
                Paragraph("<b>PHASE 4: Sovereign Quantum Cloud</b><br/><font color='#64748B'>Timeline: Months 30–48</font>", phase_title),
            ],
            [
                Paragraph("""
<b>Objective:</b> Pan-India rollout across 500+ AICTE colleges supporting 100,000+ concurrent students.<br/><br/>
<b>Key Technical Deliverables:</b><br/>
• Sovereign hosting on National Informatics Centre (NIC) MeghRaj GovCloud.<br/>
• National Academic Depository (NAD) & DigiLocker verifiable quantum micro-credentials.<br/>
• Multi-lingual Socratic AI Tutor localized in Hindi, Telugu, Tamil, Marathi, and Kannada.<br/>
• Adaptive learning engine with collaborative misconception clustering.<br/><br/>
<b>Institutional Partnerships:</b><br/>
• Nodal quantum hub integrations with IIT Madras, IISc Bangalore, and TIFR.<br/>
• National Quantum Hackathon series powered by Q-Trace evaluation engine.<br/><br/>
<b>Impact Target:</b> Accelerates foundational course mastery from 16 weeks to 4 weeks.
""", phase_body),
                Paragraph("""
<b>Objective:</b> Seamless hardware abstraction connecting student circuits directly to indigenous QPUs.<br/><br/>
<b>Key Technical Deliverables:</b><br/>
• Hardware-agnostic adapters for indigenous Indian superconducting & trapped-ion QPUs.<br/>
• OpenQASM 3.0 compilation and automated pulse schedule optimization pipeline.<br/>
• Quantum Error Correction (QEC) interactive learning labs (Surface codes, Stabilizers).<br/>
• Global quantum research export gateway via Unitary Fund & IEEE Quantum.<br/><br/>
<b>National Strategic Outcomes:</b><br/>
• Realization of the National Quantum Mission target: 25,000 certified quantum engineers.<br/>
• Total elimination of foreign licensing dependencies for educational quantum sandboxes.<br/><br/>
<b>Economic Impact:</b> ₹1,250+ Crore in annual workforce economic productivity.
""", phase_body),
            ]
        ]

        phase_table = Table(phase_matrix_data, colWidths=[380, 380])
        phase_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F0F9FF')),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F5F3FF')),
            ('BACKGROUND', (0,2), (0,2), colors.HexColor('#ECFDF5')),
            ('BACKGROUND', (1,2), (1,2), colors.HexColor('#FFFBEB')),
            ('BACKGROUND', (0,1), (0,1), colors.HexColor('#FFFFFF')),
            ('BACKGROUND', (1,1), (1,1), colors.HexColor('#FFFFFF')),
            ('BACKGROUND', (0,3), (0,3), colors.HexColor('#FFFFFF')),
            ('BACKGROUND', (1,3), (1,3), colors.HexColor('#FFFFFF')),
            ('BOX', (0,0), (0,1), 1, colors.HexColor('#0284C7')),
            ('BOX', (1,0), (1,1), 1, colors.HexColor('#7C3AED')),
            ('BOX', (0,2), (0,3), 1, colors.HexColor('#059669')),
            ('BOX', (1,2), (1,3), 1, colors.HexColor('#D97706')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(phase_table)

        story.append(Spacer(1, 10))

        # Bottom KPI Summary Bar
        kpi_table_data = [
            [
                Paragraph("<b>NATIONAL SCALE METRIC</b>", table_header_style),
                Paragraph("<b>YEAR 1 (PILOT)</b>", table_header_style),
                Paragraph("<b>YEAR 2 (FEDERATION)</b>", table_header_style),
                Paragraph("<b>YEAR 3 (NQM SCALE)</b>", table_header_style),
                Paragraph("<b>YEAR 4 (QPU HORIZON)</b>", table_header_style),
            ],
            [
                Paragraph("<b>Participating Technical Colleges</b>", phase_body),
                Paragraph("25 Colleges", phase_body),
                Paragraph("150 Colleges", phase_body),
                Paragraph("500 Colleges", phase_body),
                Paragraph("1,200+ Colleges", phase_body),
            ],
            [
                Paragraph("<b>Active Trained Learners</b>", phase_body),
                Paragraph("5,000 Students", phase_body),
                Paragraph("50,000 Students", phase_body),
                Paragraph("100,000+ Students", phase_body),
                Paragraph("250,000+ Students", phase_body),
            ],
            [
                Paragraph("<b>Institutional Lab Cost Saved</b>", phase_body),
                Paragraph("₹3.75 Crore", phase_body),
                Paragraph("₹22.50 Crore", phase_body),
                Paragraph("₹75.00 Crore", phase_body),
                Paragraph("₹180.00+ Crore", phase_body),
            ],
            [
                Paragraph("<b>Certified Quantum Graduates (NQM)</b>", phase_body),
                Paragraph("1,200 Ready", phase_body),
                Paragraph("8,500 Ready", phase_body),
                Paragraph("18,000 Ready", phase_body),
                Paragraph("25,000+ Target Achieved", phase_body),
            ],
        ]

        kpi_table = Table(kpi_table_data, colWidths=[200, 140, 140, 140, 140])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(kpi_table)

        doc.build(story)
        print(f"Successfully generated: {output_path}")

if __name__ == '__main__':
    images = [
        "d:/Q-Trace/docs/roadmap_visual.jpg",
        "C:/Users/Vinod krishna/.gemini/antigravity/brain/fbcf34fc-718b-4727-98a2-df84705596fe/qtrace_project_roadmap_1790771674002.jpg",
    ]
    img_path = images[0] if os.path.exists(images[0]) else images[1]
    
    outputs = [
        "d:/Q-Trace/docs/roadmap.pdf",
        "d:/Q-Trace/roadmap.pdf",
    ]
    create_roadmap_pdf(outputs, img_path)
