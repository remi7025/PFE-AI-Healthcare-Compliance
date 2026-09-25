import type { CountryRow, ThemeKey } from "../types";
import { THEME_LABELS } from "../constants";
import { weightedComposite } from "./weights";

export function exportCsv(
  rows: CountryRow[],
  themeKeys: ThemeKey[],
  weights?: Partial<Record<ThemeKey, number>>,
): string {
  const headers = [
    "Country",
    "Region",
    "Maturity",
    "Composite_Sc",
    "AI_Devices_Throughput",
    ...themeKeys.map((k) => k),
  ];
  const lines = rows.map((r) => {
    const sc = weights
      ? weightedComposite(r, weights, themeKeys)
      : themeKeys.reduce((s, k) => s + r.scores[k], 0) / Math.max(1, themeKeys.length);
    return [
      r.country,
      r.region,
      r.maturity,
      Math.round(sc * 100) / 100,
      r.aiDevicesApproved,
      ...themeKeys.map((k) => r.scores[k]),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });
  return [headers.join(","), ...lines].join("\n");
}

/** Minimal XLSX (SpreadsheetML) workbook as a downloadable blob. */
export function exportExcelXml(
  rows: CountryRow[],
  themeKeys: ThemeKey[],
  weights?: Partial<Record<ThemeKey, number>>,
): string {
  const header = [
    "Country",
    "Region",
    "Maturity",
    "Composite_Sc",
    "Devices_Throughput",
    ...themeKeys.map((k) => THEME_LABELS[k]),
  ];
  const body = rows.map((r) => {
    const sc = weights
      ? weightedComposite(r, weights, themeKeys)
      : themeKeys.reduce((s, k) => s + r.scores[k], 0) / Math.max(1, themeKeys.length);
    return [
      r.country,
      r.region,
      r.maturity,
      Math.round(sc * 100) / 100,
      r.aiDevicesApproved,
      ...themeKeys.map((k) => r.scores[k]),
    ];
  });
  const rowsXml = [header, ...body]
    .map(
      (row) =>
        `<Row>${row
          .map((c) => {
            const n = typeof c === "number";
            return n
              ? `<Cell><Data ss:Type="Number">${c}</Data></Cell>`
              : `<Cell><Data ss:Type="String">${String(c)
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")}</Data></Cell>`;
          })
          .join("")}</Row>`,
    )
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Compliance"><Table>${rowsXml}</Table></Worksheet>
</Workbook>`;
}

export function exportCountryPdfHtml(row: CountryRow, sc: number): string {
  const themes = Object.entries(row.scores)
    .map(([k, v]) => `<tr><td>${k.replace(/_/g, " ")}</td><td>${v}</td></tr>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${row.country} — Compliance dossier</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;color:#111;line-height:1.45}
h1{color:#052b52} .badge{display:inline-block;background:#eef2ff;padding:.2rem .6rem;border-radius:4px;margin-right:.4rem}
table{border-collapse:collapse;width:100%} td,th{border:1px solid #ccc;padding:.4rem .6rem;text-align:left}
.note{font-size:.85rem;color:#555;margin-top:1.5rem}
.throughput{background:#f8fafc;border:1px solid #cbd5e1;padding:1rem;margin:1rem 0}
.rigor{background:#ecfdf5;border:1px solid #6ee7b7;padding:1rem;margin:1rem 0}
</style></head><body>
<h1>${row.country}</h1>
<p><span class="badge">${row.region}</span><span class="badge">${row.maturity}</span></p>
<div class="rigor"><strong>Regulatory rigor (composite Sc):</strong> ${sc.toFixed(2)} / 10<br/>
<em>Weighted / unweighted theme average — research indicator only.</em></div>
<div class="throughput"><strong>Market throughput (devices):</strong> ${row.aiDevicesApproved}<br/>
<em>Authorization count is not part of Sc and is not cross-border comparable.</em></div>
<h2>Theme scores</h2>
<table><thead><tr><th>Theme</th><th>Score</th></tr></thead><tbody>${themes}</tbody></table>
<h2>Key legislations</h2><p>${row.keyLegislations}</p>
<h2>Approval process</h2><p>${row.approvalProcess}</p>
<h2>Data governance</h2><p>${row.dataGovernance}</p>
<h2>Clinical validation</h2><p>${row.clinicalValidation}</p>
<h2>Challenges</h2><p>${row.challenges}</p>
<p class="note">Audit dossier generated from the curated project dataset. Not legal advice.</p>
<script>window.onload=()=>window.print()</script>
</body></html>`;
}

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
