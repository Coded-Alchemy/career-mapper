import { format, parseISO, differenceInCalendarDays, isValid } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES = {
  Career: 'bg-primary/15 text-primary',
  Learning: 'bg-indigo-500/15 text-indigo-400',
  Health: 'bg-success/15 text-success',
  Personal: 'bg-warning/15 text-warning',
  Other: 'bg-muted text-muted-foreground',
};

function daysRemaining(target) {
  if (!target) return null;
  const d = parseISO(target);
  if (!isValid(d)) return null;
  const diff = differenceInCalendarDays(d, new Date());
  if (diff > 0) return `${diff} days left`;
  if (diff === 0) return 'Due today';
  return `${Math.abs(diff)} days overdue`;
}

export default function GoalItem({ goal, onComplete, onDelete }) {
  const done = goal.status === 'completed';
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-sm font-medium text-foreground', done && 'text-muted-foreground line-through')}>
            {goal.title}
          </span>
          <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-medium', CATEGORY_STYLES[goal.category] || CATEGORY_STYLES.Other)}>
            {goal.category}
          </span>
        </div>
        {goal.description && (
          <p className="mt-1 text-xs text-muted-foreground">{goal.description}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {goal.target_date && (
            <span>{format(parseISO(goal.target_date), 'MMM d, yyyy')}</span>
          )}
          {daysRemaining(goal.target_date) && <span>{daysRemaining(goal.target_date)}</span>}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        {!done && (
          <button
            onClick={() => onComplete(goal)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:text-success"
            title="Mark complete"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(goal.id)}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive"
          title="Delete goal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}