"""
Hybrid RAG API: BM25 (lexical) + dense embeddings (MiniLM when available) fused via RRF.
Falls back to lexical-only if sentence-transformers / faiss are not installed.
Semantic distance gating abstains when top similarity is below threshold.
"""
from __future__ import annotations

import json
import math
import re
import time
from collections import Counter
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from schemas import validate_dataset_file

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "compliance_dataset.json"
LIT_PATH = Path(__file__).resolve().parent.parent / "literature_review.md"
COSINE_GATE = 0.42
LEXICAL_GATE = 0.35
RRF_K = 60

app = FastAPI(title="AI Healthcare Compliance RAG API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOP = set(
    "a an the and or of to in on for with by from as is are was were be been being "
    "this that these those it its into about over under than then so if what which "
    "who how when where why can could should would may might will shall not no yes "
    "do does did done have has had having".split()
)

_corpus: list[dict[str, Any]] = []
_dense = None  # optional (model, index, embeddings)


def tokenize(text: str) -> list[str]:
    toks = re.sub(r"[^a-z0-9\s\-]", " ", text.lower()).split()
    return [t for t in toks if len(t) > 2 and t not in STOP]


def build_corpus() -> list[dict[str, Any]]:
    validate_dataset_file(DATA_PATH)
    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    chunks: list[dict[str, Any]] = []
    for c in raw["countries"]:
        country = c["country"]
        iso = c["iso_code"]
        scores = c["themes_scores"]
        fields = {
            "data_privacy": c.get("data_governance", ""),
            "clinical_validation": c.get("clinical_validation", ""),
            "approval_process": c.get("approval_process", ""),
            "transparency": c.get("algorithmic_transparency", ""),
            "ethics": c.get("ethical_framework", ""),
            "post_market": c.get("post_market_surveillance", ""),
            "liability": c.get("liability", ""),
        }
        laws = ", ".join(c.get("key_legislations", []))
        for theme, text in fields.items():
            if not text:
                continue
            chunks.append(
                {
                    "id": f"{iso}::{theme}",
                    "source": f"{country} curated narrative",
                    "jurisdiction": country,
                    "theme": theme,
                    "text": (
                        f"{country} ({c['region']}, {c['maturity_level']}). "
                        f"{theme.replace('_', ' ')}: {text}. Key laws: {laws}. "
                        f"Theme score: {scores.get(theme)}."
                    ),
                }
            )
        if c.get("notable_developments"):
            chunks.append(
                {
                    "id": f"{iso}::notable",
                    "source": f"{country} notable developments",
                    "jurisdiction": country,
                    "theme": "overview",
                    "text": f"{country}: {c['notable_developments']}. Challenges: {c.get('challenges', '')}",
                }
            )
    if LIT_PATH.exists():
        lit = LIT_PATH.read_text(encoding="utf-8")
        paras = [p.strip() for p in re.split(r"\n{2,}", lit) if len(p.strip()) > 80]
        for i, p in enumerate(paras[:80]):
            chunks.append(
                {
                    "id": f"lit::{i}",
                    "source": "Thematic literature review",
                    "jurisdiction": "Multi",
                    "theme": "literature",
                    "text": p[:900],
                }
            )
    return chunks


def try_build_dense(chunks: list[dict[str, Any]]):
    try:
        import numpy as np
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        texts = [c["text"] for c in chunks]
        emb = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        emb = np.asarray(emb, dtype="float32")
        index = None
        try:
            import faiss

            index = faiss.IndexFlatIP(emb.shape[1])
            index.add(emb)
        except Exception:
            index = None
        return {"model": model, "emb": emb, "index": index}
    except Exception as exc:  # noqa: BLE001
        print(f"[rag] Dense index unavailable ({exc}); using lexical+RRF fallback.")
        return None


def bm25_rank(query: str, chunks: list[dict[str, Any]], k: int = 20) -> list[tuple[int, float]]:
    q = tokenize(query)
    if not q:
        return []
    N = len(chunks)
    df: Counter[str] = Counter()
    docs_toks = []
    for c in chunks:
        toks = tokenize(c["text"])
        docs_toks.append(toks)
        df.update(set(toks))
    avgdl = sum(len(t) for t in docs_toks) / max(1, N)
    k1, b = 1.5, 0.75
    scores: list[tuple[int, float]] = []
    for i, toks in enumerate(docs_toks):
        tf = Counter(toks)
        dl = len(toks) or 1
        s = 0.0
        for term in q:
            if term not in tf:
                continue
            n_qi = df[term]
            idf = math.log(1 + (N - n_qi + 0.5) / (n_qi + 0.5))
            freq = tf[term]
            s += idf * (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * dl / avgdl))
        if s > 0:
            scores.append((i, s))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:k]


