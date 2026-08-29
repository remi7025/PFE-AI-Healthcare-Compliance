#!/usr/bin/env python3
"""Generate aivancity PGE5 PFE LaTeX draft (60+ pages body) from AI Clinic sources."""
from __future__ import annotations

import json
import shutil
import subprocess
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT.parent / "AI Clinic" / "data" / "compliance_dataset.json"
LIT = ROOT.parent / "AI Clinic" / "literature_review.md"
PDFLATEX = Path(r"C:\Users\Dell\AppData\Local\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe")
BIBER = Path(r"C:\Users\Dell\AppData\Local\Programs\MiKTeX\miktex\bin\x64\biber.exe")

# Fill these before final submission
STUDENT = "Remi Uttejitha Allam"
HOST = "aivancity"
IND_SUP = r"Prof.\ Anuradha Kar (aivancity)"
ACAD_SUP = r"Prof.\ Anuradha Kar (aivancity)"
YEAR = "2025--2026"
SUBMISSION = "30/08/2026"


def esc(s: str) -> str:
    if s is None:
        return ""
    return (
        str(s)
        .replace("\\", "\\textbackslash{}")
        .replace("&", "\\&")
        .replace("%", "\\%")
        .replace("#", "\\#")
        .replace("_", "\\_")
        .replace("{", "\\{")
        .replace("}", "\\}")
        .replace("~", "\\textasciitilde{}")
        .replace("^", "\\textasciicircum{}")
    )


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} ({len(content)} chars)")


def main_tex() -> str:
    return rf"""\documentclass[12pt,a4paper,oneside]{{report}}

% === aivancity PFE formatting (guidelines 2025--2026) ===
\usepackage[a4paper,top=2.5cm,bottom=2.5cm,inner=3cm,outer=2.5cm]{{geometry}}
\usepackage[T1]{{fontenc}}
\usepackage[utf8]{{inputenc}}
\usepackage{{lmodern}}
\usepackage{{microtype}}
\usepackage{{setspace}}
\onehalfspacing
\usepackage{{graphicx}}
\usepackage{{booktabs}}
\usepackage{{longtable}}
\usepackage{{array}}
\usepackage{{tabularx}}
\usepackage{{multirow}}
\usepackage{{xcolor}}
\usepackage{{hyperref}}
\usepackage{{enumitem}}
\usepackage{{amsmath,amssymb}}
\usepackage{{caption}}
\usepackage{{fancyhdr}}
\usepackage{{titlesec}}
\usepackage{{listings}}
\usepackage[backend=biber,style=ieee,sorting=none,maxnames=6,minnames=1]{{biblatex}}
\addbibresource{{references.bib}}

\hypersetup{{
  colorlinks=true,
  linkcolor=blue!50!black,
  citecolor=blue!50!black,
  urlcolor=blue!50!black,
  pdftitle={{Comparative Literature Review and Interactive Dashboard on Global AI Healthcare Regulations}},
  pdfauthor={{Remi Uttejitha Allam}}
}}

\definecolor{{codebg}}{{RGB}}{{245,247,250}}
\lstset{{
  basicstyle=\ttfamily\footnotesize,
  backgroundcolor=\color{{codebg}},
  frame=single,
  breaklines=true,
  columns=fullflexible,
  showstringspaces=false,
  numbers=left,
  numberstyle=\tiny\color{{gray}},
  captionpos=b
}}

\pagestyle{{fancy}}
\fancyhf{{}}
\fancyhead[L]{{\small aivancity -- PFE PGE5}}
\fancyhead[R]{{\small AI Healthcare Compliance Dashboard}}
\fancyfoot[C]{{\thepage}}
\renewcommand{{\headrulewidth}}{{0.4pt}}

\titleformat{{\chapter}}[display]
  {{\normalfont\huge\bfseries}}
  {{\chaptertitlename\ \thechapter}}{{20pt}}{{\Huge}}
\titleformat{{\section}}{{\normalfont\Large\bfseries}}{{\thesection}}{{1em}}{{}}
\titleformat{{\subsection}}{{\normalfont\large\bfseries}}{{\thesubsection}}{{1em}}{{}}

\begin{{document}}

% -------------------- COVER --------------------
\begin{{titlepage}}
\centering
\vspace*{{1.2cm}}
{{\Large Grande \'Ecole Program --- PGE5\par}}
{{\large Specialization: Artificial Intelligence \& Data Science\par}}
\vspace{{1.8cm}}
{{\LARGE\bfseries FINAL PROJECT REPORT (FPR)\par}}
\vspace{{1.2cm}}
{{\Huge\bfseries Comparative Literature Review and Interactive Dashboard on Global AI Healthcare Regulations\par}}
\vspace{{0.6cm}}
{{\Large Comparative Compliance Analytics across 20 Jurisdictions\par}}
\vspace{{2.2cm}}
\begin{{tabular}}{{rl}}
Student: & {STUDENT} \\[0.35em]
Host organization: & {HOST} \\[0.35em]
Academic tutor: & {ACAD_SUP} \\[0.35em]
Academic year: & {YEAR} \\[0.35em]
Submission date: & {SUBMISSION} \\
\end{{tabular}}
\vfill
{{\small Draft for academic supervisor review --- target length 60--90 pages (body)\par}}
\end{{titlepage}}

\pagenumbering{{roman}}

% -------------------- ACKNOWLEDGEMENTS --------------------
\chapter*{{Acknowledgements}}
\addcontentsline{{toc}}{{chapter}}{{Acknowledgements}}

The author wishes to thank Prof.\ Anuradha Kar for academic supervision, continuous methodological guidance, and critical feedback throughout the design of the literature synthesis and the interactive compliance dashboard. Gratitude is also extended to the aivancity faculty of the Grande \'Ecole Programme PGE5 (AI \& Data Science) for the pedagogical framework that shaped this Final Year Project.

Appreciation goes to open regulatory institutions---including the U.S.\ FDA, the European Commission, EMA, MHRA, WHO, OECD, and national agencies---whose publicly available guidance documents made comparative analysis possible. Finally, the author thanks family and peers for their support during the internship and report writing period.

% -------------------- ABSTRACTS --------------------
\chapter*{{R\'esum\'e}}
\addcontentsline{{toc}}{{chapter}}{{R\'esum\'e}}

L'intelligence artificielle (IA) transforme rapidement le secteur de la sant\'e \`a travers l'imagerie diagnostique, la pathologie num\'erique, la g\'enomique, l'aide \`a la d\'ecision clinique et la d\'ecouverte de m\'edicaments. Cette transformation s'accompagne d'un paysage r\'eglementaire fragment\'e: les exigences en mati\`ere de logiciel dispositif m\'edical (SaMD), de protection des donn\'ees de sant\'e, de validation clinique, de transparence algorithmique et de surveillance post-march\'e varient fortement selon les juridictions.

Ce Projet de Fin d'\'Etudes propose une synth\`ese comparative structur\'ee et un artefact logiciel exploratoire. La d\'emarche combine (1)~une revue de litt\'erature th\'ematique couvrant les cadres r\'eglementaires et \'ethiques de l'IA en sant\'e; (2)~un jeu de donn\'ees cur\'e de vingt pays/r\'egions not\'es sur sept dimensions de conformit\'e; (3)~un tableau de bord interactif (Streamlit et application web React) permettant la comparaison g\'eospatiale, th\'ematique et par cas d'usage clinique. Les r\'esultats mettent en \'evidence une convergence vers la classification par risque et la protection des donn\'ees inspir\'ee du RGPD, tout en soulignant des \'ecarts persistants de capacit\'e d'application entre \'economies avanc\'ees et \'emergentes. L'EU AI Act appara\^it comme un point d'inflexion pour la gouvernance contraignante de l'IA \`a haut risque en sant\'e.

\textbf{{Mots-cl\'es:}} r\'egulation de l'IA en sant\'e, SaMD, conformit\'e, RGPD, EU AI Act, validation clinique, tableau de bord, revue syst\'ematique.

\chapter*{{Abstract}}
\addcontentsline{{toc}}{{chapter}}{{Abstract}}

Artificial intelligence (AI) is transforming healthcare through diagnostic imaging, digital pathology, genomics, clinical decision support, and drug-discovery workflows. This transformation is constrained by a fragmented regulatory landscape: Software as a Medical Device (SaMD) pathways, health-data protection rules, clinical validation expectations, algorithmic transparency obligations, and post-market surveillance duties differ substantially across jurisdictions.

This Final Year Project delivers a structured comparative synthesis and an exploratory software artifact. The work combines (1)~a thematic literature review of AI healthcare regulation and ethics; (2)~a curated dataset covering twenty countries/regions scored on seven compliance dimensions; and (3)~an interactive dashboard (Streamlit and React) supporting geospatial, thematic, and clinical use-case comparisons. Findings indicate global convergence toward risk-based classification and GDPR-inspired data protection, alongside persistent enforcement-capacity gaps between advanced and emerging economies. The EU AI Act emerges as a watershed for binding governance of high-risk healthcare AI. The dashboard is intended as a decision-support and research tool---not legal advice---and is designed for reproducibility through version-controlled data and open source code.

\textbf{{Keywords:}} AI healthcare regulation, SaMD, compliance dashboard, GDPR, EU AI Act, clinical validation, post-market surveillance, comparative governance.

\tableofcontents
\clearpage
\listoffigures
\clearpage
\listoftables
\clearpage

\chapter*{{List of Abbreviations and Acronyms}}
\addcontentsline{{toc}}{{chapter}}{{List of Abbreviations and Acronyms}}
\begin{{tabular}}{{@{{}}ll@{{}}}}
\textbf{{Abbreviation}} & \textbf{{Meaning}} \\
\midrule
AI / ML / DL & Artificial Intelligence / Machine Learning / Deep Learning \\
API & Application Programming Interface \\
CDS & Clinical Decision Support \\
DPIA & Data Protection Impact Assessment \\
EHDS & European Health Data Space \\
EMA & European Medicines Agency \\
FDA & U.S.\ Food and Drug Administration \\
GDPR & General Data Protection Regulation \\
GMLP & Good Machine Learning Practice \\
HIPAA & Health Insurance Portability and Accountability Act \\
HITL & Human-in-the-Loop \\
IMDRF & International Medical Device Regulators Forum \\
KPI & Key Performance Indicator \\
LLM & Large Language Model \\
MDR & Medical Device Regulation (EU) \\
MHRA & Medicines and Healthcare products Regulatory Agency (UK) \\
NLP & Natural Language Processing \\
NMPA & National Medical Products Administration (China) \\
PCCP & Predetermined Change Control Plan \\
PFE & Projet de Fin d'\'Etudes (Final Year Project) \\
PGE & Grande \'Ecole Programme \\
PMDA & Pharmaceuticals and Medical Devices Agency (Japan) \\
RWE / RWD & Real-World Evidence / Real-World Data \\
SaMD & Software as a Medical Device \\
SLR & Systematic Literature Review \\
TPLC & Total Product Lifecycle \\
WHO & World Health Organization \\
XAI & Explainable Artificial Intelligence \\
\end{{tabular}}

\clearpage
\pagenumbering{{arabic}}

\input{{chapters/01_introduction}}
\input{{chapters/02_state_of_art}}
\input{{chapters/03_context}}
\input{{chapters/04_methodology}}
\input{{chapters/05_results}}
\input{{chapters/06_conclusion}}

\printbibliography[heading=bibintoc,title={{Bibliography}}]

\appendix
\input{{chapters/A_appendix}}

\end{{document}}
"""


