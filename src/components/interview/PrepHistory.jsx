import { format, parseISO, isValid } from 'date-fns';
import { Trash2, History } from 'lucide-react';
import { cn } from '@/lib/utils';

function fmtDate(d) {
  if (!d) return '—';
  const dt = parseISO(d);
  return isValid(dt) ? format(dt, 'MMM d, yyyy') : '—';
}

export default function PrepHistory({ history, loading, currentId, onOpen, onDelete, applications }) {
  const appLabel = (id) => {
    if (!id) return '—';
    const a = applications.find((x) => x.id === id);
    return a ? `${a.company} — ${a.title}` : 'Linked';
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Past Prep Plans</h3>
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : history.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          No past prep plans yet.
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((r) => (
            <div
              key={r.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border bg-background/40 p-3 transition-colors',
                currentId === r.id ? 'border-primary' : 'border-border hover:border-primary/50'
              )}
            >
              <button onClick={() => onOpen(r)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <History className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {r.company} — {r.role_title}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {fmtDate(r.date_created)} · {appLabel(r.application_id)}
                  </div>
                </div>
              </button>
              <button
                onClick={() => onDelete(r)}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}