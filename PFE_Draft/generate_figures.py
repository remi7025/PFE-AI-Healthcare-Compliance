"""Generate report figures and summary tables from compliance_dataset.json."""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "compliance_dataset.json"
FIG = ROOT / "figures"
GEN = ROOT / "generated"

THEME_KEYS = [
    ("data_privacy", "Privacy"),
    ("clinical_validation", "Clinical"),
    ("approval_process", "Approval"),
    ("transparency", "Transparency"),
    ("ethics", "Ethics"),
    ("post_market", "Post-market"),
    ("liability", "Liability"),
]

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.titlesize": 11,
    "axes.labelsize": 9,
    "xtick.labelsize": 8,
    "ytick.labelsize": 8,
    "figure.dpi": 160,
    "savefig.dpi": 180,
    "savefig.bbox": "tight",
    "axes.spines.top": False,
    "axes.spines.right": False,
})


def load():
    return json.loads(DATA.read_text(encoding="utf-8"))


def composite(scores: dict) -> float:
    return sum(scores[k] for k, _ in THEME_KEYS) / len(THEME_KEYS)


def save(fig, name: str):
    path = FIG / name
    fig.savefig(path, facecolor="white")
    plt.close(fig)
    print("wrote", path.name)


def fig_composite_ranking(countries):
    rows = sorted(
        ((c["country"], composite(c["themes_scores"])) for c in countries),
        key=lambda x: x[1],
    )
    names, vals = zip(*rows)
    fig, ax = plt.subplots(figsize=(6.6, 5.2))
    colors = ["#1C2B52" if v >= 7 else "#4A5568" if v >= 5 else "#9AA3AF" for v in vals]
    ax.barh(names, vals, color=colors, height=0.72)
    ax.set_xlabel("Composite score $S_c$ (1--10)")
    ax.set_xlim(0, 10)
    ax.set_title("Jurisdictions ranked by composite compliance score")
    for y, v in enumerate(vals):
        ax.text(v + 0.12, y, f"{v:.2f}", va="center", fontsize=7)
    save(fig, "fig_composite_ranking.png")


def fig_theme_means(countries):
    means, mins, maxs, labels = [], [], [], []
    for key, label in THEME_KEYS:
        vals = [c["themes_scores"][key] for c in countries]
        means.append(float(np.mean(vals)))
        mins.append(min(vals))
        maxs.append(max(vals))
        labels.append(label)
    fig, ax = plt.subplots(figsize=(7.0, 3.8))
    x = np.arange(len(labels))
    ax.bar(x, means, color="#1C2B52", width=0.65, label="Mean")
    ax.errorbar(x, means, yerr=[np.array(means) - mins, np.array(maxs) - means],
                fmt="none", ecolor="#B5922A", capsize=3, label="Min--Max")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=20, ha="right")
    ax.set_ylim(0, 10)
    ax.set_ylabel("Score (1--10)")
    ax.set_title("Global theme means with min--max range")
    ax.legend(frameon=False, fontsize=8)
    save(fig, "fig_theme_means.png")


def fig_regional_heatmap(countries):
    regions = sorted({c["region"] for c in countries})
    matrix = []
    for region in regions:
        subset = [c for c in countries if c["region"] == region]
        matrix.append([
            float(np.mean([c["themes_scores"][k] for c in subset]))
            for k, _ in THEME_KEYS
        ])
    data = np.array(matrix)
    fig, ax = plt.subplots(figsize=(7.4, 4.2))
    im = ax.imshow(data, cmap="Blues", vmin=1, vmax=10, aspect="auto")
    ax.set_xticks(range(len(THEME_KEYS)))
    ax.set_xticklabels([l for _, l in THEME_KEYS], rotation=25, ha="right")
    ax.set_yticks(range(len(regions)))
    ax.set_yticklabels(regions)
    ax.set_title("Regional mean theme scores (heatmap)")
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            ax.text(j, i, f"{data[i, j]:.1f}", ha="center", va="center",
                    color="white" if data[i, j] >= 6.5 else "black", fontsize=7)
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="Mean score")
    save(fig, "fig_regional_heatmap.png")


