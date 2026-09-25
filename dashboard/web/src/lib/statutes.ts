/** Primary statute / guidance deep-links for RAG source cards. */
export const STATUTE_LINKS: Record<string, { title: string; url: string }[]> = {
  "European Union": [
    {
      title: "EU AI Act (EUR-Lex 2024/1689)",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
    {
      title: "GDPR (EUR-Lex)",
      url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    },
    {
      title: "EU MDR 2017/745",
      url: "https://eur-lex.europa.eu/eli/reg/2017/745/oj",
    },
  ],
  Germany: [
    {
      title: "EU AI Act (EUR-Lex)",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
  ],
  "United States": [
    {
      title: "FDA AI/ML SaMD Action Plan",
      url: "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
    },
    {
      title: "FDA PCCP guidance",
      url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial",
    },
    {
      title: "HIPAA overview (HHS)",
      url: "https://www.hhs.gov/hipaa/index.html",
    },
  ],
  "United Kingdom": [
    {
      title: "MHRA AI as a medical device",
      url: "https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device",
    },
  ],
  China: [
    {
      title: "NMPA medical device portal",
      url: "https://english.nmpa.gov.cn/",
    },
  ],
  Japan: [
    {
      title: "PMDA English site",
      url: "https://www.pmda.go.jp/english/",
    },
  ],
  Canada: [
    {
      title: "Health Canada medical devices",
      url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html",
    },
  ],
  Australia: [
    {
      title: "TGA medical devices",
      url: "https://www.tga.gov.au/products/medical-devices",
    },
  ],
  Singapore: [
    {
      title: "HSA medical devices",
      url: "https://www.hsa.gov.sg/medical-devices",
    },
  ],
  India: [
    {
      title: "CDSCO medical devices",
      url: "https://cdsco.gov.in/opencms/opencms/en/Medical-Device-Diagnostics/Medical-Device-Diagnostics/",
    },
  ],
  Multi: [
    {
      title: "IMDRF SaMD guidance",
      url: "https://www.imdrf.org/documents/software-medical-device-samd-key-definitions",
    },
    {
      title: "WHO AI ethics guidance",
      url: "https://www.who.int/publications/i/item/9789240029200",
    },
  ],
};

export function linksForJurisdiction(jurisdiction: string) {
  if (STATUTE_LINKS[jurisdiction]) return STATUTE_LINKS[jurisdiction];
  // fuzzy
  const key = Object.keys(STATUTE_LINKS).find(
    (k) =>
      jurisdiction.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(jurisdiction.toLowerCase()),
  );
  return key ? STATUTE_LINKS[key] : STATUTE_LINKS.Multi;
}

export const PROMPT_CHIPS = [
  {
    label: "EU AI Act high-risk",
    prompt: "EU AI Act high-risk classification criteria for healthcare AI systems",
  },
  {
    label: "FDA PCCP",
    prompt: "FDA Predetermined Change Control Plan (PCCP) requirements for adaptive AI/ML SaMD",
  },
  {
    label: "HIPAA vs GDPR",
    prompt: "HIPAA vs GDPR health data transfer and privacy obligations for clinical AI",
  },
  {
    label: "EU vs USA transparency",
    prompt: "Compare EU and USA algorithmic transparency duties for SaMD",
  },
  {
    label: "Liability gaps",
    prompt: "Why does liability lag privacy in emerging AI healthcare markets?",
  },
  {
    label: "Post-market Japan",
    prompt: "Post-market surveillance expectations for AI medical devices in Japan",
  },
  {
    label: "IMDRF risk tiers",
    prompt: "IMDRF SaMD risk categorization and corresponding clinical evidence expectations",
  },
  {
    label: "GMLP principles",
    prompt: "Good Machine Learning Practice (GMLP) principles for medical device AI",
  },
] as const;
