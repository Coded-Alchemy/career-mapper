import { useMemo } from 'react';
import { INTERVIEW_STATUSES, PAST_APPLIED_STATUSES } from '@/lib/jobConstants';

function Stat({ label, value, tone }) {
  const toneClass =
    tone === 'warning'
      ? 'text-warning'
      : tone === 'success'
      ? 'text-success'
      : 'text-foreground';
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

export default function JobStats({ applications }) {
  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((a) =>
      INTERVIEW_STATUSES.includes(a.status)
    ).length;
    const offers = applications.filter((a) => a.status === 'Offer').length;
    const responded = applications.filter((a) =>
      PAST_APPLIED_STATUSES.includes(a.status)
    ).length;
    const responseRate = total ? Math.round((responded / total) * 100) : 0;
    return { total, interviews, offers, responseRate };
  }, [applications]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Total Applications" value={stats.total} />
      <Stat label="Interviews" value={stats.interviews} tone="warning" />
      <Stat label="Offers" value={stats.offers} tone="success" />
      <Stat label="Response Rate" value={`${stats.responseRate}%`} />
    </div>
  );
}