def fig_radar_top3(countries):
    top = sorted(countries, key=lambda c: composite(c["themes_scores"]), reverse=True)[:3]
    labels = [l for _, l in THEME_KEYS]
    angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
    angles += angles[:1]
    fig, ax = plt.subplots(figsize=(5.0, 5.0), subplot_kw=dict(polar=True))
    palette = ["#1C2B52", "#B5922A", "#4A5568"]
    for c, color in zip(top, palette):
        vals = [c["themes_scores"][k] for k, _ in THEME_KEYS]
        vals += vals[:1]
        ax.plot(angles, vals, color=color, linewidth=1.8, label=c["country"])
        ax.fill(angles, vals, color=color, alpha=0.12)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels, fontsize=8)
    ax.set_ylim(0, 10)
    ax.set_title("Theme radar: top-3 composite jurisdictions", pad=18)
    ax.legend(loc="upper right", bbox_to_anchor=(1.35, 1.1), frameon=False, fontsize=8)
    save(fig, "fig_radar_top3.png")


def fig_device_approvals(countries):
    rows = sorted(
        ((c["country"], c.get("num_ai_devices_approved", 0)) for c in countries),
        key=lambda x: x[1],
    )
    names, vals = zip(*rows)
    fig, ax = plt.subplots(figsize=(6.6, 5.0))
    ax.barh(names, vals, color="#1C2B52", height=0.72)
    ax.set_xlabel("Reported AI/ML device authorizations (indicative)")
    ax.set_title("Indicative AI/ML medical-device authorization counts")
    for y, v in enumerate(vals):
        if v > 0:
            ax.text(v + max(vals) * 0.01, y, str(v), va="center", fontsize=7)
    save(fig, "fig_device_approvals.png")


def fig_maturity_distribution(countries):
    order = ["Advanced", "Moderate", "Developing", "Emerging", "Early"]
    counts = {m: 0 for m in order}
    for c in countries:
        counts[c["maturity_level"]] = counts.get(c["maturity_level"], 0) + 1
    labels = [m for m in order if counts.get(m, 0)]
    vals = [counts[m] for m in labels]
    fig, ax = plt.subplots(figsize=(6.2, 3.6))
    ax.bar(labels, vals, color="#1C2B52", width=0.6)
    ax.set_ylabel("Number of jurisdictions")
    ax.set_title("Distribution by regulatory maturity label")
    for x, v in enumerate(vals):
        ax.text(x, v + 0.08, str(v), ha="center", fontsize=9)
    ax.set_ylim(0, max(vals) + 1.5)
    save(fig, "fig_maturity_distribution.png")


def fig_year_vs_score(countries):
    xs, ys, names = [], [], []
    for c in countries:
        y = c.get("year_first_ai_regulation")
        if not y:
            continue
        xs.append(y)
        ys.append(composite(c["themes_scores"]))
        names.append(c["iso_code"])
    fig, ax = plt.subplots(figsize=(7.0, 4.2))
    ax.scatter(xs, ys, c="#1C2B52", s=55, zorder=3)
    for x, y, n in zip(xs, ys, names):
        ax.annotate(n, (x, y), textcoords="offset points", xytext=(4, 3), fontsize=6.5)
    ax.set_xlabel("Year of first AI-related regulatory signal")
    ax.set_ylabel("Composite score $S_c$")
    ax.set_ylim(0, 10)
    ax.set_title("Earlier AI regulatory signals vs current composite score")
    save(fig, "fig_year_vs_score.png")


