import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../context/DashboardContext";
import { THEME_LABELS } from "../constants";
import { overallScore } from "../lib/data";

export function ExecutiveSnapshot() {
  const { filtered, selectedThemes } = useDashboard();

  const snapshot = useMemo(() => {
    if (selectedThemes.length === 0 || filtered.length === 0) return null;

    const scored = filtered.map((r) => ({
      country: r.country,
      score: overallScore(r, selectedThemes),
    }));
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const worst = scored[scored.length - 1];

    const gaps = selectedThemes.map((key) => {
      const vals = filtered.map((r) => r.scores[key]);
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const leader = filtered.find((r) => r.scores[key] === max)!.country;
      return {
        theme: THEME_LABELS[key],
        gap: max - min,
        leader,
      };
    });
    gaps.sort((a, b) => b.gap - a.gap);
    const topGap = gaps[0];

    const avgTheme = selectedThemes
      .map((key) => {
        const avg =
          filtered.reduce((s, r) => s + r.scores[key], 0) / filtered.length;
        return { theme: THEME_LABELS[key], avg: Math.round(avg * 10) / 10 };
      })
      .sort((a, b) => b.avg - a.avg);

    return { best, worst, topGap, avgTheme };
  }, [filtered, selectedThemes]);

  if (!snapshot) {
    return (
      <div className="card p-4 text-sm text-slate-600">
        Select at least one theme to see the executive snapshot.
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-semibold text-brand-900">Executive Snapshot</h3>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <p className="text-xs font-medium uppercase text-emerald-700">Best overall</p>
          <p className="text-xl font-bold text-emerald-900">{snapshot.best.country}</p>
          <p className="text-sm text-emerald-700">{snapshot.best.score}/10</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
          <p className="text-xs font-medium uppercase text-amber-700">Laggard overall</p>
          <p className="text-xl font-bold text-amber-900">{snapshot.worst.country}</p>
          <p className="text-sm text-amber-700">{snapshot.worst.score}/10</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4 ring-1 ring-violet-100">
          <p className="text-xs font-medium uppercase text-violet-700">Largest theme gap</p>
          <p className="text-xl font-bold text-violet-900">{snapshot.topGap.theme}</p>
          <p className="text-sm text-violet-700">
            {snapshot.topGap.gap.toFixed(1)} gap (Leader: {snapshot.topGap.leader})
          </p>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={snapshot.avgTheme} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="theme" width={140} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="avg" fill="#6366f1" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
