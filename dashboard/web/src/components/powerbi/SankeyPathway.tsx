/** IMDRF Class I–IV → evidence → post-market flow (SVG Sankey-style). */

const NODES = {
  L0: [
    { id: "I", label: "Class I", y: 40 },
    { id: "II", label: "Class II", y: 110 },
    { id: "III", label: "Class III", y: 180 },
    { id: "IV", label: "Class IV", y: 250 },
  ],
  L1: [
    { id: "lit", label: "Literature / bench", y: 50 },
    { id: "retro", label: "Retrospective clinical", y: 130 },
    { id: "prosp", label: "Prospective / pivoted", y: 210 },
  ],
  L2: [
    { id: "pms", label: "Post-market tracking", y: 90 },
    { id: "retrain", label: "Change control / PCCP", y: 180 },
    { id: "recall", label: "Signal & recall path", y: 260 },
  ],
};

const FLOWS: { from: string; to: string; w: number; color: string }[] = [
  { from: "I", to: "lit", w: 8, color: "#66c2a5" },
  { from: "II", to: "lit", w: 6, color: "#66c2a5" },
  { from: "II", to: "retro", w: 10, color: "#8da0cb" },
  { from: "III", to: "retro", w: 12, color: "#8da0cb" },
  { from: "III", to: "prosp", w: 14, color: "#fc8d62" },
  { from: "IV", to: "prosp", w: 16, color: "#fc8d62" },
  { from: "lit", to: "pms", w: 10, color: "#a6d854" },
  { from: "retro", to: "pms", w: 12, color: "#a6d854" },
  { from: "retro", to: "retrain", w: 8, color: "#e78ac3" },
  { from: "prosp", to: "retrain", w: 14, color: "#e78ac3" },
  { from: "prosp", to: "recall", w: 10, color: "#e5c494" },
];

function nodePos(id: string): { x: number; y: number } | null {
  const col0 = NODES.L0.find((n) => n.id === id);
  if (col0) return { x: 60, y: col0.y };
  const col1 = NODES.L1.find((n) => n.id === id);
  if (col1) return { x: 280, y: col1.y };
  const col2 = NODES.L2.find((n) => n.id === id);
  if (col2) return { x: 500, y: col2.y };
  return null;
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

export function SankeyPathway() {
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 600 320" className="h-[280px] w-full min-w-[480px]">
        <text x="60" y="18" className="fill-[#64748b]" fontSize="10" fontWeight="600">
          IMDRF risk tier
        </text>
        <text x="280" y="18" className="fill-[#64748b]" fontSize="10" fontWeight="600">
          Evidence requirement
        </text>
        <text x="500" y="18" className="fill-[#64748b]" fontSize="10" fontWeight="600">
          Post-market
        </text>
        {FLOWS.map((f) => {
          const a = nodePos(f.from);
          const b = nodePos(f.to);
          if (!a || !b) return null;
          return (
            <path
              key={`${f.from}-${f.to}`}
              d={curve(a.x + 40, a.y + 12, b.x - 4, b.y + 12)}
              fill="none"
              stroke={f.color}
              strokeWidth={Math.max(2, f.w / 2)}
              strokeOpacity={0.55}
            />
          );
        })}
        {[...NODES.L0, ...NODES.L1, ...NODES.L2].map((n) => {
          const p = nodePos(n.id)!;
          return (
            <g key={n.id}>
              <rect
                x={p.x - 4}
                y={p.y}
                width={88}
                height={28}
                rx={4}
                fill="#0f172a"
              />
              <text
                x={p.x + 40}
                y={p.y + 18}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="9"
                fontWeight="600"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-[10px] text-[#8b93a7]">
        Illustrative clinical validation pathway: higher IMDRF classes map to stronger prospective
        evidence and change-control / signal management duties.
      </p>
    </div>
  );
}
