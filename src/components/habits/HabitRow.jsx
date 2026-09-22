import { format, subDays, parseISO } from 'date-fns';
import { Flame, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeHabitStreak, computeBestStreak } from '@/lib/habitStreak';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitRow({ habit, logs, goals, onToggleDay, onDelete }) {
  const logDates = logs.map((l) => parseISO(l.date));
  const streak = computeHabitStreak(logDates, habit.frequency);
  const best = computeBestStreak(logDates, habit.frequency);
  const loggedSet = new Set(logs.map((l) => l.date));

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const ds = format(d, 'yyyy-MM-dd');
    days.push({
      date: ds,
      label: DAY_LETTERS[d.getDay()],
      dayNum: format(d, 'd'),
      logged: loggedSet.has(ds),
    });
  }

  const goal = habit.goal_id ? goals.find((g) => g.id === habit.goal_id) : null;
  const unit = habit.frequency === 'weekly' ? 'week' : 'day';

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{habit.name}</div>
          {goal && (
            <div className="truncate text-[11px] text-muted-foreground">
              Linked to: {goal.title}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(habit)}
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
          title="Delete habit"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex gap-1.5">
        {days.map((d) => (
          <button
            key={d.date}
            onClick={() => onToggleDay(habit, d.date)}
            className={cn(
              'flex h-10 w-10 flex-col items-center justify-center rounded-md border transition-colors',
              d.logged
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted/40'
            )}
            title={format(parseISO(d.date), 'EEE, MMM d')}
          >
            <span className="text-[9px] leading-none opacity-70">{d.label}</span>
            <span className="mt-0.5 text-xs font-semibold leading-none">{d.dayNum}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <Flame className={cn('h-4 w-4', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
        <span className="text-sm font-medium text-foreground">{streak}</span>
        <span className="text-xs text-muted-foreground">{unit} streak</span>
        <span className="ml-2 text-xs text-muted-foreground">Best {best}</span>
      </div>
    </div>
  );
}