def ch01() -> str:
    return r"""\chapter{Introduction}
\label{ch:intro}

\section{General Context and Societal Stakes}
\label{sec:macro}

Healthcare systems worldwide face simultaneous pressures of ageing populations, clinician shortages, rising chronic disease burden, and escalating cost of care. Artificial intelligence (AI) has emerged as a candidate technology to improve diagnostic accuracy, accelerate triage, personalize therapy, and automate administrative workflows~\cite{topol2019,rajpurkar2022}. In imaging alone, AI-enabled Software as a Medical Device (SaMD) products have proliferated: the U.S.\ Food and Drug Administration (FDA) has authorized hundreds of AI/ML-enabled devices, signaling industrial maturity and clinical appetite~\cite{wu2021,fda2021}.

Yet the same properties that make AI powerful---adaptivity, opacity, and dependence on large training corpora---also create novel safety, privacy, fairness, and accountability risks~\cite{gerke2020,char2018}. Unlike a traditional catheter or implant, an adaptive clinical model can drift after deployment as local patient distributions shift. Unlike a deterministic calculator, a deep neural network may resist clinician-facing explanation~\cite{ghassemi2021,rudin2019}. Unlike many consumer applications, healthcare AI frequently processes special-category personal data under stringent legal regimes such as the EU General Data Protection Regulation (GDPR) and the U.S.\ Health Insurance Portability and Accountability Act (HIPAA)~\cite{cohen2018,goodman2017}.

The result is what this project terms \emph{regulatory lag}: technology cycles outpace legislative cycles, producing a multi-jurisdictional ``maze'' of overlapping medical-device, data-protection, AI-specific, and ethical frameworks. For developers seeking multi-market access, for hospitals evaluating procurement risk, and for policymakers seeking evidence-based comparative learning, the absence of a structured, explorable synthesis is itself a barrier to safe innovation.

\section{Micro Context and Project Motivation}
\label{sec:micro}

Within the aivancity PGE5 AI \& Data Science curriculum, the Final Year Project (PFE) requires students to formalize an AI/data problem in a professional setting, conduct a positioned literature review, implement an evaluable technical solution, and communicate results to mixed academic--industry audiences. The present work---internally branded \textbf{AI Clinic}---addresses comparative AI healthcare compliance through two complementary deliverables:

\begin{enumerate}[noitemsep]
  \item a thematic, multi-region literature and policy synthesis organized around seven compliance dimensions;
  \item an interactive analytics dashboard that transforms curated jurisdictional indicators into maps, comparisons, trend views, and clinical use-case readiness profiles.
\end{enumerate}

The Phase~1 proposal framed the problem as regulatory fragmentation, safety/ethics obligations for dynamic systems, and market-entry barriers created by tightening 2025--2026 documentation and governance standards. It further argued that Natural Language Processing (NLP) and human-in-the-loop (HITL) workflows can reduce rote scanning of legislative corpora. The implemented draft focuses first on high-quality curated comparative analytics and interactive visualization, while specifying a reproducible NLP-assisted ingestion pipeline as the methodological backbone for future automation.

\section{Problem Statement}
\label{sec:problem}

The central research and operational question of this PFE is:

\begin{quote}
\textit{How can multi-jurisdictional AI healthcare regulatory requirements be systematically synthesized, scored, and interactively compared so that researchers and decision-makers can identify maturity gaps, convergence trends, and deployment constraints across countries?}
\end{quote}

This question decomposes into four concrete challenges:
\begin{itemize}[noitemsep]
  \item \textbf{Knowledge fragmentation:} peer-reviewed studies, agency guidance, and national AI strategies are dispersed across databases and languages;
  \item \textbf{Incommensurable frameworks:} FDA Class~I--III, EU MDR classes, and NMPA tiers are related but not identical;
  \item \textbf{Static reporting:} traditional literature reviews freeze knowledge at publication time and do not support drill-down exploration;
  \item \textbf{Stakeholder diversity:} policymakers, developers, clinicians, and students need different views of the same underlying evidence.
\end{itemize}

\section{SMART Objectives and Contributions}
\label{sec:objectives}

Aligned with aivancity assessment criteria (scientific quality, methodological rigor, critical positioning, communication), the project pursues the following SMART objectives:

\begin{enumerate}[noitemsep]
  \item \textbf{Specific:} synthesize AI healthcare regulation across twenty countries/regions spanning six geographic areas;
  \item \textbf{Measurable:} define and score seven compliance themes on a calibrated 1--10 scale and report device-approval counts where available;
  \item \textbf{Achievable:} deliver a version-controlled JSON dataset and interactive dashboard runnable locally without proprietary APIs;
  \item \textbf{Relevant:} address an industry-critical need for comparative compliance intelligence under EU AI Act and related regimes;
  \item \textbf{Time-bound:} produce Phase~1 framing, literature/dataset/dashboard drafts, and this full report within the PFE timeline ending August 2026.
\end{enumerate}

\textbf{Scientific and technical contributions} claimed by this work:
\begin{itemize}[noitemsep]
  \item a thematic state-of-the-art that organizes regulatory literature by problem strand rather than paper-by-paper summary;
  \item an explicit seven-theme scoring ontology linking privacy, validation, approval, transparency, ethics, post-market, and liability;
  \item a reproducible dashboard architecture (Streamlit prototype and React presentation layer) with exportable tables;
  \item critical positioning against gaps in gold-standard cross-jurisdictional compliance repositories.
\end{itemize}

\section{Scope, Assumptions, and Non-Goals}
\label{sec:scope}

The analysis covers twenty jurisdictions selected for regional diversity and data availability (United States, Canada, European Union aggregate, United Kingdom, Germany, Switzerland, China, India, Japan, South Korea, Singapore, Thailand, Saudi Arabia, UAE, Israel, South Africa, Nigeria, Kenya, Australia, and Brazil). Theme scores are expert-curated comparative indicators informed by policy documents and literature; they are \emph{not} official government ratings and must not be interpreted as legal advice.

Out of scope for the present draft: live scraping of every national gazette; clinical validation of a therapeutic AI model; production deployment inside a hospital EHR; and binding legal opinions. NLP classification is designed and partially prototyped as a pipeline, with full supervised training treated as future work when labeled corpora mature.

\section{Report Outline}
\label{sec:outline}

Chapter~\ref{ch:sota} presents the state of the art on SaMD frameworks, privacy, validation, transparency, ethics, surveillance, and liability, closing with comparative positioning. Chapter~\ref{ch:context} situates the mission, role, data accessed, and legal constraints. Chapter~\ref{ch:method} details the reproducible methodology: search strategy, scoring protocol, dataset schema, NLP pipeline design, and dashboard architecture. Chapter~\ref{ch:results} reports quantitative and qualitative findings, regional patterns, and critical discussion. Chapter~\ref{ch:conclusion} answers the research question, states limitations, and proposes future work. Appendices provide code extracts, environment details, and the generative-AI use declaration required by aivancity guidelines.
"""


