import { useMemo } from 'react';

export default function ProjectStats({ projects }) {
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === 'In Progress').length;
    const completed = projects.filter((p) => p.status === 'Completed').length;
    const techCount = {};
    projects.forEach((p) =>
      p.tech_stack?.forEach((t) => {
        techCount[t] = (techCount[t] || 0) + 1;
      })
    );
    const topTech = Object.entries(techCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return { total, inProgress, completed, topTech };
  }, [projects]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="bp-card p-4">
        <div className="bp-label">Total Projects</div>
        <div className="mt-2 text-2xl font-semibold text-foreground">{stats.total}</div>
      </div>
      <div className="bp-card p-4">
        <div className="bp-label">In Progress</div>
        <div className="mt-2 text-2xl font-semibold text-warning">{stats.inProgress}</div>
      </div>
      <div className="bp-card p-4">
        <div className="bp-label">Completed</div>
        <div className="mt-2 text-2xl font-semibold text-success">{stats.completed}</div>
      </div>
      <div className="bp-card p-4">
        <div className="bp-label">Top Technologies</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {stats.topTech.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            stats.topTech.map(([t, c]) => (
              <span key={t} className="bp-chip">
                {t} <span className="opacity-70">{c}</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}