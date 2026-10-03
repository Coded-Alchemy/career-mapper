import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TONES = {
  default: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
};

export default function StatCard({ icon: Icon, label, value, to, tone = 'default', loading }) {
  return (
    <Link to={to} className="bp-card bp-card-interactive group p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="bp-label">{label}</span>
        <Icon className={cn('h-4 w-4 shrink-0', TONES[tone])} />
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">
        {loading ? (
          <span className="inline-block h-7 w-10 animate-pulse rounded bg-secondary" />
        ) : (
          value
        )}
      </div>
    </Link>
  );
}