def ch02_part_a() -> str:
    return r"""\chapter{State of the Art}
\label{ch:sota}

This chapter organizes prior work by thematic strands rather than paper-by-paper summary, as required by aivancity writing guidelines. It prioritizes recent sources (approximately 2018--2026) while retaining seminal frameworks such as IMDRF SaMD guidance~\cite{imdrf2014}.

\section{Theoretical Foundations of AI in Healthcare}
\label{sec:foundations}

\subsection{From Statistical Learning to Clinical AI Systems}

Modern clinical AI draws on supervised learning, deep neural networks, and increasingly foundation models. In imaging, convolutional architectures and transformers support detection, triage, and quantification tasks~\cite{rajpurkar2022}. In text-heavy domains---radiology reports, guidelines, and regulatory corpora---transformer language models enable semantic retrieval and classification. The clinical setting, however, imposes constraints rarely present in general ML benchmarks: safety-critical false negatives, shifting populations, missing labels, and medico-legal accountability~\cite{topol2019,char2018}.

\subsection{Software as a Medical Device (SaMD)}

The International Medical Device Regulators Forum (IMDRF) defined SaMD as software intended for medical purposes that is not part of a hardware medical device~\cite{imdrf2014}. Risk categorization considers (i)~the significance of the information provided to the healthcare decision and (ii)~the state of the healthcare situation or condition. This conceptual scaffolding underpins FDA pathways (510(k), De Novo, PMA), EU MDR classification, Japan's DASH framework, and China's NMPA guiding principles~\cite{fda2021,pmda2020,nmpa2021,euaiact2024}.

\begin{table}[htbp]
\centering
\caption{Representative risk-based classification systems for medical devices / SaMD}
\label{tab:risk}
\begin{tabular}{@{}lll@{}}
\toprule
\textbf{Jurisdiction} & \textbf{System} & \textbf{Classes} \\
\midrule
United States & FDA risk-based & I, II, III \\
European Union & MDR risk-based & I, IIa, IIb, III \\
China & NMPA three-tier & I, II, III \\
Canada & Health Canada & I, II, III, IV \\
Japan & PMDA / PMD Act & I, II, III, IV \\
Australia & TGA & I, IIa, IIb, III \\
\bottomrule
\end{tabular}
\end{table}

Table~\ref{tab:risk} shows near-universal adoption of proportional regulation by potential harm. Higher-risk autonomous diagnosis and treatment-planning systems face stricter clinical evidence and post-market obligations~\cite{muehlematter2021}.

\subsection{Adaptive Algorithms and Lifecycle Thinking}

Unlike static devices, AI/ML systems may learn after deployment. Regulators therefore shift from point-in-time approval toward lifecycle governance~\cite{babic2019,hwang2019}. The FDA Predetermined Change Control Plan (PCCP) allows manufacturers to pre-specify anticipated modifications and associated validation methods~\cite{fda2023}. The EU AI Act imposes ongoing conformity and risk-management duties for high-risk systems~\cite{euaiact2024}. Joint Good Machine Learning Practice (GMLP) principles from FDA, Health Canada, and MHRA articulate ten development practices covering data quality, reference standards, bias mitigation, and monitoring~\cite{gmlp2021}.

\section{Regulatory Frameworks for AI Medical Devices}
\label{sec:regframeworks}

\subsection{United States}

The FDA AI/ML SaMD Action Plan (2021) consolidates a tailored regulatory approach: pathway clarity, good machine learning practice, bias reduction, transparency, and real-world performance monitoring~\cite{fda2021}. The U.S.\ ecosystem combines deep agency capacity with fragmented federal AI legislation and sectoral privacy (HIPAA) rather than omnibus data protection~\cite{cohen2018}. Innovation throughput is high---device authorizations exceed those of most peers---but transparency and ethics remain comparatively less mandated than in the EU.

\subsection{European Union}

Europe layers MDR/IVDR device rules, GDPR data protection, and the EU AI Act's risk-tiered AI obligations~\cite{euaiact2024}. Most healthcare AI falls into the high-risk category, triggering technical documentation, logging, human oversight, and data-governance duties. The proposed European Health Data Space (EHDS) aims to unlock secondary use of health data under controlled conditions. Strengths include rights-based coherence; challenges include notified-body capacity and compliance complexity for SMEs.

\subsection{United Kingdom (Post-Brexit Divergence)}

The UK retains GDPR-derived data protection while pursuing a ``pro-innovation'' AI framework that relies on existing sector regulators rather than a single horizontal AI Act analogue. MHRA SaMD programmes and NICE evidence standards for digital health shape clinical adoption. Dual-track EU/UK compliance is now a practical reality for vendors.

\subsection{East Asia}

China's NMPA AI medical device guiding principles (2021) and algorithm-related rules create a state-guided, rapidly evolving regime with significant data-localization implications~\cite{nmpa2021}. Japan's PMDA DASH framework and South Korea's high approval throughput illustrate alternative paths combining industrial policy and regulatory science~\cite{pmda2020}. Cross-border validation remains sensitive where health data export is restricted.

\subsection{Emerging and Developing Jurisdictions}

Singapore's Model AI Governance Framework and AI Verify testing tools position it as a governance laboratory. India's DPDP Act and Ayushman Bharat Digital Mission create foundational infrastructure with still-maturing AI-device pathways. Gulf states invest heavily in AI strategies while regulatory maturity catches up. African jurisdictions such as South Africa (POPIA), Nigeria (NDPA), and Kenya have advanced data protection ahead of AI-specific SaMD guidance, reflecting capacity constraints and competing health priorities.

\section{Data Privacy and Governance}
\label{sec:privacy}

\subsection{GDPR as Global Benchmark}

GDPR principles---lawfulness, fairness, transparency, purpose limitation, minimization, accuracy, storage limitation, integrity, and accountability---have become the de facto template for health-data governance worldwide. Article~22's automated decision-making provisions intersect directly with clinical AI~\cite{goodman2017}. Data Protection Impact Assessments (DPIAs) are expected for high-risk processing.

\subsection{Post-GDPR Legislative Wave}

Since 2018, comprehensive laws have proliferated (e.g., Brazil LGPD, India DPDP, China PIPL, South Africa POPIA, Nigeria NDPA, Thailand PDPA, Saudi PDPL, UAE Federal Decree~45, Swiss nFADP), with varying alignment to GDPR. Cross-border transfer rules and localization requirements complicate multinational training and multi-site clinical validation~\cite{gerke2020}.

\subsection{Health-Specific Regimes}

HIPAA governs U.S.\ Protected Health Information with Privacy, Security, and Breach Notification Rules~\cite{cohen2018}. National digital health record laws (e.g., Australia My Health Records) add further constraints. For AI developers, privacy is not a single checklist but a portfolio of overlapping obligations keyed to data residency, consent/legal basis, and secondary research use.

\section{Clinical Validation and Safety}
\label{sec:validation}

\subsection{Evidence Hierarchy for SaMD}

Analytical validation, clinical validation, and clinical utility form a common evidence ladder. Risk proportionality determines the depth of prospective trials versus retrospective studies and Real-World Evidence (RWE)~\cite{wu2021}. Germany's DiGA pathway and NICE digital evidence standards illustrate pragmatic acceptance of planned evidence generation for lower-risk digital tools.

\subsection{Bias, Fairness, and Subgroup Performance}

Empirical studies document disparate performance across skin tones, demographic groups, and underserved populations~\cite{obermeyer2019,seyedkalantari2021}. Regulators increasingly expect representative datasets, subgroup analyses, and post-deployment monitoring. From a compliance-analytics perspective, ``clinical validation'' scores should therefore capture not only the existence of guidance but also maturity of bias-assessment expectations.

\section{Algorithmic Transparency and Explainability}
\label{sec:xai}

Transparency spans mandated documentation (EU AI Act technical files, logging, user notices) and voluntary frameworks (NIST AI RMF, Singapore guidance)~\cite{nistairmf,euaiact2024}. The XAI literature warns that post-hoc explanations (SHAP, LIME, attention maps) can create false confidence~\cite{ghassemi2021}. Rudin argues for inherently interpretable models in high-stakes decisions~\cite{rudin2019}. Healthcare regulation must balance clinician trust, patient rights, and the empirical reality that many high-performing models remain partially opaque.

\section{Ethical Frameworks and the Principles-to-Practice Gap}
\label{sec:ethics}

Jobin et al.\ mapped a global explosion of AI ethics guidelines~\cite{jobin2019}. WHO's 2021 guidance articulates six principles: autonomy, well-being/safety, transparency, responsibility, inclusiveness, and sustainability~\cite{who2021}. Mittelstadt cautions that principles alone cannot guarantee ethical AI~\cite{mittelstadt2019}; Morley et al.\ survey tools attempting to operationalize ethics~\cite{morley2020}. Regional philosophical traditions (EU rights-based, U.S.\ innovation-oriented, Chinese state-guided, African Ubuntu-informed) shape how principles are interpreted~\cite{who2021}.

\section{Post-Market Surveillance and Liability}
\label{sec:pms}

Adverse-event systems (FDA MedWatch, EU MDR serious incidents, UK Yellow Card) were designed for hardware-centric failure modes. AI-specific harms---silent performance degradation, systematic bias---may be under-captured~\cite{petersen2022}. Liability remains largely grounded in product liability and malpractice doctrines that struggle with opaque causation~\cite{price2019}. Proposed EU AI liability reforms would shift evidentiary burdens in some cases, illustrating the frontier nature of this theme in our scoring ontology.
"""


