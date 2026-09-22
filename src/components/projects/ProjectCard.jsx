import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { PROJECT_STATUSES, STATUS_STYLES } from '@/lib/projectConstants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function fmt(date) {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, 'MMM d, yyyy') : null;
}

export default function ProjectCard({ project, onStatusChange, onClick }) {
  const style = STATUS_STYLES[project.status] || STATUS_STYLES.Planned;
  const start = fmt(project.start_date);
  const completed = fmt(project.completed_date);

  return (
    <div
      onClick={() => onClick(project)}
      className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
    >
      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
        {project.title}
      </h3>

      {project.category && (
        <span className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {project.category}
        </span>
      )}

      {project.tech_stack?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.tech_stack.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary"
            >
              {t}
            </span>
          ))}
          {project.tech_stack.length > 4 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              +{project.tech_stack.length - 4}
            </span>
          )}
        </div>
      )}

      {(start || completed) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {start && <span>Started {start}</span>}
          {start && completed && <span> · </span>}
          {completed && <span>Completed {completed}</span>}
        </div>
      )}

      <div onClick={(e) => e.stopPropagation()} className="mt-3">
        <Select
          value={project.status}
          onValueChange={(v) => onStatusChange(project, v)}
        >
          <SelectTrigger
            className={cn(
              'h-8 w-full border-0 text-xs font-medium hover:opacity-80',
              style.badge
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}