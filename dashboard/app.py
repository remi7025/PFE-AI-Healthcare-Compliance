import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import re
from pathlib import Path

# ---------------------------------------------------------------------------
# Page configuration
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="AI Healthcare Compliance Dashboard",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Custom CSS
# ---------------------------------------------------------------------------
st.markdown("""
<style>
    /* Page background + typography */
    .stApp {
        background: linear-gradient(180deg, #f6f8ff 0%, #ffffff 35%, #f8fafc 100%);
    }
    html, body, [class*="stText"] {
        font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1B3A5C;
        margin-bottom: 0.2rem;
    }
    .exec-snapshot {
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        margin: 10px 0 16px 0;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #5A6F85;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.2rem;
        border-radius: 12px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    .metric-card h3 {
        font-size: 2rem;
        margin: 0;
        font-weight: 700;
    }
    .metric-card p {
        margin: 0.3rem 0 0 0;
        font-size: 0.85rem;
        opacity: 0.9;
    }
    .theme-badge {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        margin: 0.2rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 10px 20px;
        border-radius: 8px 8px 0 0;
    }
    div[data-testid="stMetric"] {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------
@st.cache_data
def load_data():
    data_path = Path(__file__).parent / "data" / "compliance_dataset.json"
    with open(data_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    countries = raw["countries"]
    rows = []
    for c in countries:
        row = {
            "Country": c["country"],
            "ISO": c["iso_code"],
            "Region": c["region"],
            "Regulatory Body": c["regulatory_body"],
            "Data Privacy Law": c["data_privacy_law"],
            "AI Regulation": c["ai_specific_regulation"],
            "Device Framework": c["medical_device_framework"],
            "Maturity": c["maturity_level"],
            "First AI Reg Year": c["year_first_ai_regulation"],
            "AI Devices Approved": c["num_ai_devices_approved"],
            "Challenges": c["challenges"],
            "Notable Developments": c["notable_developments"],
            "Approval Process": c["approval_process"],
            "Data Governance": c["data_governance"],
            "Clinical Validation": c["clinical_validation"],
            "Algorithmic Transparency": c["algorithmic_transparency"],
            "Ethical Framework": c["ethical_framework"],
            "Post-Market Surveillance": c["post_market_surveillance"],
            "Liability": c["liability"],
        }
        for theme, score in c["themes_scores"].items():
            row[f"score_{theme}"] = score
        row["Key Legislations"] = ", ".join(c["key_legislations"])
        rows.append(row)

    df = pd.DataFrame(rows)

    iso_map = {
        "USA": "USA", "EU": "EUR", "GBR": "GBR", "CHN": "CHN",
        "IND": "IND", "JPN": "JPN", "CAN": "CAN", "AUS": "AUS",
        "KOR": "KOR", "SGP": "SGP", "BRA": "BRA", "SAU": "SAU",
        "ZAF": "ZAF", "NGA": "NGA", "KEN": "KEN", "ISR": "ISR",
        "CHE": "CHE", "ARE": "ARE", "DEU": "DEU", "THA": "THA",
    }
    df["ISO3"] = df["ISO"].map(iso_map)

    trends = raw.get("global_trends", [])
    references = raw.get("key_references", [])
    return df, trends, references, countries


df, global_trends, key_references, raw_countries = load_data()

THEME_LABELS = {
    "score_data_privacy": "Data Privacy",
    "score_clinical_validation": "Clinical Validation",
    "score_approval_process": "Approval Process",
    "score_transparency": "Transparency",
    "score_ethics": "Ethics",
    "score_post_market": "Post-Market Surveillance",
    "score_liability": "Liability",
}

THEME_COLORS = {
    "Data Privacy": "#6366f1",
    "Clinical Validation": "#06b6d4",
    "Approval Process": "#10b981",
    "Transparency": "#f59e0b",
    "Ethics": "#ef4444",
    "Post-Market Surveillance": "#8b5cf6",
    "Liability": "#ec4899",
}

MATURITY_ORDER = ["Early", "Emerging", "Developing", "Moderate", "Advanced"]
MATURITY_COLORS = {
    "Early": "#ef4444",
    "Emerging": "#f97316",
    "Developing": "#eab308",
    "Moderate": "#22c55e",
    "Advanced": "#3b82f6",
}

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
with st.sidebar:
    st.markdown("## Filters")

    selected_regions = st.multiselect(
        "Select Regions",
        options=sorted(df["Region"].unique()),
        default=sorted(df["Region"].unique()),
    )

    maturity_filter = st.multiselect(
        "Maturity Level",
        options=MATURITY_ORDER,
        default=MATURITY_ORDER,
    )

    selected_themes = st.multiselect(
        "Themes to Display",
        options=list(THEME_LABELS.values()),
        default=list(THEME_LABELS.values()),
    )

    st.markdown("---")
    st.markdown("### About")
    st.markdown(
        "This dashboard provides an interactive comparison of AI healthcare "
        "compliance and regulatory frameworks across 20 countries."
    )
    st.markdown(
        "**Supervisor:** Dr. Anuradha Kar"
    )
    st.markdown("**Data Sources:** FDA, EMA, WHO, OECD, national agencies, peer-reviewed literature")

filtered_df = df[
    (df["Region"].isin(selected_regions)) & (df["Maturity"].isin(maturity_filter))
].copy()

# Optional export of exactly what you're looking at
st.sidebar.download_button(
    label="Download filtered data (CSV)",
    data=filtered_df.to_csv(index=False).encode("utf-8"),
    file_name="filtered_compliance_dataset.csv",
    mime="text/csv",
    use_container_width=True,
)

# Reverse-map selected theme labels to score columns
theme_label_to_col = {v: k for k, v in THEME_LABELS.items()}
selected_score_cols = [theme_label_to_col[t] for t in selected_themes]

# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
st.markdown('<p class="main-header">AI Healthcare Compliance & Regulations Dashboard</p>', unsafe_allow_html=True)
st.markdown(
    '<p class="sub-header">Interactive comparison of AI regulations in healthcare across 20 countries and 6 regions</p>',
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Top metrics
# ---------------------------------------------------------------------------
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Countries Covered", len(filtered_df))
with col2:
    st.metric("Regions", filtered_df["Region"].nunique())
with col3:
    st.metric("Total AI Devices Approved", f"{filtered_df['AI Devices Approved'].sum():,}")
with col4:
    avg_score = filtered_df[[c for c in selected_score_cols]].mean().mean() if selected_score_cols else 0
    st.metric("Avg Compliance Score", f"{avg_score:.1f}/10")

# ---------------------------------------------------------------------------
# Executive snapshot (clean, professional summary)
# ---------------------------------------------------------------------------
st.markdown('<div class="exec-snapshot">', unsafe_allow_html=True)
st.markdown("### Executive Snapshot")

if selected_score_cols:
    overall_scores = filtered_df[selected_score_cols].mean(axis=1)
    best_idx = overall_scores.idxmax()
    worst_idx = overall_scores.idxmin()

    best_country = filtered_df.loc[best_idx, "Country"]
    worst_country = filtered_df.loc[worst_idx, "Country"]
    best_score = float(overall_scores.loc[best_idx])
    worst_score = float(overall_scores.loc[worst_idx])

    gap_rows = []
    for col in selected_score_cols:
        max_val = float(filtered_df[col].max())
        min_val = float(filtered_df[col].min())
        gap = max_val - min_val
        leader_country = filtered_df.loc[filtered_df[col].idxmax(), "Country"]
        laggard_country = filtered_df.loc[filtered_df[col].idxmin(), "Country"]
        gap_rows.append((col, gap, leader_country, laggard_country))

    # Theme with the biggest spread among filtered countries
    gap_rows.sort(key=lambda x: x[1], reverse=True)
    top_gap_col, top_gap, leader_country, _ = gap_rows[0]
    top_gap_theme = THEME_LABELS[top_gap_col]

    sx1, sx2, sx3 = st.columns(3)
    with sx1:
        st.metric("Best overall (selected themes)", best_country, f"{best_score:.1f}/10")
    with sx2:
        st.metric("Laggard overall (selected themes)", worst_country, f"{worst_score:.1f}/10")
    with sx3:
        st.metric(
            "Largest theme gap",
            top_gap_theme,
            f"{top_gap:.1f} gap (Leader: {leader_country})",
        )

    # Visual: average scores per selected theme
    avg_theme = filtered_df[selected_score_cols].mean().to_dict()
    avg_theme_rows = [
        {"Theme": THEME_LABELS[col], "Avg Score": float(score)}
        for col, score in avg_theme.items()
    ]
    avg_theme_df = pd.DataFrame(avg_theme_rows).sort_values("Avg Score", ascending=False)

    fig_avg = px.bar(
        avg_theme_df,
        x="Avg Score",
        y="Theme",
        orientation="h",
        color="Theme",
        color_discrete_map=THEME_COLORS,
        text="Avg Score",
        labels={"Avg Score": "Average score (1-10)", "Theme": "Theme"},
    )
    fig_avg.update_traces(textposition="outside")
    fig_avg.update_layout(
        height=220,
        margin=dict(l=0, r=0, t=10, b=0),
        showlegend=False,
        xaxis=dict(range=[0, 10]),
    )
    st.plotly_chart(fig_avg, use_container_width=True)
else:
    st.info("Select at least one theme to see the executive snapshot summary.")

st.markdown("</div>", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Tabs
# ---------------------------------------------------------------------------
tab_map, tab_compare, tab_themes, tab_trends, tab_details, tab_usecases, tab_review = st.tabs([
    "World Map",
    "Country Comparison",
    "Theme Analysis",
    "Global Trends",
    "Country Details",
    "AI Use Cases & Trends",
    "Literature Review",
])

# ===================== TAB 1: WORLD MAP =====================
with tab_map:
    st.subheader("Global AI Healthcare Regulatory Maturity")

    map_metric = st.selectbox(
        "Map colour metric",
        ["Overall Score", "AI Devices Approved", "First AI Reg Year"] + list(THEME_LABELS.values()),
        index=0,
        key="map_metric",
    )

    plot_df = filtered_df.copy()

    if map_metric == "Overall Score":
        if selected_score_cols:
            plot_df["value"] = plot_df[selected_score_cols].mean(axis=1).round(1)
        else:
            plot_df["value"] = 0
        color_label = "Overall Score"
        color_scale = "Viridis"
    elif map_metric == "AI Devices Approved":
        plot_df["value"] = plot_df["AI Devices Approved"]
        color_label = "Devices Approved"
        color_scale = "Blues"
    elif map_metric == "First AI Reg Year":
        plot_df["value"] = plot_df["First AI Reg Year"]
        color_label = "Year"
        color_scale = "RdYlGn_r"
    else:
        col_key = theme_label_to_col[map_metric]
        plot_df["value"] = plot_df[col_key]
        color_label = map_metric
        color_scale = "Viridis"

    fig_map = px.choropleth(
        plot_df,
        locations="ISO3",
        color="value",
        hover_name="Country",
        hover_data={"Region": True, "Maturity": True, "value": True, "ISO3": False},
        color_continuous_scale=color_scale,
        labels={"value": color_label},
    )
    fig_map.update_layout(
        height=520,
        margin=dict(l=0, r=0, t=30, b=0),
        geo=dict(
            showframe=False,
            showcoastlines=True,
            projection_type="natural earth",
            bgcolor="rgba(0,0,0,0)",
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        coloraxis_colorbar=dict(title=color_label, thickness=15, len=0.6),
    )
    st.plotly_chart(fig_map, use_container_width=True)

    # Maturity distribution
    st.subheader("Regulatory Maturity Distribution")
    mat_counts = (
        filtered_df["Maturity"]
        .value_counts()
        .reindex(MATURITY_ORDER, fill_value=0)
        .reset_index()
    )
    mat_counts.columns = ["Maturity", "Count"]
    fig_mat = px.bar(
        mat_counts,
        x="Maturity",
        y="Count",
        color="Maturity",
        color_discrete_map=MATURITY_COLORS,
        text="Count",
    )
    fig_mat.update_layout(
        height=340,
        showlegend=False,
        xaxis_title="",
        yaxis_title="Number of Countries",
    )
    fig_mat.update_traces(textposition="outside")
    st.plotly_chart(fig_mat, use_container_width=True)


# ===================== TAB 2: COUNTRY COMPARISON =====================
with tab_compare:
    st.subheader("Compare Countries Side-by-Side")

    compare_countries = st.multiselect(
        "Select countries to compare",
        options=sorted(filtered_df["Country"].tolist()),
        default=sorted(filtered_df["Country"].tolist())[:4],
        key="compare_sel",
    )

    if compare_countries:
        cmp_df = filtered_df[filtered_df["Country"].isin(compare_countries)]

        # Radar chart
        if selected_score_cols:
            radar_data = []
            for _, row in cmp_df.iterrows():
                for col in selected_score_cols:
                    radar_data.append({
                        "Country": row["Country"],
                        "Theme": THEME_LABELS[col],
                        "Score": row[col],
                    })
            radar_df = pd.DataFrame(radar_data)

            fig_radar = go.Figure()
            theme_names = [THEME_LABELS[c] for c in selected_score_cols]
            for country in compare_countries:
                subset = radar_df[radar_df["Country"] == country]
                values = subset["Score"].tolist()
                values.append(values[0])
                fig_radar.add_trace(go.Scatterpolar(
                    r=values,
                    theta=theme_names + [theme_names[0]],
                    fill="toself",
                    name=country,
                    opacity=0.6,
                ))
            fig_radar.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, 10])),
                height=500,
                margin=dict(t=40, b=40),
                legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5),
            )
            st.plotly_chart(fig_radar, use_container_width=True)

        # Bar comparison
        st.subheader("AI Devices Approved")
        bar_df = cmp_df.sort_values("AI Devices Approved", ascending=True)
        fig_bar = px.bar(
            bar_df,
            y="Country",
            x="AI Devices Approved",
            orientation="h",
            color="Maturity",
            color_discrete_map=MATURITY_COLORS,
            text="AI Devices Approved",
        )
        fig_bar.update_layout(height=max(300, len(compare_countries) * 50), yaxis_title="")
        fig_bar.update_traces(textposition="outside")
        st.plotly_chart(fig_bar, use_container_width=True)

        # Comparison table
        st.subheader("Regulatory Overview Table")
        table_cols = ["Country", "Region", "Maturity", "Regulatory Body", "Data Privacy Law", "AI Regulation", "AI Devices Approved", "First AI Reg Year"]
        st.dataframe(
            cmp_df[table_cols].sort_values("Country").reset_index(drop=True),
            use_container_width=True,
            height=min(400, 40 + len(compare_countries) * 38),
        )
    else:
        st.info("Please select at least one country to compare.")


# ===================== TAB 3: THEME ANALYSIS =====================
with tab_themes:
    st.subheader("Thematic Analysis Across Countries")

    if selected_score_cols:
        # Heatmap
        heat_df = filtered_df.set_index("Country")[selected_score_cols].rename(columns=THEME_LABELS)
        heat_df = heat_df.sort_index()

        fig_heat = px.imshow(
            heat_df,
            labels=dict(x="Theme", y="Country", color="Score"),
            color_continuous_scale="RdYlGn",
            aspect="auto",
            zmin=0,
            zmax=10,
        )
        fig_heat.update_layout(height=max(450, len(filtered_df) * 28), margin=dict(l=0, r=0))
        st.plotly_chart(fig_heat, use_container_width=True)

        # Theme averages by region
        st.subheader("Average Theme Scores by Region")
        region_avg = filtered_df.groupby("Region")[selected_score_cols].mean().rename(columns=THEME_LABELS)
        region_melt = region_avg.reset_index().melt(id_vars="Region", var_name="Theme", value_name="Avg Score")

        fig_region = px.bar(
            region_melt,
            x="Region",
            y="Avg Score",
            color="Theme",
            barmode="group",
            color_discrete_map=THEME_COLORS,
        )
        fig_region.update_layout(height=440, yaxis=dict(range=[0, 10]))
        st.plotly_chart(fig_region, use_container_width=True)

        # Theme gap analysis
        st.subheader("Compliance Gap Analysis")
        st.markdown("Showing the gap between the highest and lowest scoring country for each theme.")
        gap_data = []
        for col in selected_score_cols:
            label = THEME_LABELS[col]
            max_val = filtered_df[col].max()
            min_val = filtered_df[col].min()
            max_country = filtered_df.loc[filtered_df[col].idxmax(), "Country"]
            min_country = filtered_df.loc[filtered_df[col].idxmin(), "Country"]
            gap_data.append({
                "Theme": label,
                "Max Score": max_val,
                "Leader": max_country,
                "Min Score": min_val,
                "Laggard": min_country,
                "Gap": max_val - min_val,
            })
        gap_df = pd.DataFrame(gap_data).sort_values("Gap", ascending=False)

        fig_gap = go.Figure()
        fig_gap.add_trace(go.Bar(
            y=gap_df["Theme"], x=gap_df["Min Score"],
            name="Minimum", orientation="h",
            marker_color="#ef4444", opacity=0.7,
        ))
        fig_gap.add_trace(go.Bar(
            y=gap_df["Theme"], x=gap_df["Gap"],
            name="Gap", orientation="h",
            marker_color="#fbbf24", opacity=0.7,
        ))
        fig_gap.update_layout(barmode="stack", height=380, xaxis=dict(range=[0, 10], title="Score"), yaxis_title="")
        st.plotly_chart(fig_gap, use_container_width=True)

        st.dataframe(gap_df.reset_index(drop=True), use_container_width=True)
    else:
        st.info("Please select at least one theme from the sidebar.")


# ===================== TAB 4: GLOBAL TRENDS =====================
with tab_trends:
    st.subheader("Global Trends in AI Healthcare Regulation")

    # Timeline of first AI regulation
    timeline_df = filtered_df[["Country", "First AI Reg Year", "Maturity", "Region"]].sort_values("First AI Reg Year")
    fig_timeline = px.scatter(
        timeline_df,
        x="First AI Reg Year",
        y="Country",
        color="Region",
        size_max=14,
        hover_data=["Maturity"],
    )
    fig_timeline.update_traces(marker=dict(size=12))
    fig_timeline.update_layout(
        height=max(450, len(filtered_df) * 28),
        xaxis_title="Year of First AI-Related Regulation",
        yaxis_title="",
        xaxis=dict(dtick=1),
    )
    st.plotly_chart(fig_timeline, use_container_width=True)

    # Trend cards
    st.subheader("Key Regulatory Trends")
    adoption_colors = {"High": "#22c55e", "Medium": "#eab308", "Low": "#ef4444"}

    for i in range(0, len(global_trends), 2):
        cols = st.columns(2)
        for j, col in enumerate(cols):
            idx = i + j
            if idx < len(global_trends):
                trend = global_trends[idx]
                adoption = trend["adoption_level"]
                badge_color = adoption_colors.get(adoption, "#6b7280")
                with col:
                    st.markdown(f"""
                    <div style="border:1px solid #e2e8f0; border-radius:12px; padding:1.2rem; margin-bottom:1rem; background:#fafbff;">
                        <h4 style="margin:0 0 0.5rem 0; color:#1e293b;">{trend['trend']}</h4>
                        <p style="color:#475569; font-size:0.9rem; margin:0 0 0.5rem 0;">{trend['description']}</p>
                        <span style="background:{badge_color}; color:white; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:600;">
                            {adoption} Adoption
                        </span>
                        <span style="color:#94a3b8; font-size:0.8rem; margin-left:0.5rem;">Since {trend['year_emerged']}</span>
                    </div>
                    """, unsafe_allow_html=True)

    # Devices approved distribution
    st.subheader("AI Medical Device Approvals by Region")
    region_devices = filtered_df.groupby("Region")["AI Devices Approved"].sum().reset_index()
    fig_pie = px.pie(
        region_devices,
        values="AI Devices Approved",
        names="Region",
        hole=0.45,
        color_discrete_sequence=px.colors.qualitative.Set2,
    )
    fig_pie.update_layout(height=400)
    fig_pie.update_traces(textposition="outside", textinfo="label+percent+value")
    st.plotly_chart(fig_pie, use_container_width=True)


# ===================== TAB 5: COUNTRY DETAILS =====================
with tab_details:
    st.subheader("Detailed Country Profile")

    detail_country = st.selectbox(
        "Select a country",
        options=sorted(filtered_df["Country"].tolist()),
        key="detail_sel",
    )

    if detail_country:
        row = filtered_df[filtered_df["Country"] == detail_country].iloc[0]

        col_a, col_b = st.columns([1, 2])
        with col_a:
            st.markdown(f"### {row['Country']}")
            st.markdown(f"**Region:** {row['Region']}")
            st.markdown(f"**Maturity:** {row['Maturity']}")
            st.markdown(f"**Regulatory Body:** {row['Regulatory Body']}")
            st.markdown(f"**AI Devices Approved:** {row['AI Devices Approved']}")
            st.markdown(f"**First AI Regulation:** {row['First AI Reg Year']}")

        with col_b:
            if selected_score_cols:
                scores = {THEME_LABELS[c]: row[c] for c in selected_score_cols}
                theme_names = list(scores.keys())
                theme_vals = list(scores.values())
                theme_vals_closed = theme_vals + [theme_vals[0]]

                fig_detail_radar = go.Figure()
                fig_detail_radar.add_trace(go.Scatterpolar(
                    r=theme_vals_closed,
                    theta=theme_names + [theme_names[0]],
                    fill="toself",
                    fillcolor="rgba(99, 102, 241, 0.25)",
                    line_color="#6366f1",
                    name=detail_country,
                ))
                fig_detail_radar.update_layout(
                    polar=dict(radialaxis=dict(visible=True, range=[0, 10])),
                    height=350,
                    margin=dict(t=30, b=30),
                    showlegend=False,
                )
                st.plotly_chart(fig_detail_radar, use_container_width=True)

        st.markdown("---")

        detail_sections = [
            ("Data Privacy Law", "Data Privacy Law"),
            ("AI-Specific Regulation", "AI Regulation"),
            ("Medical Device Framework", "Device Framework"),
            ("Approval Process", "Approval Process"),
            ("Data Governance", "Data Governance"),
            ("Clinical Validation", "Clinical Validation"),
            ("Algorithmic Transparency", "Algorithmic Transparency"),
            ("Ethical Framework", "Ethical Framework"),
            ("Post-Market Surveillance", "Post-Market Surveillance"),
            ("Liability & Accountability", "Liability"),
        ]

        for title, col_name in detail_sections:
            with st.expander(title, expanded=False):
                st.write(row[col_name])

        st.markdown("---")
        st.markdown("**Key Legislations:**")
        st.write(row["Key Legislations"])

        st.markdown("**Challenges:**")
        st.write(row["Challenges"])

        st.markdown("**Notable Developments:**")
        st.write(row["Notable Developments"])


# ===================== TAB 6: AI USE CASES & TRENDS =====================
with tab_usecases:
    st.subheader("AI Use Cases, Clinical Deployment, and Current Trends")
    st.markdown(
        "Your dataset includes 7 compliance themes scored from 1–10. In this tab, "
        "those theme scores are converted into a *derived* \"use-case readiness\" score "
        "for each country, to help explain how regulations and governance affect real AI "
        "workflows (radiology, pathology, genomics, drug discovery, and public-health/hospital deployment)."
    )

    use_case_weights = {
        "Radiology / Imaging Diagnostics": {
            "score_data_privacy": 0.20,
            "score_clinical_validation": 0.35,
            "score_approval_process": 0.25,
            "score_transparency": 0.10,
            "score_ethics": 0.05,
            "score_post_market": 0.03,
            "score_liability": 0.02,
        },
        "Pathology / Digital Pathology": {
            "score_data_privacy": 0.20,
            "score_clinical_validation": 0.38,
            "score_approval_process": 0.22,
            "score_transparency": 0.10,
            "score_ethics": 0.05,
            "score_post_market": 0.03,
            "score_liability": 0.02,
        },
        "Genomic Analysis / Precision Medicine": {
            "score_data_privacy": 0.25,
            "score_clinical_validation": 0.30,
            "score_approval_process": 0.20,
            "score_transparency": 0.10,
            "score_ethics": 0.10,
            "score_post_market": 0.03,
            "score_liability": 0.02,
        },
        "Drug Discovery / Development Support": {
            "score_data_privacy": 0.15,
            "score_clinical_validation": 0.25,
            "score_approval_process": 0.35,
            "score_transparency": 0.10,
            "score_ethics": 0.10,
            "score_post_market": 0.03,
            "score_liability": 0.02,
        },
    }

    if not selected_score_cols:
        st.info("Select at least one theme in the sidebar to compute use-case readiness.")
    else:
        readiness_scores = {}
        for uc, weights in use_case_weights.items():
            weights_selected = {col: w for col, w in weights.items() if col in selected_score_cols}
            w_sum = sum(weights_selected.values())
            if w_sum <= 0:
                readiness_scores[uc] = pd.Series([0] * len(filtered_df), index=filtered_df.index)
                continue

            weighted_sum = 0
            for col, w in weights_selected.items():
                weighted_sum = weighted_sum + filtered_df[col] * w
            readiness_scores[uc] = (weighted_sum / w_sum).round(2)

        heat_df = pd.DataFrame(
            {uc: readiness_scores[uc].values for uc in use_case_weights.keys()},
            index=filtered_df["Country"].values,
        )

        fig_heat = px.imshow(
            heat_df,
            aspect="auto",
            zmin=0,
            zmax=10,
            color_continuous_scale="RdYlGn",
            labels={"x": "Use Case", "y": "Country", "color": "Readiness (1-10)"},
        )
        fig_heat.update_layout(height=max(420, len(filtered_df) * 24), margin=dict(l=10, r=10, t=30, b=10))
        st.plotly_chart(fig_heat, use_container_width=True)

        st.markdown("---")

        focus_use_case = st.selectbox(
            "Choose a use case to view country ranking",
            list(use_case_weights.keys()),
            key="focus_use_case",
        )
        ranking_df = filtered_df[["Country", "Region"]].copy()
        ranking_df["Readiness"] = readiness_scores[focus_use_case].values
        ranking_df = ranking_df.sort_values("Readiness", ascending=False)

        fig_rank = px.bar(
            ranking_df,
            x="Readiness",
            y="Country",
            orientation="h",
            color="Region",
            text="Readiness",
        )
        fig_rank.update_traces(textposition="outside", cliponaxis=False)
        fig_rank.update_layout(
            height=min(520, 80 + len(ranking_df) * 24),
            margin=dict(l=0, r=0, t=20, b=0),
            xaxis=dict(range=[0, 10]),
            showlegend=True,
        )
        st.plotly_chart(fig_rank, use_container_width=True)

        st.dataframe(ranking_df.head(10), use_container_width=True, height=320)

    st.markdown("---")
    st.subheader("Current Trends in AI Healthcare Products")

    trends_df = pd.DataFrame(global_trends)
    if trends_df.empty:
        st.info("No trend data available.")
    else:
        fig_trends = px.scatter(
            trends_df,
            x="year_emerged",
            y="trend",
            color="adoption_level",
            hover_data={"description": True, "year_emerged": True, "adoption_level": True, "trend": False},
        )
        fig_trends.update_layout(height=360, margin=dict(l=10, r=10, t=30, b=10))
        st.plotly_chart(fig_trends, use_container_width=True)

        # Card-style summary
        adoption_colors = {"High": "#22c55e", "Medium": "#eab308", "Low": "#ef4444"}
        for i in range(0, len(global_trends), 2):
            cols = st.columns(2)
            for j, col in enumerate(cols):
                idx = i + j
                if idx >= len(global_trends):
                    continue
                trend = global_trends[idx]
                adoption = trend.get("adoption_level", "Unknown")
                badge_color = adoption_colors.get(adoption, "#6b7280")
                with col:
                    st.markdown(
                        f"""
                        <div style="border:1px solid #e2e8f0; border-radius:12px; padding:1.1rem; margin-bottom:1rem; background:#fafbff;">
                            <h4 style="margin:0 0 0.5rem 0; color:#1e293b;">{trend['trend']}</h4>
                            <p style="color:#475569; font-size:0.9rem; margin:0 0 0.5rem 0;">{trend['description']}</p>
                            <span style="background:{badge_color}; color:white; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:600;">
                                {adoption} Adoption
                            </span>
                            <span style="color:#94a3b8; font-size:0.8rem; margin-left:0.5rem;">Since {trend['year_emerged']}</span>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )

