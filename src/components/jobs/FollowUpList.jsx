import { useMemo } from 'react';
import { parseISO, isBefore, isToday, format, differenceInCalendarDays } from 'date-fns';
import { Bell, Clock, ExternalLink } from 'lucide-react';
import { JOB_STATUS_STYLES } from '@/lib/jobConstants';
import SectionTitle from '@/components/blueprint/SectionTitle';

export default function FollowUpList({ applications, onSnooze, onOpen }) {
  const due = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return applications
      .filter((a) => a.follow_up_date)
      .map((a) => ({ app: a, date: parseISO(a.follow_up_date) }))
      .filter(({ date }) => isBefore(date, today) || isToday(date))
      .sort((a, b) => a.date - b.date)
      .map(({ app, date }) => {
        const diff = differenceInCalendarDays(today, date);
        return {
          app,
          label: isToday(date)
            ? 'Due today'
            : diff === 1
            ? '1 day overdue'
            : `${diff} days overdue`,
        };
      });
  }, [applications]);

  return (
    <div className="bp-card">
      <div className="bp-cardhead">
        <Bell className="h-4 w-4 text-warning" />
        <SectionTitle>Needs Follow-Up</SectionTitle>
        <span className="bp-count ml-auto">{due.length}</span>
      </div>

      {due.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing due — you're all caught up.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {due.map(({ app, label }) => (
            <li
              key={app.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5"
            >
              <button
                onClick={() => onOpen(app)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {app.company}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${JOB_STATUS_STYLES[app.status] || ''}`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {app.title}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-warning">
                  <Clock className="h-3 w-3" />
                  {label} · due {format(parseISO(app.follow_up_date), 'MMM d')}
                </div>
              </button>
              <button
                onClick={() => onSnooze(app)}
                className="bp-btn shrink-0"
              >
                Snooze 1w
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}