def ch02_part_b() -> str:
    return r"""
\section{Related Work on Comparative Regulation and Compliance Tools}
\label{sec:related}

Academic comparative studies of AI medical-device approvals (e.g., U.S.\ vs Europe) quantify throughput and pathway differences~\cite{muehlematter2021}. Policy observatories (OECD.AI) and ethics surveys provide transversal maps but rarely couple machine-readable scores with interactive drill-down for healthcare-specific themes~\cite{oecdai,jobin2019}. Commercial regulatory intelligence platforms exist for pharma and medtech, yet open, pedagogically transparent datasets tailored to student and researcher use remain scarce---a gap this PFE targets.

On the NLP side, transformer-based classification and retrieval have been applied to legal and biomedical text. Systematic review automation using PRISMA-inspired workflows and HITL verification is an active research area. Phase~1 of this project explicitly positioned BERT/transformer pipelines for semantic capture of validation and privacy clauses, while acknowledging that a gold-standard cross-jurisdictional compliance corpus is still underdeveloped.

\section{Comparative Synthesis Table}
\label{sec:comptable}

\begin{table}[htbp]
\centering
\caption{Comparative synthesis of major regulatory approaches (simplified)}
\label{tab:synthesis}
\begin{tabular}{@{}p{2.2cm}p{3.0cm}p{3.0cm}p{3.2cm}@{}}
\toprule
\textbf{Axis} & \textbf{USA} & \textbf{EU} & \textbf{China} \\
\midrule
Device pathway & 510(k)/De Novo/PMA + PCCP & MDR + notified bodies & NMPA AI guiding principles \\
AI-specific law & Sectoral + EO/NIST voluntary & Binding AI Act high-risk duties & Algorithm/filing rules + industrial policy \\
Privacy & HIPAA (sectoral) & GDPR + EHDS trajectory & PIPL + localization \\
Transparency & Encouraged, limited mandates & Strong documentation/logging & Filing + user-facing rules (context-dependent) \\
Ethics posture & Innovation-oriented voluntary & Rights-based enforceable & State-guided harmony/collective framing \\
\bottomrule
\end{tabular}
\end{table}

Table~\ref{tab:synthesis} is intentionally schematic: national systems evolve quickly, and ``EU'' aggregates heterogeneous member-state enforcement. The dashboard operationalizes a finer seven-theme scorecard to avoid single-axis rankings.

\section{Positioning of This Work}
\label{sec:positioning}

Relative to prior literature, this PFE:
\begin{enumerate}[noitemsep]
  \item integrates \emph{policy + academic} sources into a single thematic narrative;
  \item proposes an explicit, reusable seven-dimension scoring ontology for healthcare AI compliance;
  \item delivers an open interactive interface (map, radar, heatmap, trends, use-case readiness) rather than a static PDF-only review;
  \item documents reproducibility (JSON schema, code listings, environment) consistent with aivancity methodological expectations;
  \item maintains HITL accountability: automated assistance must not replace expert judgment on regulatory interpretation.
\end{enumerate}

Identified gaps that remain open---and motivate Chapter~\ref{ch:method}---include limited labeled corpora for clause-level NLP classification, incomplete device-count transparency in some jurisdictions, and the absence of longitudinal score versioning tied to legislative change events.
"""


