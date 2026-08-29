/** SVG gradient defs for Recharts — use inside BarChart/PieChart */
export function ChartGradients() {
  return (
    <defs>
      <linearGradient id="gradBlue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#118dff" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#118dff" />
      </linearGradient>
      <linearGradient id="gradTeal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="gradNavy" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#12239e" />
        <stop offset="100%" stopColor="#744ec2" />
      </linearGradient>
      <linearGradient id="gradGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f2c811" />
        <stop offset="100%" stopColor="#e66c37" />
      </linearGradient>
    </defs>
  );
}
