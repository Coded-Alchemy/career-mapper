import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JOB_STATUSES } from '@/lib/jobConstants';

const PILL = {
  done: 'border-success/40 bg-success/15 text-success',
  current: 'border-primary bg-primary text-primary-foreground',
  'current-bad': 'border-destructive bg-destructive text-destructive-foreground',
  upcoming: 'border-border bg-muted/30 text-muted-foreground',
};

export default function StatusTimeline({ status }) {
  const currentIndex = JOB_STATUSES.indexOf(status);
  const isTerminal = status === 'Rejected' || status === 'Ghosted';

  const stateFor = (i) => {
    if (isTerminal) return i === currentIndex ? 'current-bad' : 'upcoming';
    if (i < currentIndex) return 'done';
    if (i === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2.5">
      {JOB_STATUSES.map((s, i) => {
        const st = stateFor(i);
        return (
          <Fragment key={s}>
            {i > 0 && (
              <div
                className={cn(
                  'h-px w-3 shrink-0',
                  i <= currentIndex && !isTerminal ? 'bg-success/50' : 'bg-border'
                )}
              />
            )}
            <div
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                PILL[st]
              )}
            >
              {st === 'done' && <Check className="h-3 w-3" />}
              {s}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}