import { useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { THEME_LABELS } from "../../constants";

const SECTIONS = [
  ["Data Privacy Law", "dataPrivacyLaw"],
  ["AI-Specific Regulation", "aiRegulation"],
  ["Medical Device Framework", "deviceFramework"],
  ["Approval Process", "approvalProcess"],
  ["Data Governance", "dataGovernance"],
  ["Clinical Validation", "clinicalValidation"],
  ["Algorithmic Transparency", "algorithmicTransparency"],
  ["Ethical Framework", "ethicalFramework"],
  ["Post-Market Surveillance", "postMarketSurveillance"],
  ["Liability & Accountability", "liability"],
] as const;

export function CountryDetailsTab() {
  const { filtered, selectedThemes } = useDashboard();
  const [country, setCountry] = useState(filtered[0]?.country ?? "");

  const row = filtered.find((r) => r.country === country) ?? filtered[0];

  const radarData = useMemo(() => {
    if (!row) return [];
    return selectedThemes.map((key) => ({
      theme: THEME_LABELS[key],
      score: row.scores[key],
    }));
  }, [row, selectedThemes]);

  if (!row) {
    return <p className="text-slate-600">No countries match the current filters.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-brand-900">Detailed Country Profile</h3>

      <select
        value={row.country}
        onChange={(e) => setCountry(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        {filtered.map((r) => (
          <option key={r.country} value={r.country}>
            {r.country}
          </option>
        ))}
      </select>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-2 p-5 lg:col-span-1">
          <h4 className="text-2xl font-bold text-brand-900">{row.country}</h4>
          <p>
            <strong>Region:</strong> {row.region}
          </p>
          <p>
            <strong>Maturity:</strong> {row.maturity}
          </p>
          <p>
            <strong>Regulatory Body:</strong> {row.regulatoryBody}
          </p>
          <p>
            <strong>AI Devices Approved:</strong> {row.aiDevicesApproved}
          </p>
          <p>
            <strong>First AI Regulation:</strong> {row.firstAiRegYear}
          </p>
        </div>

        {selectedThemes.length > 0 && (
          <div className="card p-4 lg:col-span-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="theme" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Tooltip />
                  <Radar
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {SECTIONS.map(([title, key]) => (
          <details key={key} className="card group p-4">
            <summary className="cursor-pointer font-semibold text-slate-800">
              {title}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {row[key as keyof typeof row] as string}
            </p>
          </details>
        ))}
      </div>

      <div className="card space-y-4 p-5">
        <div>
          <h5 className="font-semibold">Key Legislations</h5>
          <p className="mt-1 text-sm text-slate-600">{row.keyLegislations}</p>
        </div>
        <div>
          <h5 className="font-semibold">Challenges</h5>
          <p className="mt-1 text-sm text-slate-600">{row.challenges}</p>
        </div>
        <div>
          <h5 className="font-semibold">Notable Developments</h5>
          <p className="mt-1 text-sm text-slate-600">{row.notableDevelopments}</p>
        </div>
      </div>
    </div>
  );
}
