import { Link } from 'react-router-dom';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { CalendarClock, ExternalLink } from 'lucide-react';
import SectionTitle from '@/components/blueprint/SectionTitle';

export default function FollowUpCard({ items, loading }) {
  return (
    <div className="bp-card">
      <div className="bp-cardhead">
        <CalendarClock className="h-4 w-4 text-warning" />
        <SectionTitle>Needs Follow-Up</SectionTitle>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing due — you're all caught up.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((app) => {
              const daysOverdue = differenceInCalendarDays(
                new Date(),
                parseISO(app.follow_up_date)
              );
              return (
                <li key={app.id}>
                  <Link
                    to="/jobs"
                    className="bp-control flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {app.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {app.company}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={
                          daysOverdue > 0
                            ? 'rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive'
                            : 'rounded-md bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning'
                        }
                      >
                        {daysOverdue > 0
                          ? `${daysOverdue}d overdue`
                          : 'Due today'}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}