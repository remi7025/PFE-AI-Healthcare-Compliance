# AI Healthcare Compliance — PFE (Final Year Project)

**Student:** Remi Uttejitha Allam  
**Programme:** aivancity Grande École PGE5 — AI & Data Science  
**Academic tutor:** Prof. Anuradha Kar  

**Title:** A Literature Review and Interactive Dashboard on AI for Healthcare Compliance and Regulations across Countries

This repository is the **dedicated PFE project** — separate from any other work (e.g. AI Clinic). It contains the final report, dashboard source code, dataset, and literature review.

## Links

| Resource | URL |
|----------|-----|
| **GitHub repository** | https://github.com/remi7025/PFE-AI-Healthcare-Compliance |
| **Live dashboard** | https://remi7025.github.io/PFE-AI-Healthcare-Compliance/ |

## Contents

- [`PFE.pdf`](PFE.pdf) — final project report
- [`PFE_PGE5_ALLAM_Remi_2026.pdf`](PFE_PGE5_ALLAM_Remi_2026.pdf) — submission copy
- [`dashboard/`](dashboard/) — Streamlit + React dashboard and dataset
- [`PFE_Draft/`](PFE_Draft/) — LaTeX sources (local build; excluded from git by default)

## Run the dashboard

```bash
cd dashboard
pip install -r requirements.txt
streamlit run app.py
```

React UI (Power BI–style):

```bash
cd dashboard/web
npm install
npm run dev
```

Build for GitHub Pages:

```bash
cd dashboard/web
npm run build
```

## Citation

Remi Uttejitha Allam (2026). *A Literature Review and Interactive Dashboard on AI for Healthcare Compliance and Regulations across Countries.* aivancity PGE5 Final Year Project.