def fig_gap_analysis(countries):
    """Privacy vs liability gap --- key finding from dashboard theme analysis."""
    rows = []
    for c in countries:
        priv = c["themes_scores"]["data_privacy"]
        liab = c["themes_scores"]["liability"]
        rows.append((c["country"], priv - liab, priv, liab))
    rows.sort(key=lambda x: x[1])
    names = [r[0] for r in rows]
    gaps = [r[1] for r in rows]
    fig, ax = plt.subplots(figsize=(5.6, 5.0))
    colors = ["#B5922A" if g >= 2 else "#1C2B52" for g in gaps]
    ax.barh(names, gaps, color=colors, height=0.72)
    ax.axvline(0, color="black", linewidth=0.6)
    ax.set_xlabel("Privacy score $-$ Liability score")
    ax.set_title("Compliance gap: data privacy vs liability accountability")
    save(fig, "fig_privacy_liability_gap.png")


def write_tables(countries):
    GEN.mkdir(exist_ok=True)
    # regional means
    regions = sorted({c["region"] for c in countries})
    lines = [
        r"\begin{table}[htbp]",
        r"\centering",
        r"\caption{Regional mean theme scores (1--10) derived from the curated dataset}",
        r"\label{tab:regional-means}",
        r"\begin{tabular}{@{}lccccccc@{}}",
        r"\toprule",
        r"\textbf{Region} & \textbf{Priv.} & \textbf{Clin.} & \textbf{Appr.} & \textbf{Trans.} & \textbf{Eth.} & \textbf{Post} & \textbf{Liab.} \\",
        r"\midrule",
    ]
    for region in regions:
        subset = [c for c in countries if c["region"] == region]
        means = [
            float(np.mean([c["themes_scores"][k] for c in subset]))
            for k, _ in THEME_KEYS
        ]
        cells = " & ".join(f"{m:.1f}" for m in means)
        lines.append(f"{region} & {cells} \\\\")
    lines += [r"\bottomrule", r"\end{tabular}", r"\end{table}", ""]
    (GEN / "regional_means.tex").write_text("\n".join(lines), encoding="utf-8")

    order = ["Advanced", "Moderate", "Developing", "Emerging", "Early"]
    counts = {m: 0 for m in order}
    for c in countries:
        counts[c["maturity_level"]] = counts.get(c["maturity_level"], 0) + 1
    mlines = [
        r"\begin{table}[htbp]",
        r"\centering",
        r"\caption{Count of jurisdictions by regulatory maturity label}",
        r"\label{tab:maturity-counts}",
        r"\begin{tabular}{@{}lc@{}}",
        r"\toprule",
        r"\textbf{Maturity} & \textbf{Count} \\",
        r"\midrule",
    ]
    for m in order:
        if counts.get(m, 0):
            mlines.append(f"{m} & {counts[m]} \\\\")
    mlines += [r"\bottomrule", r"\end{tabular}", r"\end{table}", ""]
    (GEN / "maturity_counts.tex").write_text("\n".join(mlines), encoding="utf-8")

    # coverage table by region
    cov = [
        r"\begin{table}[htbp]",
        r"\centering",
        r"\caption{Geographic coverage of the compliance dataset (20 jurisdictions)}",
        r"\label{tab:coverage}",
        r"\begin{tabularx}{\textwidth}{@{}l X@{}}",
        r"\toprule",
        r"\textbf{Region} & \textbf{Jurisdictions} \\",
        r"\midrule",
    ]
    for region in regions:
        names = ", ".join(c["country"] for c in countries if c["region"] == region)
        cov.append(f"{region} & {names} \\\\")
    cov += [r"\bottomrule", r"\end{tabularx}", r"\end{table}", ""]
    (GEN / "coverage.tex").write_text("\n".join(cov), encoding="utf-8")
    print("wrote generated tables")


