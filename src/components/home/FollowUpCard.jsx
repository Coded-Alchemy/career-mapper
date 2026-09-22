import { Link } from 'react-router-dom';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { CalendarClock, ExternalLink } from 'lucide-react';

export default function FollowUpCard({ items, loading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-warning" />
        <h2 className="text-sm font-semibold text-foreground">Needs Follow-Up</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/50"
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
  );
}