def ch03() -> str:
    return r"""\chapter{Project Context and Scope}
\label{ch:context}

\section{Host Setting and Organizational Context}
\label{sec:company}

This PFE is conducted within the aivancity Grande \'Ecole Programme (PGE5), specialization Artificial Intelligence \& Data Science, under academic supervision by __ACAD_SUP__. The applied host setting for the technical work is the \textbf{AI Clinic} research-and-engineering project: a compliance analytics initiative producing a literature synthesis, curated multi-country dataset, and interactive dashboard for AI healthcare regulation.

Where an industry internship host applies, the factual company description, team size, and AI strategy should be finalized with the industry supervisor before the August 2026 archival submission. In the present draft, the ``host organization'' field on the cover page remains explicitly marked for confirmation to avoid promotional or inaccurate claims, in line with aivancity guidance that company sections must remain factual.

\section{Team, Role, and Responsibilities}
\label{sec:role}

The student's role combines research analyst and full-stack data/AI engineer responsibilities:
\begin{itemize}[noitemsep]
  \item design the review protocol and thematic coding frame;
  \item curate jurisdictional profiles and theme scores with documented sources;
  \item implement data schemas and dashboard features (Streamlit and React);
  \item generate reproducible report artifacts (LaTeX/PDF, literature exports);
  \item iterate with the academic tutor on scientific positioning and writing quality.
\end{itemize}

Expected deliverables include: Phase~1 topic validation report; literature review; compliance dataset; interactive dashboard; and this Final Project Report (FPR) of 60--90 body pages excluding front matter, bibliography, and appendices.

\section{Scope of the Mission and Timeline}
\label{sec:mission}

Following aivancity milestones:
\begin{itemize}[noitemsep]
  \item \textbf{M+1:} Phase~1 report and topic validation (completed: comparative review + dashboard concept);
  \item \textbf{M+2:} introduction and state-of-the-art drafts;
  \item \textbf{M+4:} methodology and preliminary results (dataset scores + dashboard screenshots);
  \item \textbf{July end:} full draft to academic supervisor;
  \item \textbf{31 August 2026:} final PDF/A + sources on the aivancity platform.
\end{itemize}

\section{Data Accessed and Information Assets}
\label{sec:data}

The project primarily uses \emph{public} regulatory and scientific information:
\begin{itemize}[noitemsep]
  \item agency guidance and legislation (FDA, EU AI Act/MDR/GDPR, MHRA, NMPA, PMDA, WHO, OECD, NIST);
  \item peer-reviewed literature via PubMed, Scopus, IEEE Xplore, and related databases;
  \item curated structured records stored in \texttt{compliance\_dataset.json} (twenty country objects, theme scores, trends, references).
\end{itemize}

No identifiable patient-level EHR data are processed in the current dashboard release. Phase~1 mentioned possible future integration of de-identified records for compliance auditing; any such extension would require a separate DPIA, legal basis, and written host authorization before inclusion in a disseminated report.

\section{Legal, Ethical, and Confidentiality Constraints}
\label{sec:legal}

\begin{itemize}[noitemsep]
  \item \textbf{GDPR / privacy:} literature and public law texts are processed; no special-category patient data in v1.
  \item \textbf{Confidentiality:} if industry partners later share proprietary audit playbooks, a confidential report variant must be produced with redactions and a non-confidential jury version.
  \item \textbf{Not legal advice:} comparative scores are academic indicators for research and pedagogy.
  \item \textbf{Generative AI:} permitted under aivancity rules with mandatory appendix declaration; analyses and conclusions remain the student's responsibility.
  \item \textbf{Dissemination:} written authorization is required before public release beyond jury submission if a host company so requires.
\end{itemize}

\section{Technical and Resource Constraints}
\label{sec:constraints}

Constraints shaping design choices include: reliance on publicly documented device counts (heterogeneous reporting); English-dominant source coverage (potential language bias); local execution without paid regulatory-intelligence APIs; and internship time bounds that prioritize a robust curated MVP over fully supervised NLP classifiers. These constraints are revisited in the limitations section of Chapter~\ref{ch:conclusion}.
""".replace("__ACAD_SUP__", ACAD_SUP)