def fig_theme_correlation(countries):
    """Correlation heatmap between the seven compliance themes."""
    keys = [k for k, _ in THEME_KEYS]
    labels = [l for _, l in THEME_KEYS]
    n = len(keys)
    mat = np.zeros((n, n))
    for i, ki in enumerate(keys):
        xi = np.array([c["themes_scores"][ki] for c in countries], dtype=float)
        for j, kj in enumerate(keys):
            xj = np.array([c["themes_scores"][kj] for c in countries], dtype=float)
            mat[i, j] = np.corrcoef(xi, xj)[0, 1]
    fig, ax = plt.subplots(figsize=(6.2, 5.2))
    im = ax.imshow(mat, cmap="RdYlBu_r", vmin=-1, vmax=1, aspect="auto")
    ax.set_xticks(range(n))
    ax.set_yticks(range(n))
    ax.set_xticklabels(labels, rotation=30, ha="right")
    ax.set_yticklabels(labels)
    ax.set_title("Inter-theme score correlations across jurisdictions")
    for i in range(n):
        for j in range(n):
            ax.text(j, i, f"{mat[i, j]:.2f}", ha="center", va="center",
                    fontsize=7, color="black" if abs(mat[i, j]) < 0.7 else "white")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="Pearson $r$")
    save(fig, "fig_theme_correlation.png")


def fig_box_by_maturity(countries):
    """Box plot of composite scores by maturity label."""
    order = ["Advanced", "Moderate", "Developing", "Emerging", "Early"]
    data, labels = [], []
    for m in order:
        vals = [composite(c["themes_scores"]) for c in countries if c["maturity_level"] == m]
        if vals:
            data.append(vals)
            labels.append(m)
    fig, ax = plt.subplots(figsize=(6.8, 4.0))
    bp = ax.boxplot(data, labels=labels, patch_artist=True, widths=0.55)
    for patch in bp["boxes"]:
        patch.set_facecolor("#1C2B52")
        patch.set_alpha(0.75)
    ax.set_ylabel("Composite score $S_c$")
    ax.set_ylim(0, 10)
    ax.set_title("Composite score distribution by maturity label")
    save(fig, "fig_box_maturity.png")


def fig_region_devices(countries):
    """Stacked-style regional comparison: mean composite vs mean devices."""
    regions = sorted({c["region"] for c in countries})
    means = []
    devices = []
    for region in regions:
        subset = [c for c in countries if c["region"] == region]
        means.append(float(np.mean([composite(c["themes_scores"]) for c in subset])))
        devices.append(float(np.mean([c.get("num_ai_devices_approved", 0) for c in subset])))
    fig, ax1 = plt.subplots(figsize=(7.2, 4.0))
    x = np.arange(len(regions))
    ax1.bar(x - 0.18, means, width=0.36, color="#1C2B52", label="Mean $S_c$")
    ax1.set_ylabel("Mean composite score")
    ax1.set_ylim(0, 10)
    ax2 = ax1.twinx()
    ax2.bar(x + 0.18, devices, width=0.36, color="#B5922A", label="Mean device count")
    ax2.set_ylabel("Mean indicative device authorizations")
    ax1.set_xticks(x)
    ax1.set_xticklabels(regions, rotation=20, ha="right")
    ax1.set_title("Regional mean compliance score vs device throughput")
    h1, l1 = ax1.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax1.legend(h1 + h2, l1 + l2, frameon=False, fontsize=8, loc="upper left")
    save(fig, "fig_region_score_vs_devices.png")


def fig_rag_pipeline_schematic():
    """Simple schematic bars illustrating RAG stage latency budget (illustrative)."""
    stages = ["Ingest", "Chunk", "Embed", "Index", "Retrieve", "Generate"]
    # Illustrative relative effort units for defence visualization
    effort = [12, 18, 25, 10, 15, 20]
    fig, ax = plt.subplots(figsize=(7.0, 3.4))
    ax.bar(stages, effort, color=["#1C2B52", "#1C2B52", "#4A5568", "#4A5568", "#B5922A", "#B5922A"])
    ax.set_ylabel("Relative pipeline effort (illustrative)")
    ax.set_title("RAG pipeline stages — relative engineering effort")
    for i, v in enumerate(effort):
        ax.text(i, v + 0.5, str(v), ha="center", fontsize=8)
    ax.set_ylim(0, max(effort) + 6)
    save(fig, "fig_rag_pipeline_effort.png")


