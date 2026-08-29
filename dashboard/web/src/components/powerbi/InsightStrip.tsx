import { useMemo } from "react";
import { Award, AlertTriangle, Zap } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { THEME_LABELS } from "../../constants";
import { overallScore } from "../../lib/data";

export function InsightStrip() {
  const { filtered, selectedThemes } = useDashboard();

  const insight = useMemo(() => {
    if (!selectedThemes.length || !filtered.length) return null;
    const scored = filtered.map((r) => ({
      country: r.country,
      score: overallScore(r, selectedThemes),
    }));
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const worst = scored[scored.length - 1];

    let topGap = { theme: "", gap: 0, leader: "" };
    for (const key of selectedThemes) {
      const vals = filtered.map((r) => r.scores[key]);
      const gap = Math.max(...vals) - Math.min(...vals);
      if (gap > topGap.gap) {
        topGap = {
          theme: THEME_LABELS[key],
          gap,
          leader: filtered.find((r) => r.scores[key] === Math.max(...vals))!.country,
        };
      }
    }
    return { best, worst, topGap };
  }, [filtered, selectedThemes]);

  if (!insight) return null;

  return (
    <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="insight-card insight-card-leader stagger-1 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Regulatory leader
          </p>
          <p className="text-sm font-bold text-[#1a2332]">{insight.best.country}</p>
          <p className="text-xs text-[#5c6578]">{insight.best.score}/10 overall</p>
        </div>
      </div>
      <div className="insight-card insight-card-laggard stagger-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Needs attention
          </p>
          <p className="text-sm font-bold text-[#1a2332]">{insight.worst.country}</p>
          <p className="text-xs text-[#5c6578]">{insight.worst.score}/10 overall</p>
        </div>
      </div>
      <div className="insight-card insight-card-gap stagger-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Largest theme gap
          </p>
          <p className="text-sm font-bold text-[#1a2332]">{insight.topGap.theme}</p>
          <p className="text-xs text-[#5c6578]">
            {insight.topGap.gap.toFixed(1)} pts · Leader: {insight.topGap.leader}
          </p>
        </div>
      </div>
    </div>
  );
}
