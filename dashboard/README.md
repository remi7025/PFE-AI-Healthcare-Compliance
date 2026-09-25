# AI Healthcare Compliance Dashboard

Interactive dashboard for the aivancity PGE5 final project: AI healthcare compliance and regulations across 20 jurisdictions.

## Features

- **Theme weight sliders** — live recompute of composite Sc, choropleth, and rankings (React + Streamlit)
- **Diff view** — side-by-side jurisdictional score/pathway deltas
- **URL sync** — shareable React links (`?tab=&region=&maturity=&themes=&country=&q=&cb=`)
- **Exports** — CSV, Excel workbook, printable PDF country dossier
- **RAG** — citation popovers, statute deep-links, prompt chips, HITL feedback queue; optional hybrid RRF API
- **Visuals** — Sc vs device throughput separation, IMDRF Sankey pathway, Viridis/ColorBrewer palettes, historical timeline slider
- **Validation** — Zod (React) + Pydantic (Python) block scores outside 1–10

## Run (local)

Streamlit:

```bash
pip install streamlit pandas plotly pydantic openpyxl
streamlit run app.py
```

React:

```bash
cd web
npm install
npm run dev
```

Optional RAG API (hybrid BM25 + MiniLM/FAISS RRF):

```bash
pip install -r api/requirements.txt
# optional dense: pip install sentence-transformers faiss-cpu
uvicorn rag_server:app --app-dir api --reload --port 8000
```

Set `VITE_RAG_API=http://localhost:8000` before `npm run dev` to call the API from React.

## Docker (single command)

```bash
docker compose up --build
```

- React: http://localhost:4173  
- Streamlit: http://localhost:8501  
- RAG API: http://localhost:8000/api/health  
