import { z } from "zod";
import type { ComplianceDataset } from "../types";

const ThemeScoresSchema = z.object({
  data_privacy: z.number().min(1).max(10),
  clinical_validation: z.number().min(1).max(10),
  approval_process: z.number().min(1).max(10),
  transparency: z.number().min(1).max(10),
  ethics: z.number().min(1).max(10),
  post_market: z.number().min(1).max(10),
  liability: z.number().min(1).max(10),
});

const CountrySchema = z.object({
  country: z.string().min(1),
  iso_code: z.string().min(1),
  region: z.string().min(1),
  regulatory_body: z.string(),
  data_privacy_law: z.string(),
  ai_specific_regulation: z.string(),
  medical_device_framework: z.string(),
  approval_process: z.string(),
  data_governance: z.string(),
  clinical_validation: z.string(),
  algorithmic_transparency: z.string(),
  ethical_framework: z.string(),
  post_market_surveillance: z.string(),
  liability: z.string(),
  key_legislations: z.array(z.string()),
  maturity_level: z.string(),
  year_first_ai_regulation: z.number(),
  num_ai_devices_approved: z.number().nonnegative(),
  themes_scores: ThemeScoresSchema,
  challenges: z.string(),
  notable_developments: z.string(),
});

export const ComplianceDatasetSchema = z.object({
  metadata: z.object({
    title: z.string(),
    version: z.string(),
    last_updated: z.string(),
    description: z.string(),
    themes: z.array(z.string()).min(1),
    sources: z.array(z.string()),
  }),
  countries: z.array(CountrySchema).min(1),
  global_trends: z.array(
    z.object({
      trend: z.string(),
      description: z.string(),
      adoption_level: z.string(),
      year_emerged: z.number(),
    }),
  ),
  key_references: z.array(
    z.object({
      title: z.string(),
      author: z.string(),
      year: z.number(),
      type: z.string(),
    }),
  ),
});

export function validateDataset(data: unknown): ComplianceDataset {
  const parsed = ComplianceDatasetSchema.parse(data);
  return parsed as ComplianceDataset;
}
