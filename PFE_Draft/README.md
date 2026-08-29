# PFE Draft — AI Healthcare Compliance Dashboard

**Student:** Remi Uttejitha Allam  
**Academic supervisor:** Prof. Anuradha Kar  
**Host / school:** aivancity  
**Programme:** PGE5 — AI & Data Science (2025–2026)  
**Status:** Supervisor review draft

## Files

| File | Description |
|------|-------------|
| `PFE_PGE5_REMI_AI_Healthcare_Compliance_DRAFT.pdf` | Compiled draft (also copied to repo root) |
| `main.tex` | Root LaTeX document (aivancity structure) |
| `chapters/` | Introduction, SotA, Context, Methodology, Results, Conclusion, Appendices |
| `references.bib` | IEEE-style bibliography (biblatex) |
| `generated/` | Auto tables (country scores, trends) |
| `build_pfe_draft.py` | Optional regenerator from AI Clinic dataset |

## Compile

```powershell
cd "PFE_Draft"
pdflatex -interaction=nonstopmode main.tex
biber main
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
```

## Before final submission

1. Exact submission / defence dates on the cover  
2. Git repository URL in Appendix A  

## Guideline mapping

Mandatory structure followed: cover, acknowledgements, FR résumé + EN abstract, TOC, lists, abbreviations, Ch.1–6, bibliography, appendices (incl. generative-AI declaration).  
Target body length: **60–90 pages** excluding front matter, bibliography, and appendices.
