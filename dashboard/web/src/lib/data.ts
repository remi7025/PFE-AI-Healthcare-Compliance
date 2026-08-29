import type { ComplianceDataset, CountryRecord, CountryRow, ThemeKey } from "../types";
import { ISO3_MAP } from "../constants";

export async function loadDataset(): Promise<ComplianceDataset> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/compliance_dataset.json`);
  if (!res.ok) throw new Error("Failed to load compliance dataset");
  return res.json();
}

export async function loadLiteratureReview(): Promise<string> {
  const res = await fetch(`${import.meta.env.BASE_URL}literature_review.md`);
  if (!res.ok) throw new Error("Failed to load literature review");
  return res.text();
}

export function toCountryRow(c: CountryRecord): CountryRow {
  return {
    country: c.country,
    iso: c.iso_code,
    iso3: ISO3_MAP[c.iso_code] ?? c.iso_code,
    region: c.region,
    regulatoryBody: c.regulatory_body,
    dataPrivacyLaw: c.data_privacy_law,
    aiRegulation: c.ai_specific_regulation,
    deviceFramework: c.medical_device_framework,
    maturity: c.maturity_level,
    firstAiRegYear: c.year_first_ai_regulation,
    aiDevicesApproved: c.num_ai_devices_approved,
    challenges: c.challenges,
    notableDevelopments: c.notable_developments,
    approvalProcess: c.approval_process,
    dataGovernance: c.data_governance,
    clinicalValidation: c.clinical_validation,
    algorithmicTransparency: c.algorithmic_transparency,
    ethicalFramework: c.ethical_framework,
    postMarketSurveillance: c.post_market_surveillance,
    liability: c.liability,
    keyLegislations: c.key_legislations.join(", "),
    scores: c.themes_scores,
  };
}

export function getScore(row: CountryRow, key: ThemeKey): number {
  return row.scores[key];
}

export function overallScore(row: CountryRow, themeKeys: ThemeKey[]): number {
  if (themeKeys.length === 0) return 0;
  const sum = themeKeys.reduce((acc, k) => acc + row.scores[k], 0);
  return Math.round((sum / themeKeys.length) * 10) / 10;
}

export function exportCsv(rows: CountryRow[], themeKeys: ThemeKey[]): string {
  const headers = [
    "Country",
    "Region",
    "Maturity",
    "AI Devices Approved",
    ...themeKeys.map((k) => k),
  ];
  const lines = rows.map((r) =>
    [
      r.country,
      r.region,
      r.maturity,
      r.aiDevicesApproved,
      ...themeKeys.map((k) => r.scores[k]),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

export function interpolateColor(value: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  const r = Math.round(239 - t * (239 - 34));
  const g = Math.round(68 + t * (197 - 68));
  const b = Math.round(68 + t * (94 - 68));
  return `rgb(${r},${g},${b})`;
}
