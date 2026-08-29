import { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useDashboard } from "../../../context/DashboardContext";
import { THEME_LABELS } from "../../../constants";
import { VisualTile } from "../VisualTile";

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

export function DetailsPage() {
  const { filtered, selectedThemes, selectedCountry, setSelectedCountry } = useDashboard();

  const row = useMemo(() => {
    if (selectedCountry) {
      return filtered.find((r) => r.country === selectedCountry) ?? filtered[0];
    }
    return filtered[0];
  }, [filtered, selectedCountry]);

  const radarData = useMemo(() => {
    if (!row) return [];
    return selectedThemes.map((key) => ({
      theme: THEME_LABELS[key],
      score: row.scores[key],
    }));
  }, [row, selectedThemes]);

  if (!row) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#605e5c]">
        No countries match filters.
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-12 gap-3 p-3">
      <div className="col-span-12 lg:col-span-4">
        <VisualTile title="Country profile">
          <div className="space-y-2 text-xs">
            <select
              value={row.country}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="mb-2 w-full border border-[#e1dfdd] bg-white px-2 py-1.5 font-semibold"
            >
              {filtered.map((r) => (
                <option key={r.country} value={r.country}>
                  {r.country}
                </option>
              ))}
            </select>
            <Row label="Region" value={row.region} />
            <Row label="Maturity" value={row.maturity} />
            <Row label="Regulatory body" value={row.regulatoryBody} />
            <Row label="AI devices approved" value={String(row.aiDevicesApproved)} />
            <Row label="First AI regulation" value={String(row.firstAiRegYear)} />
            <Row label="Privacy law" value={row.dataPrivacyLaw} />
            <Row label="AI regulation" value={row.aiRegulation} />
          </div>
        </VisualTile>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <VisualTile title="Theme score profile">
          {selectedThemes.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#edebe9" />
                <PolarAngleAxis dataKey="theme" tick={{ fontSize: 8 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Radar
                  dataKey="score"
                  stroke="#118dff"
                  fill="#118dff"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="p-4 text-xs text-[#605e5c]">Select themes in slicers.</p>
          )}
        </VisualTile>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <VisualTile title="Key insights">
          <div className="space-y-3 text-[11px] leading-relaxed text-[#605e5c]">
            <div>
              <p className="font-semibold text-[#252423]">Key legislations</p>
              <p className="mt-1">{row.keyLegislations}</p>
            </div>
            <div>
              <p className="font-semibold text-[#252423]">Challenges</p>
              <p className="mt-1">{row.challenges}</p>
            </div>
            <div>
              <p className="font-semibold text-[#252423]">Notable developments</p>
              <p className="mt-1">{row.notableDevelopments}</p>
            </div>
          </div>
        </VisualTile>
      </div>

      <div className="col-span-12">
        <VisualTile title="Regulatory detail sections">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map(([title, key]) => (
              <div key={key} className="border border-[#e1dfdd] bg-[#faf9f8] p-3">
                <p className="text-[11px] font-semibold text-[#252423]">{title}</p>
                <p className="mt-1 text-[10px] leading-snug text-[#605e5c]">
                  {row[key as keyof typeof row] as string}
                </p>
              </div>
            ))}
          </div>
        </VisualTile>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#edebe9] pb-1.5">
      <span className="font-semibold text-[#252423]">{label}: </span>
      <span className="text-[#605e5c]">{value}</span>
    </div>
  );
}