# ===================== TAB 7: LITERATURE REVIEW =====================
with tab_review:
    st.subheader("Literature Review Summary")
    st.markdown(
        "This section presents key findings from the systematic literature review on "
        "AI healthcare compliance and regulations."
    )

    review_path = Path(__file__).parent / "literature_review.md"
    if review_path.exists():
        review_text = review_path.read_text(encoding="utf-8")

        # Visual summaries so users can "scan" the report quickly.
        main_sections = re.findall(r"^##\\s+(.+)$", review_text, flags=re.M)
        main_sections = [s for s in main_sections if s.strip() and not s.strip().startswith("## ")]

        st.markdown("### Key Takeaways (Visual Summary)")
        cards = [
            ("Radiology + Pathology", "AI-assisted diagnostics in clinical practice require strong clinical validation, workflow integration, and bias monitoring."),
            ("Genomics + Precision Medicine", "Privacy, data governance, and representative datasets matter due to sensitive health data and cross-border constraints."),
            ("Drug Discovery / Development", "Evidence quality and regulatory approval pathways shape how AI supports trials, endpoints, and safety documentation."),
            ("Clinical / Hospital Deployment", "Lifecycle governance (post-market monitoring) helps manage drift and performance changes over time."),
            ("Public Health", "Governance and accountability are essential when AI supports surveillance and decisions that affect populations."),
            ("Current Trend: Generative AI", "Foundation models introduce new risk questions beyond traditional SaMD assumptions."),
        ]

        for i in range(0, len(cards), 2):
            c1, c2 = st.columns(2)
            with c1:
                st.markdown(
                    f"""
                    <div style="border:1px solid rgba(148,163,184,0.35); border-radius:14px; padding:12px 14px; background:#ffffff;">
                      <div style="font-weight:700; color:#1B3A5C; margin-bottom:0.3rem;">{cards[i][0]}</div>
                      <div style="color:#475569; font-size:0.95rem;">{cards[i][1]}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            if i + 1 < len(cards):
                with c2:
                    st.markdown(
                        f"""
                        <div style="border:1px solid rgba(148,163,184,0.35); border-radius:14px; padding:12px 14px; background:#ffffff;">
                          <div style="font-weight:700; color:#1B3A5C; margin-bottom:0.3rem;">{cards[i+1][0]}</div>
                          <div style="color:#475569; font-size:0.95rem;">{cards[i+1][1]}</div>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )

        st.markdown("---")
        st.markdown("### Topic Frequency (From the Literature Review Text)")

        review_lower = review_text.lower()
        keyword_groups = [
            ("Radiology", ["radiology", "radiograph", "radiographs", "x-ray", "xray", "chest radiographs"]),
            ("Pathology", ["pathology", "digital pathology", "histopathology"]),
            ("Genomics", ["genomics", "genomic"]),
            ("Drug Discovery / Development", ["drug discovery", "drug development", "clinical trials"]),
            ("Hospitals / Clinics", ["hospital", "clinics", "clinic", "clinical setting", "hospitals"]),
            ("Public Health", ["public health", "surveillance", "outbreak"]),
            ("Generative AI / Foundation Models", ["generative", "foundation model", "foundation models"]),
        ]

        def count_phrase(text: str, phrase: str) -> int:
            phrase = phrase.lower().strip()
            if not phrase:
                return 0
            if " " in phrase:
                return text.count(phrase)
            return len(re.findall(rf"\\b{re.escape(phrase)}\\b", text))

        keyword_counts = []
        for label, phrases in keyword_groups:
            total = 0
            for p in phrases:
                total += count_phrase(review_lower, p)
            keyword_counts.append({"Topic": label, "Mentions": total})

        kw_df = pd.DataFrame(keyword_counts).sort_values("Mentions", ascending=False)
        fig_kw = px.bar(
            kw_df,
            x="Mentions",
            y="Topic",
            orientation="h",
            color="Mentions",
            color_continuous_scale="Viridis",
            text="Mentions",
        )
        fig_kw.update_traces(textposition="outside")
        fig_kw.update_layout(height=320, margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig_kw, use_container_width=True)

        if main_sections:
            st.markdown("---")
            st.markdown("### Review Structure (Main Sections)")
            st.write(main_sections)

        st.markdown("---")
        st.subheader("Full Literature Review (Markdown)")
        st.markdown(review_text)
    else:
        st.warning("Literature review document not found.")

    st.markdown("---")
    st.subheader("Key References")
    ref_query = st.text_input("Search references (title or author)", value="", key="ref_search")
    if ref_query.strip():
        q = ref_query.lower().strip()
        refs = [
            r for r in key_references
            if (q in str(r.get("title", "")).lower()) or (q in str(r.get("author", "")).lower())
        ]
    else:
        refs = key_references

    if not refs:
        st.warning("No references matched your search.")
    else:
        for ref in refs:
            st.markdown(f"- **{ref['title']}** — {ref['author']} ({ref['year']}) [{ref['type']}]")


# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------
st.markdown("---")
st.markdown(
    "<div style='text-align:center; color:#94a3b8; font-size:0.85rem; padding:1rem 0;'>"
    "AI Healthcare Compliance Dashboard | Supervised by Dr. Anuradha Kar | Data compiled from regulatory agencies, WHO, OECD, and peer-reviewed literature"
    "</div>",
    unsafe_allow_html=True,
)
