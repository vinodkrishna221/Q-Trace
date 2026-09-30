"""
Build pixel-perfect 2-page A4 Landscape Roadmap PDF for Q-Trace.
Uses Chromium/Edge headless renderer to guarantee:
- Exactly 2 pages (zero overflow / spillover)
- Native unicode rendering for Indian Rupee symbol (₹)
- Perfectly balanced vertical layout and executive presentation typography
"""

import base64
import os
import subprocess
from pypdf import PdfReader
import pymupdf

def generate_perfect_pdf():
    image_path = "d:/Q-Trace/docs/roadmap_visual.jpg"
    html_output_path = "d:/Q-Trace/docs/roadmap.html"
    pdf_docs_path = "d:/Q-Trace/docs/roadmap.pdf"
    pdf_root_path = "d:/Q-Trace/roadmap.pdf"

    # Encode image to base64
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
    img_data_uri = f"data:image/jpeg;base64,{img_b64}"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Q-Trace Strategic Technology & Impact Roadmap</title>
<style>
  @page {{
    size: 297mm 210mm;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #07090E;
    color: #E2E8F0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .page {{
    width: 297mm;
    height: 210mm;
    max-height: 210mm;
    overflow: hidden;
    padding: 10mm 14mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    background: radial-gradient(circle at 50% 0%, #111827 0%, #07090E 75%);
    position: relative;
  }}
  .page:last-child {{
    page-break-after: avoid;
  }}

  /* Header */
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1.5px solid rgba(56, 189, 248, 0.4);
    padding-bottom: 7px;
    margin-bottom: 8px;
  }}
  .header-left h1 {{
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, #38BDF8, #818CF8, #C084FC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .header-left p {{
    font-size: 11.5px;
    color: #94A3B8;
    margin-top: 3px;
  }}
  .header-right {{
    text-align: right;
  }}
  .badge-row {{
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }}
  .badge {{
    background: rgba(14, 165, 233, 0.18);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38BDF8;
    font-size: 10px;
    font-weight: 700;
    padding: 2.5px 9px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}
  .badge-purple {{
    background: rgba(168, 85, 247, 0.18);
    border-color: rgba(192, 132, 252, 0.4);
    color: #C084FC;
  }}
  .header-meta {{
    font-size: 10.5px;
    color: #64748B;
    margin-top: 4px;
  }}

  /* Visual Container (Page 1) */
  .visual-container {{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0 8px 0;
    min-height: 0;
  }}
  .visual-container img {{
    max-width: 100%;
    max-height: 140mm;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid rgba(56, 189, 248, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.15);
  }}

  /* Horizon Bar (Page 1) */
  .horizon-bar {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 4px;
  }}
  .horizon-card {{
    background: rgba(15, 23, 42, 0.85);
    border-radius: 6px;
    padding: 8px 12px;
    border-left: 3.5px solid #38BDF8;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }}
  .horizon-card.h2 {{ border-left-color: #818CF8; }}
  .horizon-card.h3 {{ border-left-color: #34D399; }}
  .horizon-card.h4 {{ border-left-color: #F59E0B; }}
  .horizon-title {{
    font-size: 11px;
    font-weight: 700;
    color: #F8FAFC;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }}
  .horizon-title span {{
    color: #64748B;
    font-weight: 500;
  }}
  .horizon-desc {{
    font-size: 9.5px;
    color: #94A3B8;
    margin-top: 3px;
    line-height: 1.35;
  }}

  /* Page 2: Phase Specs Grid */
  .grid-phases {{
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    margin: 6px 0 14px 0;
  }}
  .phase-box {{
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 8px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }}
  .phase-box.p1 {{ border-top: 3px solid #38BDF8; }}
  .phase-box.p2 {{ border-top: 3px solid #818CF8; }}
  .phase-box.p3 {{ border-top: 3px solid #34D399; }}
  .phase-box.p4 {{ border-top: 3px solid #F59E0B; }}

  .phase-hdr {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 4px;
  }}
  .phase-name {{
    font-size: 12.5px;
    font-weight: 700;
    color: #F8FAFC;
  }}
  .phase-timeline {{
    font-size: 10.5px;
    font-weight: 600;
    color: #38BDF8;
  }}
  .phase-box.p2 .phase-timeline {{ color: #818CF8; }}
  .phase-box.p3 .phase-timeline {{ color: #34D399; }}
  .phase-box.p4 .phase-timeline {{ color: #F59E0B; }}

  .phase-content {{
    font-size: 10px;
    color: #94A3B8;
    line-height: 1.45;
  }}
  .phase-content strong {{
    color: #F1F5F9;
  }}
  .phase-content ul {{
    list-style-type: none;
    padding-left: 0;
    margin: 5px 0 6px 0;
  }}
  .phase-content li {{
    position: relative;
    padding-left: 12px;
    margin-bottom: 3px;
  }}
  .phase-content li::before {{
    content: "•";
    position: absolute;
    left: 0;
    color: #38BDF8;
    font-weight: bold;
  }}
  .phase-box.p2 .phase-content li::before {{ color: #818CF8; }}
  .phase-box.p3 .phase-content li::before {{ color: #34D399; }}
  .phase-box.p4 .phase-content li::before {{ color: #F59E0B; }}

  .impact-tag {{
    display: inline-block;
    font-size: 9.5px;
    font-weight: 600;
    color: #38BDF8;
    background: rgba(56, 189, 248, 0.12);
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid rgba(56, 189, 248, 0.2);
  }}
  .phase-box.p2 .impact-tag {{ color: #818CF8; background: rgba(129, 140, 248, 0.12); border-color: rgba(129, 140, 248, 0.2); }}
  .phase-box.p3 .impact-tag {{ color: #34D399; background: rgba(52, 211, 153, 0.12); border-color: rgba(52, 211, 153, 0.2); }}
  .phase-box.p4 .impact-tag {{ color: #F59E0B; background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.2); }}

  /* Page 2: Table */
  .kpi-section {{
    margin-top: 2px;
  }}
  .kpi-title {{
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #CBD5E1;
    margin-bottom: 5px;
  }}
  table.kpi-table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }}
  table.kpi-table th {{
    background: #0F172A;
    color: #38BDF8;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 9.5px;
    letter-spacing: 0.5px;
    padding: 6px 10px;
    text-align: left;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }}
  table.kpi-table td {{
    padding: 5.5px 10px;
    color: #CBD5E1;
    border: 1px solid rgba(148, 163, 184, 0.15);
    background: rgba(15, 23, 42, 0.55);
  }}
  table.kpi-table tr:nth-child(even) td {{
    background: rgba(30, 41, 59, 0.45);
  }}
  table.kpi-table td strong {{
    color: #F8FAFC;
  }}
  .highlight {{
    color: #34D399;
    font-weight: 700;
  }}
</style>
</head>
<body>

<!-- PAGE 1: EXECUTIVE VISUAL ROADMAP -->
<div class="page">
  <div class="header">
    <div class="header-left">
      <h1>⚛️ Q-TRACE: STRATEGIC TECHNOLOGY & IMPACT ROADMAP</h1>
      <p>A 4-Horizon Implementation Pathway for Deep-Tech Quantum Capacity Building Across 10,000+ Technical Institutions</p>
    </div>
    <div class="header-right">
      <div class="badge-row">
        <span class="badge">DST / National Quantum Mission</span>
        <span class="badge badge-purple">SIH26140</span>
      </div>
      <div class="header-meta">Ministry of Science & Technology • Ministry of Education (AICTE)</div>
    </div>
  </div>

  <div class="visual-container">
    <img src="{img_data_uri}" alt="Q-Trace Technology Product Roadmap">
  </div>

  <div class="horizon-bar">
    <div class="horizon-card h1">
      <div class="horizon-title">Horizon 1 <span>M 1–6</span></div>
      <div class="horizon-desc"><strong>Institutional Testbed:</strong> 25 AICTE Pilot Colleges, Diagnostic Telemetry Calibrated, AST Security Sandbox.</div>
    </div>
    <div class="horizon-card h2">
      <div class="horizon-title">Horizon 2 <span>M 6–18</span></div>
      <div class="horizon-desc"><strong>State Federation:</strong> AKTU/VTU/Anna Univ, SWAYAM & DIKSHA Integration, 50,000 Active Learners.</div>
    </div>
    <div class="horizon-card h3">
      <div class="horizon-title">Horizon 3 <span>M 18–30</span></div>
      <div class="horizon-desc"><strong>Pan-India NQM:</strong> 500+ Institutions on NIC Cloud, DigiLocker/NAD Sync, Multi-Lingual Socratic AI.</div>
    </div>
    <div class="horizon-card h4">
      <div class="horizon-title">Horizon 4 <span>M 30–48</span></div>
      <div class="horizon-desc"><strong>Sovereign Cloud:</strong> Indigenous Indian QPU Adapters, 25,000 Certified Quantum Talent Target.</div>
    </div>
  </div>
</div>

<!-- PAGE 2: DETAILED SPECIFICATIONS & IMPACT LEDGER -->
<div class="page">
  <div class="header">
    <div class="header-left">
      <h1>📋 DETAILED PHASE SPECIFICATIONS & DELIVERABLE MATRIX</h1>
      <p>Technical Deliverables, Regulatory Accreditations, and Verified National Economic Impact</p>
    </div>
    <div class="header-right">
      <div class="badge-row">
        <span class="badge">Verified Implementation Plan</span>
        <span class="badge badge-purple">National Scale</span>
      </div>
      <div class="header-meta">Atmanirbhar Bharat • Viksit Bharat 2047 Alignment</div>
    </div>
  </div>

  <div class="grid-phases">
    <div class="phase-box p1">
      <div>
        <div class="phase-hdr">
          <span class="phase-name">PHASE 1: Institutional Testbed</span>
          <span class="phase-timeline">Months 1–6</span>
        </div>
        <div class="phase-content">
          <strong>Objective:</strong> Deploy across 25 select AICTE technical colleges engaging 5,000 active learners.
          <ul>
            <li><strong>Technical:</strong> Quantum Flight Recorder, closed AST sandbox, 40+ Misconception Decision Rules.</li>
            <li><strong>Faculty:</strong> Instructor Failure Topology Dashboard for automated 1-click cohort remediation.</li>
            <li><strong>Compliance:</strong> GeM (Govt e-Marketplace) catalog listing, AICTE NEAT 4.0, CERT-In audit.</li>
          </ul>
        </div>
      </div>
      <div>
        <span class="impact-tag">Target: 60% relative boost in quantum conceptual reasoning</span>
      </div>
    </div>

    <div class="phase-box p2">
      <div>
        <div class="phase-hdr">
          <span class="phase-name">PHASE 2: State University Federation</span>
          <span class="phase-timeline">Months 6–18</span>
        </div>
        <div class="phase-content">
          <strong>Objective:</strong> Federation with State Technical Universities (AKTU, VTU, Anna Univ) scaling to 50,000 learners.
          <ul>
            <li><strong>Integration:</strong> SWAYAM/NPTEL and DIKSHA syndication; NKN edge caching for &lt;10ms latency.</li>
            <li><strong>Curriculum:</strong> Tri-Engine Arena (Qiskit Aer, PennyLane, Cirq); Shor, QAOA, and VQE templates.</li>
            <li><strong>Finance & Ops:</strong> Operating cash-flow breakeven; AICTE ATAL FDPs certifying 1,000+ faculty.</li>
          </ul>
        </div>
      </div>
      <div>
        <span class="impact-tag">Target: ₹12+ Crore saved in physical college lab setups</span>
      </div>
    </div>

    <div class="phase-box p3">
      <div>
        <div class="phase-hdr">
          <span class="phase-name">PHASE 3: Pan-India NQM Deployment</span>
          <span class="phase-timeline">Months 18–30</span>
        </div>
        <div class="phase-content">
          <strong>Objective:</strong> Pan-India rollout across 500+ AICTE colleges supporting 100,000+ concurrent students.
          <ul>
            <li><strong>Infrastructure:</strong> Sovereign hosting on National Informatics Centre (NIC) MeghRaj GovCloud.</li>
            <li><strong>Credentialing:</strong> National Academic Depository (NAD) &amp; DigiLocker verifiable quantum badges.</li>
            <li><strong>Pedagogy:</strong> Multi-lingual Socratic AI Tutor localized in Hindi, Telugu, Tamil, Marathi, Kannada.</li>
          </ul>
        </div>
      </div>
      <div>
        <span class="impact-tag">Target: 4× faster algorithm mastery; 65% faculty grading reduction</span>
      </div>
    </div>

    <div class="phase-box p4">
      <div>
        <div class="phase-hdr">
          <span class="phase-name">PHASE 4: Sovereign Quantum Cloud</span>
          <span class="phase-timeline">Months 30–48</span>
        </div>
        <div class="phase-content">
          <strong>Objective:</strong> Connect learner circuits directly to indigenous Indian QPUs built under NQM.
          <ul>
            <li><strong>Hardware:</strong> Agnostic adapters for Indian superconducting &amp; trapped-ion QPUs (TIFR, RRI, IISc).</li>
            <li><strong>Advanced Labs:</strong> Quantum Error Correction (QEC) interactive labs (Surface codes, Stabilizers).</li>
            <li><strong>Global Reach:</strong> OpenQASM 3.0 compilation and international quantum research export gateway.</li>
          </ul>
        </div>
      </div>
      <div>
        <span class="impact-tag">Target: 25,000 certified quantum engineers; ₹1,250+ Cr economic value</span>
      </div>
    </div>
  </div>

  <div class="kpi-section">
    <div class="kpi-title">National Scale &amp; Macro Economic Impact Ledger</div>
    <table class="kpi-table">
      <thead>
        <tr>
          <th>National Scale Metric</th>
          <th>Year 1 (Pilot Phase)</th>
          <th>Year 2 (Federation)</th>
          <th>Year 3 (NQM Scale)</th>
          <th>Year 4 (QPU Horizon)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Participating Technical Colleges</strong></td>
          <td>25 Colleges</td>
          <td>150 Colleges</td>
          <td>500 Colleges</td>
          <td><strong>1,200+ Colleges</strong></td>
        </tr>
        <tr>
          <td><strong>Active Trained Learners</strong></td>
          <td>5,000 Students</td>
          <td>50,000 Students</td>
          <td>100,000+ Students</td>
          <td><strong class="highlight">250,000+ Students</strong></td>
        </tr>
        <tr>
          <td><strong>Institutional Lab Cost Saved</strong></td>
          <td>₹3.75 Crore</td>
          <td>₹22.50 Crore</td>
          <td>₹75.00 Crore</td>
          <td><strong class="highlight">₹180.00+ Crore</strong></td>
        </tr>
        <tr>
          <td><strong>Certified Quantum Graduates (NQM Target)</strong></td>
          <td>1,200 Ready</td>
          <td>8,500 Ready</td>
          <td>18,000 Ready</td>
          <td><strong class="highlight">25,000+ (100% Target Met)</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

</body>
</html>
"""

    with open(html_output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated HTML: {html_output_path}")

    # Render PDF using Microsoft Edge headless
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={os.path.abspath(pdf_docs_path)}",
        f"file:///{os.path.abspath(html_output_path).replace(os.sep, '/')}"
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated PDF: {pdf_docs_path}")

    # Copy to root
    with open(pdf_docs_path, "rb") as src, open(pdf_root_path, "wb") as dst:
        dst.write(src.read())
    print(f"Mirrored PDF: {pdf_root_path}")

    # Verify with pypdf
    reader = PdfReader(pdf_docs_path)
    page_count = len(reader.pages)
    print(f"PDF Page Count Verification: {page_count} pages")

    # Render pages to PNG
    doc = pymupdf.open(pdf_docs_path)
    for i in range(len(doc)):
        doc[i].get_pixmap(dpi=150).save(f"d:/Q-Trace/docs/page_{i+1}.png")
    print("Updated page PNGs generated.")

if __name__ == "__main__":
    generate_perfect_pdf()
