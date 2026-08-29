import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { ADOPTION_COLORS, USE_CASE_WEIGHTS } from "../../constants";
import { computeAllReadiness } from "../../lib/scoring";

function scoreColor(score: number): string {
  const t = score / 10;
  const r = Math.round(239 - t * (239 - 34));
  const g = Math.round(68 + t * (197 - 68));
  const b = Math.round(68 + t * (94 - 68));
  return `rgb(${r},${g},${b})`;
}

const REGION_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function UseCasesTab() {
  const { filtered, selectedThemes, trends } = useDashboard();
  const useCases = Object.keys(USE_CASE_WEIGHTS);
  const [focus, setFocus] = useState(useCases[0]);

  const readiness = useMemo(
    () => computeAllReadiness(filtered, selectedThemes),
    [filtered, selectedThemes],
  );

  const ranking = useMemo(() => {
    const idx = useCases.indexOf(focus);
    return filtered
      .map((r, i) => ({
        country: r.country,
        region: r.region,
        readiness: Object.values(readiness)[idx]?.[i] ?? 0,
      }))
      .sort((a, b) => b.readiness - a.readiness);
  }, [filtered, focus, readiness, useCases]);

  if (!selectedThemes.length) {
    return <p className="text-slate-600">Select at least one theme to compute use-case readiness.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-brand-900">
          AI Use Cases, Clinical Deployment, and Current Trends
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Theme scores (1–10) are converted into derived use-case readiness scores for radiology,
          pathology, genomics, and drug discovery workflows—linking regulation to real clinical
          deployment contexts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Country</th>
              {useCases.map((uc) => (
                <th key={uc} className="px-3 py-2 text-center text-xs font-semibold">
                  {uc.split(" / ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, ri) => (
              <tr key={r.country} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{r.country}</td>
                {useCases.map((uc) => {
                  const val = readiness[uc][ri];
                  return (
                    <td
                      key={uc}
                      className="px-3 py-2 text-center font-semibold text-white"
                      style={{ backgroundColor: scoreColor(val) }}
                    >
                      {val.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <label className="mb-2 block text-sm font-medium">Use case ranking</label>
        <select
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="mb-4 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {useCases.map((uc) => (
            <option key={uc} value={uc}>
              {uc}
            </option>
          ))}
        </select>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranking} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="country" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="readiness" radius={[0, 6, 6, 0]}>
                {ranking.map((r, i) => (
                  <Cell key={r.country} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Current Trends in AI Healthcare Products</h4>
        <div className="mb-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: 10, bottom: 20 }}>
              <XAxis type="number" dataKey="year_emerged" name="Year" />
              <YAxis type="category" dataKey="trend" width={180} tick={{ fontSize: 10 }} />
              <ZAxis range={[100, 100]} />
              <Tooltip />
              <Scatter data={trends} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trends.map((t) => (
            <article key={t.trend} className="card p-4">
              <h5 className="font-semibold">{t.trend}</h5>
              <p className="mt-2 text-sm text-slate-600">{t.description}</p>
              <span
                className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: ADOPTION_COLORS[t.adoption_level] ?? "#6b7280" }}
              >
                {t.adoption_level} Adoption · Since {t.year_emerged}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
