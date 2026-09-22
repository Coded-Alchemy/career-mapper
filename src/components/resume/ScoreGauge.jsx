export default function ScoreGauge({ score }) {
  const s = Math.max(0, Math.min(100, score || 0));
  const color = s >= 75 ? '#2FBF71' : s >= 50 ? '#F5A623' : '#E5484D';
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (s / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold leading-none" style={{ color }}>
          {Math.round(s)}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">ATS Fit</span>
      </div>
    </div>
  );
}