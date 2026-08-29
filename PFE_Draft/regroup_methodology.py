from pathlib import Path

ROOT = Path(__file__).resolve().parent
path = ROOT / "chapters" / "04_methodology.tex"
text = path.read_text(encoding="utf-8")

# Restore any previous partial regroup by reading from git? We may have already mutated.
# Re-read and apply idempotent transforms.

# 1) Ensure AI/RAG are injected once, just before Quality Assurance
if "\\input{chapters/04b_ai_techniques}" not in text:
    marker = "\\section{Quality Assurance Protocol}"
    # also handle if already demoted
    if marker not in text:
        marker = "\\subsection{Quality Assurance Protocol}"
    insert = (
        "% --- AI techniques + RAG (Methodology core; defence focus) ---\n"
        "\\input{chapters/04b_ai_techniques}\n"
        "\\input{chapters/05_rag_implementation}\n\n"
    )
    text = text.replace(marker, insert + marker, 1)

# 2) If Quality Assurance is still \subsection, promote back to \section first for clean control
text = text.replace(
    "\\subsection{Quality Assurance Protocol}",
    "\\section{Quality Assurance Protocol}",
)

# 3) Wrap pre-AI long tail (Detailed Scoring .. React) under one section
if "\\section{Extended Methodological Documentation}" not in text:
    text = text.replace(
        "\\section{Detailed Scoring Rubric by Theme}",
        "\\section{Extended Methodological Documentation}\n"
        "\\label{sec:method-extended}\n\n"
        "The subsections below provide reproducible detail required by the aivancity "
        "methodology guidelines (rubrics, worked examples, and UI structure).\n\n"
        "\\subsection{Detailed Scoring Rubric by Theme}",
        1,
    )

for title in [
    "Worked Example of Score Assignment",
    "Streamlit Application Structure",
    "React Presentation Layer",
]:
    text = text.replace(f"\\section{{{title}}}", f"\\subsection{{{title}}}")

# 4) After RAG, wrap remaining validation/runbook material
if "\\section{Reproducibility, Validation, and Method Closing}" not in text:
    text = text.replace(
        "\\section{Quality Assurance Protocol}",
        "\\section{Reproducibility, Validation, and Method Closing}\n"
        "\\label{sec:method-closing}\n\n"
        "\\subsection{Quality Assurance Protocol}",
        1,
    )

for title in [
    "Threats to Methodological Validity",
    "Hyperparameters and Configuration Surfaces",
    "Data Provenance and Citation Discipline",
    "Interface Wireframe Logic",
    "Ethics of Comparative Scoring",
    "Training and Onboarding Notes",
    "Mapping Phase 1 Claims to Implemented Features",
    "Resource Estimation for Full NLP Scale-Up",
    "Final Methodological Checklist",
    "Closing Bridge to Results",
    "Data Collection and Ingestion Details",
    "Preprocessing for Future NLP Assist",
    "Modeling Choices for the Analytics Artifact",
    "Training, Infrastructure, and Cost Profile",
    "Evaluation Metrics for the Delivered System",
    "Baseline Comparison Protocol for Analytics Claims",
    "Detailed Functional Specification of Dashboard Modules",
    "Mathematical Summary of Derived Indicators",
    "Reproducibility Runbook",
    "Methodological Conclusion",
]:
    text = text.replace(f"\\section{{{title}}}", f"\\subsection{{{title}}}")
    text = text.replace(f"\\subsection{{{title}}}", f"\\subsection{{{title}}}")  # noop safe

path.write_text(text, encoding="utf-8")
print("methodology regrouped")

main = ROOT / "main.tex"
mt = main.read_text(encoding="utf-8")
# Ensure main only inputs methodology once (AI/RAG come from inside Ch.4)
import re
mt2 = re.sub(
    r"\\input\{chapters/04_methodology\}\s*\\input\{chapters/04b_ai_techniques\}\s*\\input\{chapters/05_rag_implementation\}\s*",
    "\\input{chapters/04_methodology}\n",
    mt,
)
mt2 = re.sub(
    r"%%\s*\(includes AI techniques.*\n\\input\{chapters/04_methodology\}\n\\input\{chapters/04b_ai_techniques\}\n\\input\{chapters/05_rag_implementation\}\n",
    "%% (AI techniques + RAG are included inside Chapter 4)\n\\input{chapters/04_methodology}\n",
    mt2,
)
if "\\input{chapters/04b_ai_techniques}" in mt2 and "04_methodology" in mt2:
    # still present at top level — strip leftover lines
    lines = []
    for line in mt2.splitlines(True):
        if "\\input{chapters/04b_ai_techniques}" in line:
            continue
        if "\\input{chapters/05_rag_implementation}" in line:
            continue
        lines.append(line)
    mt2 = "".join(lines)
main.write_text(mt2, encoding="utf-8")
print("main.tex updated")