def dense_rank(query: str, k: int = 20) -> list[tuple[int, float]]:
    if _dense is None:
        return []
    import numpy as np

    q = _dense["model"].encode([query], normalize_embeddings=True)
    q = np.asarray(q, dtype="float32")
    if _dense["index"] is not None:
        sims, idxs = _dense["index"].search(q, k)
        return [(int(i), float(s)) for i, s in zip(idxs[0], sims[0]) if i >= 0]
    sims = (_dense["emb"] @ q[0]).tolist()
    ranked = sorted(enumerate(sims), key=lambda x: x[1], reverse=True)[:k]
    return [(i, float(s)) for i, s in ranked]


def rrf_fuse(
    lists: list[list[tuple[int, float]]], k: int = RRF_K
) -> list[tuple[int, float]]:
    scores: dict[int, float] = {}
    for lst in lists:
        for rank, (idx, _) in enumerate(lst):
            scores[idx] = scores.get(idx, 0.0) + 1.0 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)


class QueryIn(BaseModel):
    question: str = Field(..., min_length=3)
    k: int = Field(6, ge=1, le=20)
    theme: Optional[str] = None
    jurisdiction: Optional[str] = None


class CitationOut(BaseModel):
    id: str
    source: str
    jurisdiction: str
    theme: str
    score: float
    snippet: str


class QueryOut(BaseModel):
    answer: str
    citations: list[CitationOut]
    latencyMs: int
    mode: str
    abstained: bool = False
    topScore: float = 0.0


@app.on_event("startup")
def startup():
    global _corpus, _dense
    _corpus = build_corpus()
    _dense = try_build_dense(_corpus)
    print(f"[rag] corpus={len(_corpus)} dense={'yes' if _dense else 'no'}")


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "chunks": len(_corpus),
        "dense": _dense is not None,
        "cosine_gate": COSINE_GATE,
    }


@app.post("/api/rag/query", response_model=QueryOut)
def rag_query(body: QueryIn):
    t0 = time.perf_counter()
    candidates = _corpus
    if body.theme:
        candidates = [
            c
            for c in candidates
            if c["theme"] == body.theme or c["theme"] == "literature"
        ]
    if body.jurisdiction:
        j = body.jurisdiction.lower()
        candidates = [
            c
            for c in candidates
            if j in c["jurisdiction"].lower()
            or c["jurisdiction"] == "Multi"
            or j in c["text"].lower()
        ]
    # map candidate indices back to global corpus indices
    id_to_global = {id(c): i for i, c in enumerate(_corpus)}
    cand_global = [id_to_global[id(c)] for c in candidates]

    # Restrict BM25/dense to candidate subset via temporary remapping
    sub = candidates
    bm = bm25_rank(body.question, sub, k=max(body.k * 3, 12))
    # remap sub-index → global
    bm_g = [(cand_global[i], s) for i, s in bm]

    dn_g: list[tuple[int, float]] = []
    if _dense is not None:
        # dense over full corpus then filter
        dn_full = dense_rank(body.question, k=40)
        allowed = set(cand_global)
        dn_g = [(i, s) for i, s in dn_full if i in allowed][: max(body.k * 3, 12)]

    fused = rrf_fuse([bm_g, dn_g] if dn_g else [bm_g])[: body.k]

    top_dense = dn_g[0][1] if dn_g else 0.0
    top_lex = bm_g[0][1] if bm_g else 0.0
    # normalize lexical roughly
    lex_norm = min(1.0, top_lex / 8.0) if top_lex else 0.0
    gate_score = top_dense if dn_g else lex_norm
    gate = COSINE_GATE if dn_g else LEXICAL_GATE

    if not fused or gate_score < gate:
        return QueryOut(
            answer="Insufficient evidence in the indexed corpus",
            citations=[],
            latencyMs=int((time.perf_counter() - t0) * 1000),
            mode="abstain",
            abstained=True,
            topScore=round(gate_score, 4),
        )

    citations: list[CitationOut] = []
    for idx, rrf_s in fused:
        c = _corpus[idx]
        citations.append(
            CitationOut(
                id=c["id"],
                source=c["source"],
                jurisdiction=c["jurisdiction"],
                theme=c["theme"],
                score=round(rrf_s, 4),
                snippet=c["text"],
            )
        )

    lines = [
        f'Grounded answer (hybrid RRF) for: “{body.question.strip()}”',
        "",
        "Based on the highest-ranked curated passages:",
    ]
    for i, h in enumerate(citations[:3], 1):
        snip = h.snippet[:220] + ("…" if len(h.snippet) > 220 else "")
        lines.append(f"{i}. [{h.id}] {h.jurisdiction} / {h.theme}: {snip}")
    lines.append("")
    lines.append(
        "Citations are drawn only from the project corpus. Not legal advice."
    )

    return QueryOut(
        answer="\n".join(lines),
        citations=citations,
        latencyMs=int((time.perf_counter() - t0) * 1000),
        mode="hybrid-rrf",
        abstained=False,
        topScore=round(gate_score, 4),
    )


@app.post("/api/feedback")
def feedback(payload: dict[str, Any]):
    """Append curator feedback to a local review queue file."""
    queue_path = Path(__file__).resolve().parent / "review_queue.jsonl"
    with queue_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    return {"ok": True}