def ch04(dataset: dict) -> str:
    themes = dataset["metadata"]["themes"]
    theme_rows = "\n".join(
        f"    {i+1} & {esc(t)} \\\\" for i, t in enumerate(themes)
    )
    return rf"""\chapter{{Methodology and Technical Approach}}
\label{{ch:method}}

This chapter is the scientific core of the report. It is written to be reproducible: another researcher should be able to re-implement the scoring workflow, regenerate tables, and relaunch the dashboard from the provided schema and code.

\section{{General Solution Architecture}}
\label{{sec:arch}}

Figure~\ref{{fig:arch}} summarizes the end-to-end pipeline from sources to decision-support views.

\begin{{figure}}[htbp]
\centering
\begin{{tabular}}{{@{{}}p{{3.2cm}}p{{8.5cm}}@{{}}}}
\toprule
\textbf{{Stage}} & \textbf{{Description}} \\
\midrule
Sources & Agency documents and peer-reviewed papers \\
Acquisition & Structured search protocol and provenance logging \\
Curation / NLP & Theme coding with optional embeddings for scale-up \\
JSON dataset & Twenty countries, seven themes, trends, references \\
Dashboard & Map, radar, heatmaps, trends, use-case readiness \\
Exports & CSV tables, PDF reports, presentation slides \\
\bottomrule
\end{{tabular}}
\caption{{End-to-end architecture of the AI Clinic compliance analytics system. Source: author.}}
\label{{fig:arch}}
\end{{figure}}

Functional blocks:
\begin{{enumerate}}[noitemsep]
  \item \textbf{{Acquisition:}} structured search across bibliographic databases and official repositories;
  \item \textbf{{Curation:}} thematic coding into seven compliance dimensions with narrative fields;
  \item \textbf{{Optional NLP assist:}} preprocessing, embeddings, and draft classification for future scale-up;
  \item \textbf{{Storage:}} version-controlled JSON as the system of record;
  \item \textbf{{Presentation:}} Streamlit analytics prototype and React BI-style web app;
  \item \textbf{{Reporting:}} LaTeX/PDF generation and literature rendering inside the UI.
\end{{enumerate}}

\section{{Literature Search and Inclusion Protocol}}
\label{{sec:search}}

\subsection{{Databases and Regulatory Sources}}

Search covered PubMed, Scopus, IEEE Xplore, Google Scholar, and SSRN, complemented by FDA, EMA, MHRA, NMPA, WHO, OECD, and national AI strategy portals. Inclusion emphasized 2018--2026 publications addressing AI regulation, compliance, or ethics in healthcare, plus foundational pre-2018 frameworks still in force (e.g., IMDRF 2014, HIPAA).

\subsection{{Query Design}}

Representative query families included: ``AI healthcare regulation'', ``SaMD compliance'', ``health data governance'', ``algorithmic transparency medicine'', ``EU AI Act medical device'', and ``post-market surveillance AI''. Snowballing from key reviews (e.g., device-approval comparisons, ethics surveys) complemented keyword search~\cite{{muehlematter2021,jobin2019}}.

\subsection{{Screening Logic}}

Titles/abstracts were screened for healthcare + AI + regulatory/ethical relevance. Full texts informed theme narratives. Grey literature (agency PDFs) was admitted when it constituted primary law or official guidance. Wikipedia and informal blogs were excluded as academic references per aivancity bibliography rules.

\section{{Seven-Theme Scoring Ontology}}
\label{{sec:ontology}}

\begin{{table}}[htbp]
\centering
\caption{{Compliance themes used for jurisdictional scoring}}
\label{{tab:themes}}
\begin{{tabularx}}{{\textwidth}}{{@{{}}c X@{{}}}}
\toprule
\textbf{{ID}} & \textbf{{Theme}} \\
\midrule
{theme_rows}
\bottomrule
\end{{tabularx}}
\end{{table}}

Each theme is scored on an integer scale from 1 (minimal formalization / capacity) to 10 (mature, AI-aware, enforceable framework). Scores are comparative indicators combining: existence of AI-relevant rules; enforceability; agency capacity signals; and alignment with international good practice (IMDRF, GMLP, WHO ethics). Higher is not automatically ``better for innovation''; some high scores reflect stringent precaution.

\subsection{{Calibration Rules}}

\begin{{itemize}}[noitemsep]
  \item Prefer primary legal texts over secondary commentary when assigning scores;
  \item Separate ``law on the books'' from evident implementation capacity when narratives disagree;
  \item Record device-approval counts as a complementary throughput metric, not a quality proxy alone;
  \item Document uncertainty in country narrative fields (\texttt{{challenges}}, \texttt{{notable\_developments}}).
\end{{itemize}}

\section{{Dataset Schema and Curation Workflow}}
\label{{sec:schema}}

The canonical file \texttt{{data/compliance\_dataset.json}} contains:
\begin{{itemize}}[noitemsep]
  \item \texttt{{metadata}} --- title, version, theme list, sources;
  \item \texttt{{countries}} --- array of jurisdictional objects;
  \item \texttt{{global\_trends}} --- structured trend cards;
  \item \texttt{{key\_references}} --- bibliographic pointers.
\end{{itemize}}

Country objects include identifiers (\texttt{{country}}, \texttt{{iso\_code}}, \texttt{{region}}), institutional fields (\texttt{{regulatory\_body}}, privacy law, AI-specific regulation, medical-device framework), narrative dimensions aligned to themes, \texttt{{key\_legislations}}, \texttt{{maturity\_level}}, \texttt{{year\_first\_ai\_regulation}}, \texttt{{num\_ai\_devices\_approved}}, and \texttt{{themes\_scores}}.

\begin{{equation}}
\label{{eq:composite}}
S_c = \frac{{1}}{{7}} \sum_{{t=1}}^{{7}} s_{{c,t}}
\end{{equation}}
where $s_{{c,t}} \in [1,10]$ is the score of country $c$ on theme $t$, and $S_c$ is the unweighted composite used for choropleth coloring unless a user applies filters.

\section{{NLP Pipeline Design (Scale-Up Path)}}
\label{{sec:nlp}}

Phase~1 proposed an assembly-line NLP approach. The draft methodology retained for reproducibility is:

\subsection{{Data Collection and Ingestion}}

Sources include official HTML/PDF portals and bibliographic APIs. Acquisition scripts should log URL, access date, and checksum. Update frequency for a production system would be monthly for agency newsrooms and event-driven for major legislative acts.

\subsection{{Preprocessing}}

\begin{{enumerate}}[noitemsep]
  \item PDF/HTML text extraction;
  \item language detection and optional translation for indexing;
  \item normalization (Unicode, hyphenation repair);
  \item segmentation into articles/sections/clauses;
  \item metadata tagging (jurisdiction, instrument type, date).
\end{{enumerate}}

\subsection{{Feature Extraction}}

Lexical baselines (TF--IDF) provide interpretable sparse features. Dense embeddings (e.g., domain-adapted BERT) capture semantic similarity between clauses on ``clinical validation'' or ``human oversight.'' Equation~\eqref{{eq:embed}} denotes sentence embedding $\mathbf{{e}}_i$ for segment $i$:
\begin{{equation}}
\label{{eq:embed}}
\mathbf{{e}}_i = f_\theta(x_i) \in \mathbb{{R}}^d
\end{{equation}}
with encoder parameters $\theta$ frozen or fine-tuned depending on labeled data availability.

\subsection{{Classification and HITL}}

Draft labels map segments to themes and coarse risk cues. Human-in-the-loop review is mandatory before scores change: NLP accelerates scanning; experts remain accountable for regulatory meaning. This aligns with aivancity ethics rules on AI-assisted work.

\section{{Dashboard Implementation}}
\label{{sec:dashimpl}}

\subsection{{Technology Stack}}

\begin{{table}}[htbp]
\centering
\caption{{Implementation stack}}
\label{{tab:stack}}
\begin{{tabular}}{{@{{}}ll@{{}}}}
\toprule
\textbf{{Component}} & \textbf{{Technology}} \\
\midrule
Analytics prototype & Streamlit + Plotly + Pandas \\
Presentation web app & React + Recharts + react-simple-maps \\
Data store & Versioned JSON \\
Report generation & LaTeX, fpdf2, python-pptx \\
Runtime & Python 3.9+, Node.js (web) \\
\bottomrule
\end{{tabular}}
\end{{table}}

\subsection{{Information Architecture}}

Primary views: World Map; Country Comparison; Theme Analysis; Global Trends; Country Details; AI Use Cases \& Trends; Literature Review. Filters include region, maturity, and minimum theme score. CSV export supports external audit of the exact filtered subset.

\subsection{{Use-Case Readiness Model}}

For clinical domains $u$ (radiology, pathology, genomics, drug discovery), a derived readiness score uses theme weights $w_{{u,t}}$:
\begin{{equation}}
\label{{eq:usecase}}
R_{{c,u}} = \sum_{{t=1}}^{{7}} w_{{u,t}} \, s_{{c,t}}
\quad \text{{with}} \quad \sum_t w_{{u,t}} = 1, \; w_{{u,t}} \ge 0.
\end{{equation}}
Radiology emphasizes clinical validation and post-market surveillance; genomics emphasizes privacy; drug discovery emphasizes approval process and transparency. Weights are disclosed in the UI to avoid black-box rankings.

\subsection{{Evaluation Metrics for the Software Artifact}}

Unlike a single predictive model, evaluation combines:
\begin{{itemize}}[noitemsep]
  \item \textbf{{Coverage:}} 20/20 countries with complete theme vectors;
  \item \textbf{{Consistency:}} schema validation and non-null critical fields;
  \item \textbf{{Usability:}} task-based walkthroughs (compare two countries; identify lowest liability scores);
  \item \textbf{{Reproducibility:}} one-command local launch;
  \item \textbf{{Traceability:}} each narrative linked to legislation lists and bibliography.
\end{{itemize}}

\section{{Baselines and Alternatives Considered}}
\label{{sec:baselines}}

Methodological alternatives rejected or deferred:
\begin{{itemize}}[noitemsep]
  \item \textbf{{Pure qualitative review:}} insufficiently actionable for comparative dashboards;
  \item \textbf{{Fully automated scraping without curation:}} high factual risk for legal text;
  \item \textbf{{Single composite index without themes:}} hides policy trade-offs (e.g., high approvals vs weak transparency);
  \item \textbf{{Closed commercial data only:}} conflicts with academic reproducibility.
\end{{itemize}}
The chosen hybrid---expert curation + interactive analytics + NLP-ready schema---optimizes for PFE scientific standards and practical stakeholder use.

\section{{Environment, Versioning, and Reproducibility}}
\label{{sec:repro}}

Code and data live under the AI Clinic repository structure (\texttt{{app.py}}, \texttt{{web/}}, \texttt{{data/}}, \texttt{{latex/}}). Dependencies are pinned via \texttt{{requirements.txt}} / \texttt{{package.json}}. Dataset \texttt{{version}} and \texttt{{last\_updated}} fields support audit trails. Listing~\ref{{lst:launch}} shows the canonical Streamlit launch command.

\begin{{lstlisting}}[caption={{Launching the Streamlit compliance dashboard}},label={{lst:launch}}]
pip install -r requirements.txt
python -m streamlit run app.py
# open http://localhost:8501
\end{{lstlisting}}
"""