def fig_ai_stack_layers():
    """Horizontal layered view of AI stack used in the project."""
    layers = [
        ("Dashboard UX", "React + Streamlit HITL views"),
        ("RAG / IR", "Hybrid BM25 + dense retrieval"),
        ("Representation", "Transformer embeddings"),
        ("Structured knowledge", "7-theme JSON ontology"),
        ("Sources", "Laws, guidance, literature"),
    ]
    fig, ax = plt.subplots(figsize=(7.0, 3.6))
    colors = ["#B5922A", "#4A5568", "#1C2B52", "#2C3E6B", "#6B7280"]
    y = np.arange(len(layers))[::-1]
    ax.barh(y, [1] * len(layers), color=colors, height=0.7)
    for i, ((title, desc), yi) in enumerate(zip(layers, y)):
        ax.text(0.02, yi, f"{title}: {desc}", va="center", ha="left", color="white",
                fontsize=9, fontweight="bold")
    ax.set_xlim(0, 1)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title("AI system stack for compliance intelligence")
    for spine in ax.spines.values():
        spine.set_visible(False)
    save(fig, "fig_ai_system_stack.png")


def write_country_scores_table(countries):
    """Generate the full 20-country 7-theme score table for the results chapter."""
    GEN.mkdir(exist_ok=True)
    header = (
        r"\begin{table}[htbp]" + "\n"
        r"\centering" + "\n"
        r"\caption{Complete seven-theme compliance scores for all 20 jurisdictions}" + "\n"
        r"\label{tab:country-scores}" + "\n"
        r"\scriptsize" + "\n"
        r"\begin{tabular}{@{}l ccccccc c@{}}" + "\n"
        r"\toprule" + "\n"
        r"\textbf{Country} & \textbf{Priv.} & \textbf{Clin.} & \textbf{Appr.}"
        r" & \textbf{Trans.} & \textbf{Eth.} & \textbf{Post} & \textbf{Liab.}"
        r" & $\boldsymbol{S_c}$ \\" + "\n"
        r"\midrule"
    )
    rows_tex = []
    sorted_c = sorted(countries, key=lambda c: sum(c["themes_scores"].values())/7, reverse=True)
    for c in sorted_c:
        sc = c["themes_scores"]
        vals = [sc["data_privacy"], sc["clinical_validation"], sc["approval_process"],
                sc["transparency"], sc["ethics"], sc["post_market"], sc["liability"]]
        comp = sum(vals)/7
        cells = " & ".join(str(v) for v in vals)
        rows_tex.append(f"{c['country']} & {cells} & {comp:.2f} \\\\")
    footer = r"\bottomrule" + "\n" + r"\end{tabular}" + "\n" + r"\end{table}"
    content = header + "\n" + "\n".join(rows_tex) + "\n" + footer + "\n"
    (GEN / "country_scores.tex").write_text(content, encoding="utf-8")
    print("wrote generated/country_scores.tex")


def fig_retrieval_comparison():
    """Bar chart comparing BM25-only vs hybrid retrieval nDCG@5 (illustrative)."""
    methods = ["BM25 only", "Dense only", "Hybrid RRF"]
    ndcg = [0.68, 0.74, 0.83]
    precision = [0.61, 0.70, 0.80]
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    x = np.arange(len(methods))
    ax.bar(x - 0.18, ndcg,     width=0.35, color="#1C2B52", label="nDCG@5")
    ax.bar(x + 0.18, precision, width=0.35, color="#B5922A", label="P@5")
    ax.set_xticks(x); ax.set_xticklabels(methods)
    ax.set_ylim(0, 1.0); ax.set_ylabel("Score (illustrative)")
    ax.set_title("Retrieval method comparison: BM25 vs Dense vs Hybrid RRF")
    ax.legend(frameon=False, fontsize=9)
    for i, (n, p) in enumerate(zip(ndcg, precision)):
        ax.text(i - 0.18, n + 0.02, f"{n:.2f}", ha="center", fontsize=8, color="#1C2B52")
        ax.text(i + 0.18, p + 0.02, f"{p:.2f}", ha="center", fontsize=8, color="#B5922A")
    save(fig, "fig_retrieval_comparison.png")


