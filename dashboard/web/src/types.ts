export interface ThemeScores {
  data_privacy: number;
  clinical_validation: number;
  approval_process: number;
  transparency: number;
  ethics: number;
  post_market: number;
  liability: number;
}

export interface CountryRecord {
  country: string;
  iso_code: string;
  region: string;
  regulatory_body: string;
  data_privacy_law: string;
  ai_specific_regulation: string;
  medical_device_framework: string;
  approval_process: string;
  data_governance: string;
  clinical_validation: string;
  algorithmic_transparency: string;
  ethical_framework: string;
  post_market_surveillance: string;
  liability: string;
  key_legislations: string[];
  maturity_level: string;
  year_first_ai_regulation: number;
  num_ai_devices_approved: number;
  themes_scores: ThemeScores;
  challenges: string;
  notable_developments: string;
}

export interface GlobalTrend {
  trend: string;
  description: string;
  adoption_level: string;
  year_emerged: number;
}

export interface KeyReference {
  title: string;
  author: string;
  year: number;
  type: string;
}

export interface ComplianceDataset {
  metadata: {
    title: string;
    version: string;
    last_updated: string;
    description: string;
    themes: string[];
    sources: string[];
  };
  countries: CountryRecord[];
  global_trends: GlobalTrend[];
  key_references: KeyReference[];
}

export interface CountryRow {
  country: string;
  iso: string;
  iso3: string;
  region: string;
  regulatoryBody: string;
  dataPrivacyLaw: string;
  aiRegulation: string;
  deviceFramework: string;
  maturity: string;
  firstAiRegYear: number;
  aiDevicesApproved: number;
  challenges: string;
  notableDevelopments: string;
  approvalProcess: string;
  dataGovernance: string;
  clinicalValidation: string;
  algorithmicTransparency: string;
  ethicalFramework: string;
  postMarketSurveillance: string;
  liability: string;
  keyLegislations: string;
  scores: ThemeScores;
}

export type ThemeKey = keyof ThemeScores;

export type TabId =
  | "map"
  | "compare"
  | "themes"
  | "trends"
  | "details"
  | "usecases"
  | "literature";