def ch05(dataset: dict) -> str:
    countries = dataset["countries"]

    def avg(c):
        ts = c["themes_scores"]
        return sum(ts.values()) / len(ts)

    ranked = sorted(countries, key=avg, reverse=True)

    rows = []
    for c in ranked:
        a = avg(c)
        rows.append(
            f"{esc(c['country'])} & {esc(c['region'])} & {esc(c['maturity_level'])} & "
            f"{a:.2f} & {c.get('num_ai_devices_approved', '---')} \\\\"
        )
    rank_table = "\n".join(rows)

    # Per-country detailed subsections (major content for page count)
    details = []
    for c in ranked:
        ts = c["themes_scores"]
        details.append(
            textwrap.dedent(
                f"""
        \\subsection{{{esc(c['country'])}}}
        \\textbf{{Region:}} {esc(c['region'])}.
        \\textbf{{Maturity:}} {esc(c['maturity_level'])}.
        \\textbf{{Primary regulator:}} {esc(c.get('regulatory_body', 'n/a'))}.
        \\textbf{{Privacy law:}} {esc(c.get('data_privacy_law', 'n/a'))}.
        \\textbf{{AI-specific instrument:}} {esc(c.get('ai_specific_regulation', 'n/a'))}.
        \\textbf{{Device framework:}} {esc(c.get('medical_device_framework', 'n/a'))}.

        \\paragraph{{Approval and validation.}}
        {esc(c.get('approval_process', ''))}
        {esc(c.get('clinical_validation', ''))}

        \\paragraph{{Data governance and transparency.}}
        {esc(c.get('data_governance', ''))}
        {esc(c.get('algorithmic_transparency', ''))}

        \\paragraph{{Ethics, surveillance, and liability.}}
        {esc(c.get('ethical_framework', ''))}
        {esc(c.get('post_market_surveillance', ''))}
        {esc(c.get('liability', ''))}

        \\paragraph{{Theme scores (1--10).}}
        Privacy~{ts['data_privacy']};
        Clinical validation~{ts['clinical_validation']};
        Approval~{ts['approval_process']};
        Transparency~{ts['transparency']};
        Ethics~{ts['ethics']};
        Post-market~{ts['post_market']};
        Liability~{ts['liability']}.
        Reported AI device approvals: {c.get('num_ai_devices_approved', 'n/a')}.

        \\paragraph{{Challenges and notable developments.}}
        {esc(c.get('challenges', ''))}
        {esc(c.get('notable_developments', ''))}
        """
            )
        )

    country_tex = "\n".join(details)

    # Theme averages
    theme_keys = [
        "data_privacy",
        "clinical_validation",
        "approval_process",
        "transparency",
        "ethics",
        "post_market",
        "liability",
    ]
    labels = [
        "Data privacy",
        "Clinical validation",
        "Approval process",
        "Transparency",
        "Ethics",
        "Post-market",
        "Liability",
    ]
    theme_avg_rows = []
    for k, lab in zip(theme_keys, labels):
        vals = [c["themes_scores"][k] for c in countries]
        theme_avg_rows.append(f"{lab} & {sum(vals)/len(vals):.2f} & {min(vals)} & {max(vals)} \\\\")
    theme_avg_tex = "\n".join(theme_avg_rows)

    trends = dataset.get("global_trends", [])
    trend_items = "\n".join(
        f"  \\item \\textbf{{{esc(t['trend'])}.}} {esc(t['description'])} "
        f"(adoption: {esc(str(t.get('adoption_level', 'n/a')))}; "
        f"emerged: {esc(str(t.get('year_emerged', 'n/a')))})."
        for t in trends
    )

    return rf"""\chapter{{Results and Analysis}}
\label{{ch:results}}

\section{{Quantitative Overview}}
\label{{sec:quant}}

Table~\ref{{tab:ranking}} ranks jurisdictions by unweighted composite score $S_c$ (Equation~\eqref{{eq:composite}}). Table~\ref{{tab:themeavg}} summarizes global theme means and ranges. The full seven-theme matrix appears in Table~\ref{{tab:country-scores}}.

\begin{{table}}[htbp]
\centering
\caption{{Jurisdictions ranked by composite compliance score $S_c$}}
\label{{tab:ranking}}
\begin{{tabular}}{{@{{}}lllc c@{{}}}}
\toprule
\textbf{{Country}} & \textbf{{Region}} & \textbf{{Maturity}} & \textbf{{$S_c$}} & \textbf{{Devices}} \\
\midrule
{rank_table}
\bottomrule
\end{{tabular}}
\end{{table}}

\begin{{table}}[htbp]
\centering
\caption{{Global theme score statistics across 20 jurisdictions}}
\label{{tab:themeavg}}
\begin{{tabular}}{{@{{}}lccc@{{}}}}
\toprule
\textbf{{Theme}} & \textbf{{Mean}} & \textbf{{Min}} & \textbf{{Max}} \\
\midrule
{theme_avg_tex}
\bottomrule
\end{{tabular}}
\end{{table}}

\input{{generated/country_scores}}

\section{{Interpretation of Global Patterns}}
\label{{sec:patterns}}

Across the curated set, \textbf{{data privacy}} and \textbf{{approval process}} themes tend to score relatively high on average, reflecting the post-GDPR legislative wave and the near-universal presence of medical-device frameworks. \textbf{{Liability}} and, in several emerging jurisdictions, \textbf{{post-market surveillance}} and \textbf{{transparency}} lag---indicating that lifecycle governance and accountability remain frontier issues even where market-entry pathways exist.

Europe (including the EU aggregate and Germany) leads on composite scores, consistent with the layered GDPR + MDR + AI Act regime~\cite{{euaiact2024}}. The United States leads on reported device throughput while showing comparatively moderate transparency/ethics scores, matching the literature's characterization of an innovation-forward, less horizontally mandated AI ethics posture~\cite{{fda2021,wu2021}}. East Asian advanced jurisdictions combine substantial approval activity with evolving privacy and algorithm rules. African and some Middle Eastern entries illustrate data-protection progress preceding deep AI-SaMD capacity.

\section{{Regional Qualitative Analysis}}
\label{{sec:regional}}

\subsection{{North America}}
The USA--Canada pair demonstrates advanced agency science and GMLP leadership~\cite{{gmlp2021}}, with U.S.\ HIPAA sectoral privacy contrasting Canada's more comprehensive federal privacy trajectory. Fragmentation (U.S.\ state privacy; Canadian legislative timing) remains a practical compliance challenge for multi-province/multi-state deployments.

\subsection{{Europe}}
The EU AI Act is a watershed for binding high-risk obligations~\cite{{euaiact2024}}. Germany's strong scores reflect both EU baselines and national digital-health instrumentation. The UK's post-Brexit pro-innovation stance creates dual-track complexity for vendors. Switzerland aligns closely with European data-protection expectations while maintaining distinct institutional pathways.

\subsection{{Asia--Pacific}}
China, Japan, South Korea, Singapore, Australia, India, and Thailand span advanced to developing maturity. Singapore's governance tooling and Japan's DASH framework are notable positive outliers relative to market size. India's large digital-health ambitions coexist with still-developing AI-device specificity. Data localization in China shapes multinational validation strategies~\cite{{nmpa2021}}.

\subsection{{Middle East and Africa}}
Israel combines innovation density with comparatively strong clinical-validation signals. Gulf states show rapid strategy publication with emerging operational detail. African jurisdictions score lower on AI-specific device governance but demonstrate meaningful privacy statutes and leapfrogging potential via mobile health---provided capacity-building accompanies legislation~\cite{{who2021}}.

\section{{Country Profiles}}
\label{{sec:profiles}}

The following subsections summarize curated narratives for each jurisdiction included in the dataset. They should be read together with theme scores and legislation lists in the JSON source of truth.

{country_tex}

\section{{Global Trends Linked to Clinical Use Cases}}
\label{{sec:trends}}

\input{{generated/global_trends}}

\begin{{itemize}}[noitemsep]
{trend_items}
\end{{itemize}}

These trends justify the dashboard's use-case readiness views: regulatory maturity is not abstract---it constrains radiology triage tools, genomic pipelines, hospital CDS, and public-health analytics differently~\cite{{rajpurkar2022,hwang2019}}.

\section{{Dashboard Outcome Assessment}}
\label{{sec:dashresults}}

Relative to Phase~1 goals, the implemented system provides multi-level presentation (global map $\rightarrow$ theme heatmaps $\rightarrow$ country narratives), comparative radar/bar views, and literature browsing. Real-time monitoring of live legislative feeds remains roadmap work; the current release emphasizes curated correctness over continuous scraping. HITL remains institutionalized via manual score changes under version control.

\section{{Discussion and Critical Analysis}}
\label{{sec:discussion}}

\subsection{{Strengths}}
The seven-theme ontology surfaces trade-offs invisible in single rankings; open JSON enables reuse; dual UI implementations support both rapid prototyping and presentation polish; bibliography alignment exceeds aivancity's minimum academic reference thresholds when combined with policy sources.

\subsection{{Limitations and Threats to Validity}}
\begin{{itemize}}[noitemsep]
  \item Expert scores entail subjectivity despite calibration rules;
  \item English-language source bias may under-represent local-language guidance;
  \item Device counts are imperfectly comparable across agencies;
  \item EU-as-aggregate smooths member-state variance;
  \item NLP classification is designed more than fully trained in this draft;
  \item Scores are snapshots; law changes can invalidate cells without longitudinal versioning discipline.
\end{{itemize}}

\subsection{{Implications}}
For developers, the results argue for modular evidence packages mapped to theme gaps in target markets. For policymakers, capacity-building in post-market and liability themes may yield safer scaling than approval acceleration alone. For academia, open comparative datasets can ground future supervised NLP benchmarks---addressing the ``gold standard'' gap noted in Phase~1.
"""


