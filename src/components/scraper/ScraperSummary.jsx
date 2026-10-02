export default function ScraperSummary({ criteria }) {
  const sources = criteria.sources || [];
  const titles = criteria.job_titles || [];
  const level = criteria.experience_level && criteria.experience_level !== 'None'
    ? criteria.experience_level
    : '';
  const titleStr = titles.length ? titles.join(', ') : 'job';
  const loc = [criteria.state_region, criteria.country].filter(Boolean).join(', ');

  const extras = [];
  if (criteria.min_salary) extras.push(`$${Number(criteria.min_salary).toLocaleString()}+`);
  if (criteria.clearance_level && criteria.clearance_level !== 'None') {
    extras.push(`${criteria.clearance_level} clearance`);
  }

  return (
    <div className="jb-summary">
      <strong>Searching {sources.length} source{sources.length === 1 ? '' : 's'}</strong>
      <br />
      for {level ? `${level} ` : ''}{titleStr} roles
      <br />
      in {loc || 'any location'}{extras.length ? ` (${extras.join(', ')})` : ''}
    </div>
  );
}