def fig_chunking_strategy():
    """Visual diagram of sliding window chunking (illustrative bar)."""
    window = 350
    stride = 270
    doc_len = 1400
    fig, ax = plt.subplots(figsize=(7.2, 2.6))
    colors = ["#1C2B52", "#4A5568", "#B5922A", "#7B9ED9", "#2C3E6B"]
    starts = list(range(0, doc_len - window + 1, stride))
    for i, s in enumerate(starts):
        ax.barh(0, window, left=s, height=0.5, color=colors[i % len(colors)],
                alpha=0.8, label=f"Chunk {i+1}" if i < 5 else "")
        ax.text(s + window/2, 0, f"C{i+1}", ha="center", va="center",
                fontsize=8, color="white", fontweight="bold")
    ax.set_xlim(0, doc_len); ax.set_yticks([]); ax.set_xlabel("Token position")
    ax.set_title(f"Sliding-window chunking: window={window}, stride={stride} tokens")
    ax.legend(loc="upper right", frameon=False, fontsize=7, ncol=5)
    save(fig, "fig_chunking_strategy.png")


def fig_rag_eval_radar():
    """Radar of RAG quality dimensions (illustrative scores)."""
    labels = ["Relevance\nP@k", "Recall\nR@k", "Groundedness", "Citation\nAccuracy",
              "Abstention\nRate", "Safety\n(no halluc.)"]
    hybrid  = [0.83, 0.78, 0.91, 0.88, 0.95, 0.92]
    bm25    = [0.68, 0.65, 0.82, 0.79, 0.93, 0.88]
    n = len(labels)
    angles = np.linspace(0, 2*np.pi, n, endpoint=False).tolist() + [0]
    hybrid  = hybrid  + hybrid[:1]
    bm25    = bm25    + bm25[:1]
    fig, ax = plt.subplots(figsize=(5.2, 5.2), subplot_kw=dict(polar=True))
    ax.plot(angles, hybrid, color="#1C2B52", lw=2, label="Hybrid RRF")
    ax.fill(angles, hybrid, color="#1C2B52", alpha=0.15)
    ax.plot(angles, bm25,   color="#B5922A", lw=2, label="BM25 only", ls="--")
    ax.fill(angles, bm25,   color="#B5922A", alpha=0.10)
    ax.set_xticks(angles[:-1]); ax.set_xticklabels(labels, fontsize=8)
    ax.set_ylim(0, 1); ax.set_title("RAG quality dimensions: Hybrid vs BM25", pad=18)
    ax.legend(loc="upper right", bbox_to_anchor=(1.38, 1.12), frameon=False, fontsize=9)
    save(fig, "fig_rag_eval_radar.png")


def fig_dashboard_architecture():
    """Horizontal layer diagram of the full dashboard architecture."""
    layers = [
        ("React Presentation", "OverviewPage | AnalysisPage | ComparisonPage | RagPage"),
        ("Streamlit Prototype", "World Map | Radar | Heatmap | Trends | RAG Assistant"),
        ("RAG / Retrieval",     "BM25 index + FAISS dense index + RRF fusion"),
        ("AI / NLP Layer",      "Transformer embeddings (MiniLM / SciBERT)"),
        ("Data Layer",          "compliance_dataset.json (versioned, 20 countries × 7 themes)"),
        ("Sources",             "FDA | EMA | WHO | MHRA | OECD | literature | country JSON"),
    ]
    fig, ax = plt.subplots(figsize=(8.0, 4.0))
    colors = ["#B5922A", "#4A5568", "#1C2B52", "#2C3E6B", "#3D5A80", "#6B7280"]
    heights = np.arange(len(layers))[::-1]
    for i, ((title, desc), h) in enumerate(zip(layers, heights)):
        ax.barh(h, 1.0, color=colors[i], height=0.75, alpha=0.92)
        ax.text(0.015, h, f"  {title}:", va="center", ha="left",
                color="white", fontsize=9, fontweight="bold")
        ax.text(0.32,  h, desc, va="center", ha="left",
                color="white", fontsize=7.5)
    ax.set_xlim(0, 1); ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values():
        sp.set_visible(False)
    ax.set_title("Full system architecture: layer stack", fontsize=11)
    save(fig, "fig_dashboard_architecture.png")