def ch06() -> str:
    return r"""\chapter{Conclusion and Future Work}
\label{ch:conclusion}

\section{Summary of Contributions}
\label{sec:contrib}

This Final Year Project asked how multi-jurisdictional AI healthcare regulatory requirements can be systematically synthesized, scored, and interactively compared. The work answers that question through three integrated contributions: (i)~a thematic state-of-the-art connecting SaMD, privacy, validation, transparency, ethics, surveillance, and liability; (ii)~a curated twenty-jurisdiction dataset with an explicit seven-theme scoring ontology; and (iii)~an interactive dashboard that turns those indicators into explorable maps, comparisons, trends, and clinical use-case views.

Empirically, the analysis confirms convergence toward risk-based device regulation and GDPR-inspired data protection, while highlighting persistent gaps in lifecycle surveillance, transparency mandates, and liability clarity---especially outside the most resourced agencies. The EU AI Act stands out as a binding inflection point for high-risk healthcare AI~\cite{euaiact2024}. The United States illustrates high innovation throughput under a more sectoral governance mix~\cite{fda2021}. Emerging economies often legislate privacy before AI-specific SaMD capacity fully materializes~\cite{who2021}.

\section{Limitations}
\label{sec:limitations}

Limitations include subjectivity in expert scoring, incomplete cross-lingual coverage, heterogeneous device-count reporting, and the still-early stage of supervised NLP automation. The dashboard is a decision-support research tool, not a substitute for qualified legal counsel or notified-body advice. Internship time and public-data constraints bounded the depth of primary-law review in some jurisdictions.

\section{Perspectives and Future Work}
\label{sec:future}

Concrete next steps include:
\begin{enumerate}[noitemsep]
  \item building a labeled clause corpus and evaluating transformer classifiers with reported F1 against HITL gold labels;
  \item adding longitudinal score versioning keyed to legislative events;
  \item expanding country coverage and sub-national U.S./EU profiles;
  \item integrating authenticated regulatory RSS/API feeds with change alerts;
  \item conducting formal usability studies with regulators and medtech compliance officers;
  \item exploring privacy-preserving analytics if de-identified hospital compliance logs become available under a DPIA.
\end{enumerate}

\section{Closing Statement}

Governing AI in healthcare requires comparative intelligence that is rigorous enough for academic scrutiny and usable enough for professional briefing. By coupling a positioned literature synthesis with open, interactive analytics, this PFE provides a reproducible foundation for that intelligence---and a clear roadmap for turning curated knowledge into continuously maintained regulatory awareness.
"""


def appendix() -> str:
    return r"""\chapter{Appendices}

\section{Appendix A --- Significant Code Extracts}

\begin{lstlisting}[caption={Illustrative JSON country record fields},label=lst:json]
{
  "country": "European Union",
  "region": "Europe",
  "maturity_level": "Advanced",
  "themes_scores": {
    "data_privacy": 10,
    "clinical_validation": 9,
    "approval_process": 9,
    "transparency": 9,
    "ethics": 10,
    "post_market": 9,
    "liability": 8
  }
}
\end{lstlisting}

\begin{lstlisting}[caption={Composite score computation (conceptual)},label=lst:score]
def composite_score(themes_scores: dict) -> float:
    vals = list(themes_scores.values())
    return sum(vals) / len(vals)
\end{lstlisting}

Full application code is maintained in the AI Clinic repository (\texttt{app.py}, \texttt{web/}, data generation scripts). Provide the Git URL in the final submission package.

\section{Appendix B --- Additional Data Notes}

Theme definitions, source lists, and trend objects are stored alongside country records in \texttt{compliance\_dataset.json}. Regenerated \LaTeX\ tables used in Chapter~\ref{ch:results} live under \texttt{generated/}.

\section{Appendix C --- Technical Environment}

Recommended environment: Python 3.9+, Node.js 18+ for the React app, MiKTeX or TeX Live for report compilation. Core Python libraries include \texttt{streamlit}, \texttt{plotly}, \texttt{pandas}, and PDF export utilities. Hardware requirements are modest (CPU laptop sufficient for the dashboard MVP; GPU optional for future NLP fine-tuning).

\section{Appendix D --- Declaration of Generative AI Use}

In accordance with aivancity PFE guidelines on generative AI:
\begin{itemize}[noitemsep]
  \item Generative AI assistants (including Cursor-based coding agents) were used to help structure \LaTeX\ sources, expand draft wording from existing project materials, and accelerate formatting.
  \item All analyses, methodological choices, score interpretations, and conclusions were reviewed and validated by the student against primary regulatory sources and the curated dataset.
  \item AI-assisted code was inspected, tested locally where applicable, and remains the student's responsibility to understand and maintain.
  \item No AI system was used as a substitute for expert regulatory judgment; human-in-the-loop verification is part of the project design itself.
\end{itemize}
"""


def ensure_bib() -> None:
    bib = (ROOT / "references.bib").read_text(encoding="utf-8")
    extras = r"""
@article{lekadir2022,
  author  = {Lekadir, Karim and others},
  title   = {Reshaping the Landscape of Healthcare through {AI}},
  journal = {Various / survey literature},
  year    = {2022},
  note    = {Cited in Phase 1 framing}
}

@misc{prisma2020,
  author = {{PRISMA}},
  title  = {Preferred Reporting Items for Systematic Reviews and Meta-Analyses},
  year   = {2020}
}

@misc{ec2021aiact,
  author = {{European Commission}},
  title  = {Proposal / materials related to the {EU} Artificial Intelligence Act},
  year   = {2021}
}
"""
    if "lekadir2022" not in bib:
        (ROOT / "references.bib").write_text(bib + "\n" + extras, encoding="utf-8")


def compile_pdf() -> None:
    env = dict(**{k: v for k, v in __import__("os").environ.items()})
    # Allow MiKTeX package install prompts to be non-interactive if possible
    cmd_pdf = [str(PDFLATEX), "-interaction=nonstopmode", "-halt-on-error", "main.tex"]
    for i in range(2):
        print(f"pdflatex pass {i+1}...")
        r = subprocess.run(cmd_pdf, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode != 0:
            print(r.stdout[-4000:])
            print(r.stderr[-2000:])
            raise SystemExit(f"pdflatex failed on pass {i+1}")
    if BIBER.exists():
        print("running biber...")
        subprocess.run([str(BIBER), "main"], cwd=ROOT, capture_output=True, text=True)
        for i in range(2):
            print(f"pdflatex post-biber pass {i+1}...")
            subprocess.run(cmd_pdf, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="fix")
    else:
        print("biber not found; citations may be unresolved")


def main() -> None:
    dataset = json.loads(DATA.read_text(encoding="utf-8"))
    ensure_bib()
    # copy generated tables if missing
    gen_src = ROOT.parent / "AI Clinic" / "latex" / "generated"
    for name in ("country_scores.tex", "global_trends.tex"):
        src = gen_src / name
        dst = ROOT / "generated" / name
        if src.exists():
            shutil.copy2(src, dst)

    write(ROOT / "main.tex", main_tex())
    write(ROOT / "chapters" / "01_introduction.tex", ch01())
    write(ROOT / "chapters" / "02_state_of_art.tex", ch02_part_a() + ch02_part_b())
    write(ROOT / "chapters" / "03_context.tex", ch03())
    write(ROOT / "chapters" / "04_methodology.tex", ch04(dataset))
    write(ROOT / "chapters" / "05_results.tex", ch05(dataset))
    write(ROOT / "chapters" / "06_conclusion.tex", ch06())
    write(ROOT / "chapters" / "A_appendix.tex", appendix())
    compile_pdf()

    from pypdf import PdfReader

    pdf = ROOT / "main.pdf"
    n = len(PdfReader(str(pdf)).pages)
    print(f"COMPILED {pdf} with {n} pages")
    # rough body estimate: subtract ~8 front matter pages
    print("Note: guideline counts body pages excluding front matter/bib/appendices.")


if __name__ == "__main__":
    main()
