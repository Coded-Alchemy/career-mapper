export default function ScraperSummary({ criteria }) {
  const sources = criteria.sources || [];
  const titles = criteria.job_titles || [];

  let s = `Searching ${sources.length} source${sources.length === 1 ? '' : 's'}`;

  const level = criteria.experience_level && criteria.experience_level !== 'None'
    ? criteria.experience_level
    : '';
  const titleStr = titles.length ? titles.join(', ') : 'job';
  s += ` for ${level ? level + ' ' : ''}${titleStr} roles`;

  const loc = [criteria.state_region, criteria.country].filter(Boolean).join(', ');
  if (loc) s += ` in ${loc}`;

  if (criteria.min_salary) s += `, $${Number(criteria.min_salary).toLocaleString()}+`;

  if (criteria.clearance_level && criteria.clearance_level !== 'None') {
    s += `, ${criteria.clearance_level} clearance`;
  }

  return (
    <div className="rounded-xl border border-border bg-primary/5 px-4 py-3">
      <p className="text-sm text-foreground">{s}</p>
    </div>
  );
}