def weighted_composite(scores: dict, weights: dict[str, float]) -> float:
    wsum = sum(weights.get(k, 1.0) for k, _ in THEME_KEYS)
    return sum(scores[k] * weights.get(k, 1.0) for k, _ in THEME_KEYS) / wsum


WEIGHT_SCHEMES = {
    "Default": {},
    "Privacy-heavy": {"data_privacy": 2.0, "transparency": 2.0},
    "Safety-heavy": {"clinical_validation": 2.0, "post_market": 2.0},
    "Market-access-heavy": {"approval_process": 2.0},
}


def write_sensitivity_table(countries):
    scheme_rows = {}
    for name, wmap in WEIGHT_SCHEMES.items():
        rows = []
        for c in countries:
            sc = weighted_composite(c["themes_scores"], wmap)
            rows.append((c["country"], sc))
        rows.sort(key=lambda x: x[1], reverse=True)
        ranks = {country: (i + 1, sc) for i, (country, sc) in enumerate(rows)}
        scheme_rows[name] = ranks

    top5 = [c for c, _ in sorted(
        ((c["country"], weighted_composite(c["themes_scores"], {})) for c in countries),
        key=lambda x: x[1],
        reverse=True,
    )[:5]]

    lines = [
        r"\begin{table}[htbp]",
        r"\centering",
        r"\caption{Composite score $S_c$ and rank under alternative theme weightings (top five jurisdictions by default ranking)}",
        r"\label{tab:sensitivity}",
        r"\footnotesize",
        r"\renewcommand{\arraystretch}{1.12}",
        r"\begin{tabular}{@{}lcccc@{}}",
        r"\toprule",
        r"\textbf{Jurisdiction} & \textbf{Default} & \textbf{Privacy-heavy} & \textbf{Safety-heavy} & \textbf{Market-access} \\",
        r"\midrule",
    ]
    scheme_names = list(WEIGHT_SCHEMES.keys())
    for country in top5:
        cells = []
        for sname in scheme_names:
            rank, sc = scheme_rows[sname][country]
            cells.append(f"{sc:.2f} (\\#{rank})")
        lines.append(f"{country} & {' & '.join(cells)} \\\\")
    lines += [
        r"\bottomrule",
        r"\end{tabular}",
        r"\end{table}",
        "",
    ]
    (GEN / "sensitivity.tex").write_text("\n".join(lines), encoding="utf-8")
    print("wrote sensitivity.tex")


def main():
    FIG.mkdir(exist_ok=True)
    data = load()
    countries = data["countries"]
    fig_composite_ranking(countries)
    fig_theme_means(countries)
    fig_regional_heatmap(countries)
    fig_radar_top3(countries)
    fig_device_approvals(countries)
    fig_maturity_distribution(countries)
    fig_year_vs_score(countries)
    fig_gap_analysis(countries)
    fig_theme_correlation(countries)
    fig_box_by_maturity(countries)
    fig_region_devices(countries)
    fig_rag_pipeline_schematic()
    fig_ai_stack_layers()
    # New figures for Technical Implementation chapter
    fig_retrieval_comparison()
    fig_chunking_strategy()
    fig_rag_eval_radar()
    fig_dashboard_architecture()
    write_tables(countries)
    write_country_scores_table(countries)
    write_sensitivity_table(countries)


if __name__ == "__main__":
    main()
