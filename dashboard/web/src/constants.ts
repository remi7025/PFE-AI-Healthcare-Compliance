import type { ThemeKey } from "./types";

export const THEME_KEYS: ThemeKey[] = [
  "data_privacy",
  "clinical_validation",
  "approval_process",
  "transparency",
  "ethics",
  "post_market",
  "liability",
];

export const THEME_LABELS: Record<ThemeKey, string> = {
  data_privacy: "Data Privacy",
  clinical_validation: "Clinical Validation",
  approval_process: "Approval Process",
  transparency: "Transparency",
  ethics: "Ethics",
  post_market: "Post-Market Surveillance",
  liability: "Liability",
};

export const THEME_COLORS: Record<string, string> = {
  "Data Privacy": "#6366f1",
  "Clinical Validation": "#06b6d4",
  "Approval Process": "#10b981",
  Transparency: "#f59e0b",
  Ethics: "#ef4444",
  "Post-Market Surveillance": "#8b5cf6",
  Liability: "#ec4899",
};

export const MATURITY_ORDER = ["Early", "Emerging", "Developing", "Moderate", "Advanced"] as const;

export const MATURITY_COLORS: Record<string, string> = {
  Early: "#ef4444",
  Emerging: "#f97316",
  Developing: "#eab308",
  Moderate: "#22c55e",
  Advanced: "#3b82f6",
};

export const ISO3_MAP: Record<string, string> = {
  USA: "USA",
  EU: "EUR",
  GBR: "GBR",
  CHN: "CHN",
  IND: "IND",
  JPN: "JPN",
  CAN: "CAN",
  AUS: "AUS",
  KOR: "KOR",
  SGP: "SGP",
  BRA: "BRA",
  SAU: "SAU",
  ZAF: "ZAF",
  NGA: "NGA",
  KEN: "KEN",
  ISR: "ISR",
  CHE: "CHE",
  ARE: "ARE",
  DEU: "DEU",
  THA: "THA",
};

/** world-atlas@2 countries-110m only exposes `name` — map to dataset ISO3. */
export const ATLAS_NAME_TO_ISO3: Record<string, string> = {
  "United States of America": "USA",
  "United Kingdom": "GBR",
  China: "CHN",
  India: "IND",
  Japan: "JPN",
  Canada: "CAN",
  Australia: "AUS",
  "South Korea": "KOR",
  Brazil: "BRA",
  "Saudi Arabia": "SAU",
  "South Africa": "ZAF",
  Nigeria: "NGA",
  Kenya: "KEN",
  Israel: "ISR",
  Switzerland: "CHE",
  "United Arab Emirates": "ARE",
  Germany: "DEU",
  Thailand: "THA",
};

export const ADOPTION_COLORS: Record<string, string> = {
  High: "#22c55e",
  Medium: "#eab308",
  Low: "#ef4444",
};

export const USE_CASE_WEIGHTS: Record<string, Partial<Record<ThemeKey, number>>> = {
  "Radiology / Imaging Diagnostics": {
    data_privacy: 0.2,
    clinical_validation: 0.35,
    approval_process: 0.25,
    transparency: 0.1,
    ethics: 0.05,
    post_market: 0.03,
    liability: 0.02,
  },
  "Pathology / Digital Pathology": {
    data_privacy: 0.2,
    clinical_validation: 0.38,
    approval_process: 0.22,
    transparency: 0.1,
    ethics: 0.05,
    post_market: 0.03,
    liability: 0.02,
  },
  "Genomic Analysis / Precision Medicine": {
    data_privacy: 0.25,
    clinical_validation: 0.3,
    approval_process: 0.2,
    transparency: 0.1,
    ethics: 0.1,
    post_market: 0.03,
    liability: 0.02,
  },
  "Drug Discovery / Development Support": {
    data_privacy: 0.15,
    clinical_validation: 0.25,
    approval_process: 0.35,
    transparency: 0.1,
    ethics: 0.1,
    post_market: 0.03,
    liability: 0.02,
  },
};

export const TABS = [
  { id: "map", label: "World Map" },
  { id: "compare", label: "Country Comparison" },
  { id: "themes", label: "Theme Analysis" },
  { id: "trends", label: "Global Trends" },
  { id: "details", label: "Country Details" },
  { id: "usecases", label: "AI Use Cases & Trends" },
  { id: "literature", label: "Literature Review" },
] as const;

export const LITERATURE_CARDS = [
  [
    "Radiology + Pathology",
    "AI-assisted diagnostics require strong clinical validation, workflow integration, and bias monitoring.",
  ],
  [
    "Genomics + Precision Medicine",
    "Privacy, data governance, and representative datasets matter due to sensitive health data.",
  ],
  [
    "Drug Discovery / Development",
    "Evidence quality and approval pathways shape how AI supports trials and safety documentation.",
  ],
  [
    "Clinical / Hospital Deployment",
    "Lifecycle governance helps manage drift and performance changes over time.",
  ],
  [
    "Public Health",
    "Governance and accountability are essential when AI supports surveillance at population scale.",
  ],
  [
    "Generative AI",
    "Foundation models introduce new risk questions beyond traditional SaMD assumptions.",
  ],
] as const;
