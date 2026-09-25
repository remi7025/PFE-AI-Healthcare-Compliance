import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { ArrowLeftRight } from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import { THEME_KEYS, THEME_LABELS } from "../../../constants";
import { scoreDelta } from "../../../lib/weights";
import { deltaColor, ACCESSIBLE } from "../../../lib/palettes";
import { VisualTile } from "../VisualTile";

export function DiffPage() {
  const {
    countries,
    filtered,
    diffA,
    setDiffA,
    diffB,
    setDiffB,
    getComposite,
    selectedThemes,
  } = useDashboard();

  const list = filtered.length ? filtered : countries;
  const a = list.find((c) => c.country === diffA) ?? list[0];
  const b = list.find((c) => c.country === diffB) ?? list[1] ?? list[0];

  const deltas = useMemo(() => {
    if (!a || !b) return [];
    return scoreDelta(a, b, selectedThemes.length ? selectedThemes : THEME_KEYS);
  }, [a, b, selectedThemes]);

  const chartData = deltas.map((d) => ({
    theme: THEME_LABELS[d.key].length > 14
      ? THEME_LABELS[d.key].slice(0, 13) + "…"
      : THEME_LABELS[d.key],
    full: THEME_LABELS[d.key],
    delta: d.delta,
    a: d.a,
    b: d.b,
  }));

  if (!a || !b) {
    return <p className="p-4 text-sm text-[#5c6578]">Select two countries to compare.</p>;
  }

  const scA = getComposite(a);
  const scB = getComposite(b);
  const scDelta = Math.round((scA - scB) * 100) / 100;

  const pathwayTags = (row: typeof a) => [
    { label: "Privacy", value: row.dataPrivacyLaw },
    { label: "AI reg", value: row.aiRegulation },
    { label: "Device", value: row.deviceFramework },
    { label: "Approval", value: row.approvalProcess.slice(0, 120) + "…" },
  ];

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-3 rounded border border-[#d8dee9] bg-white px-3 py-2">
        <ArrowLeftRight className="h-4 w-4 text-[#118dff]" />
        <label className="text-[11px] font-semibold uppercase text-[#605e5c]">
          Country A
          <select
            value={a.country}
            onChange={(e) => setDiffA(e.target.value)}
            className="ml-2 rounded border border-[#d0d7e2] bg-white px-2 py-1 text-xs font-normal normal-case"
          >
            {list.map((c) => (
              <option key={c.country} value={c.country}>
                {c.country}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-[#8b93a7]">vs</span>
        <label className="text-[11px] font-semibold uppercase text-[#605e5c]">
          Country B
          <select
            value={b.country}
            onChange={(e) => setDiffB(e.target.value)}
            className="ml-2 rounded border border-[#d0d7e2] bg-white px-2 py-1 text-xs font-normal normal-case"
          >
            {list.map((c) => (
              <option key={c.country} value={c.country}>
                {c.country}
              </option>
            ))}
          </select>
        </label>
        <span
          className="ml-auto rounded px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: deltaColor(scDelta) }}
        >
          Δ Sc = {scDelta > 0 ? "+" : ""}
          {scDelta}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6">
          <CountryPanel
            row={a}
            sc={scA}
            accent="#2166ac"
            tags={pathwayTags(a)}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <CountryPanel
            row={b}
            sc={scB}
            accent="#b2182b"
            tags={pathwayTags(b)}
          />
        </div>

        <div className="col-span-12 lg:col-span-7">
          <VisualTile
            title="Theme score deltas (A − B)"
            subtitle="Positive = A higher · ColorBrewer diverging"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" domain={[-10, 10]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="theme" width={110} tick={{ fontSize: 9 }} />
                <Tooltip
                  formatter={(v: number, _n, props) => [
                    `${v > 0 ? "+" : ""}${v} (A=${props.payload.a}, B=${props.payload.b})`,
                    props.payload.full,
                  ]}
                />
                <ReferenceLine x={0} stroke="#94a3b8" />
                <Bar dataKey="delta" barSize={14} radius={[0, 3, 3, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.theme} fill={deltaColor(d.delta)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </VisualTile>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <VisualTile title="Legislative & pathway tags" subtitle="Contrasting highlights">
            <div className="space-y-3">
              {deltas.map((d) => (
                <div
                  key={d.key}
                  className="flex items-center justify-between gap-2 rounded border border-[#e8ecf3] bg-[#fbfcfe] px-2 py-1.5 text-[11px]"
                >
                  <span className="font-medium text-[#1a2332]">{THEME_LABELS[d.key]}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] text-white"
                      style={{ backgroundColor: ACCESSIBLE.diverging[5] }}
                    >
                      {d.a}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
                      style={{ backgroundColor: deltaColor(d.delta) }}
                    >
                      {d.delta > 0 ? "+" : ""}
                      {d.delta}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] text-white"
                      style={{ backgroundColor: ACCESSIBLE.diverging[0] }}
                    >
                      {d.b}
                    </span>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <MetricCard
                  title="Throughput (devices)"
                  a={a.aiDevicesApproved}
                  b={b.aiDevicesApproved}
                  note="Not part of Sc"
                />
                <MetricCard
                  title="Composite Sc"
                  a={scA}
                  b={scB}
                  note="Regulatory rigor"
                />
              </div>
            </div>
          </VisualTile>
        </div>
      </div>
    </div>
  );
}

function CountryPanel({
  row,
  sc,
  accent,
  tags,
}: {
  row: {
    country: string;
    region: string;
    maturity: string;
    aiDevicesApproved: number;
    keyLegislations: string;
  };
  sc: number;
  accent: string;
  tags: { label: string; value: string }[];
}) {
  return (
    <div className="rounded border border-[#d8dee9] bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 border-b border-[#eef1f6] pb-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="text-sm font-bold text-[#1a2332]">{row.country}</h3>
        <span className="rounded bg-[#eef2ff] px-1.5 py-0.5 text-[9px] text-[#4338ca]">
          {row.region}
        </span>
        <span className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[9px] text-[#475569]">
          {row.maturity}
        </span>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5">
          <p className="text-[9px] font-semibold uppercase text-emerald-800">Rigor Sc</p>
          <p className="text-lg font-bold text-emerald-900">{sc.toFixed(2)}</p>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
          <p className="text-[9px] font-semibold uppercase text-slate-600">Throughput</p>
          <p className="text-lg font-bold text-slate-800">{row.aiDevicesApproved}</p>
        </div>
      </div>
      <p className="mb-2 text-[10px] leading-snug text-[#5c6578]">
        <strong>Laws:</strong> {row.keyLegislations}
      </p>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t.label}
            className="max-w-full truncate rounded border px-1.5 py-0.5 text-[9px]"
            style={{ borderColor: accent, color: accent }}
            title={t.value}
          >
            {t.label}: {t.value.slice(0, 40)}
            {t.value.length > 40 ? "…" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  a,
  b,
  note,
}: {
  title: string;
  a: number;
  b: number;
  note: string;
}) {
  const d = Math.round((a - b) * 100) / 100;
  return (
    <div className="rounded border border-[#e2e8f0] bg-white px-2 py-2">
      <p className="text-[9px] font-semibold uppercase text-[#64748b]">{title}</p>
      <p className="text-xs text-[#1a2332]">
        {a} vs {b}
      </p>
      <p className="text-[10px] font-bold" style={{ color: deltaColor(d) }}>
        Δ {d > 0 ? "+" : ""}
        {d}
      </p>
      <p className="text-[9px] text-[#94a3b8]">{note}</p>
    </div>
  );
}
