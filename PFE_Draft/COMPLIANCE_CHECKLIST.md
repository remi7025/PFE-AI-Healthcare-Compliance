# aivancity PGE5 PFE — LaTeX compliance map

Sources of truth:
- `PFE_guideline_aivancity_EN.pdf` (Writing Guidelines)
- `PFE_Template_aivancity_EN.pdf` (Template EN)
- ENP-style LaTeX conventions: https://www.overleaf.com/latex/templates/enp-pfe-template/tdnwjcvfzpfw

## Mandatory structure (Guidelines §2.2)

| # | Required element | Implementation |
|---|------------------|----------------|
| 1 | Cover page (template) | `main.tex` title page + aivancity logo |
| 2 | Acknowledgements (≤1 p.) | `\chapter*{Acknowledgements}` |
| 3 | Abstract EN + Résumé FR (250–300 words, keywords) | Front matter chapters |
| 4 | Table of Contents | `\tableofcontents` |
| 5 | List of Figures | `\listoffigures` |
| 6 | List of Tables | `\listoftables` |
| 7 | List of Abbreviations | dedicated front-matter chapter |
| 8 | Introduction (3–5 pp.) | `chapters/01_introduction.tex` |
| 9 | State of the Art (10–15 pp.) | `chapters/02_state_of_art.tex` |
| 10 | Project Context and Scope (5–8 pp.) | `chapters/03_context.tex` |
| 11 | Methodology and Technical Approach (15–20 pp.) | `04_methodology` + AI + RAG sections |
| 12 | Results and Analysis (10–15 pp.) | `chapters/05_results.tex` |
| 13 | Conclusion and Future Work (3–5 pp.) | `chapters/06_conclusion.tex` |
| 14 | Bibliography (IEEE, ≥20 refs) | `references.bib` + biblatex ieee |
| 15 | Appendices A, B, C… | code / env / GenAI / country profiles |

## Format (Guidelines §2.1 / §4)

- A4, Latin Modern 12 pt, 1.5 line spacing
- Margins: 2.5 cm top/bottom/outer, 3 cm inner
- Roman numerals (front) → Arabic (body)
- Headers/footers on all pages
- Figure/Table captions: `X.Y -- description` (per-chapter numbering)
- IEEE numeric citations

## Build

```bash
cd PFE_Draft
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

Output: `main.pdf` (also copied to `../PFE_PGE5_REMI_AI_Healthcare_Compliance_DRAFT.pdf`)
