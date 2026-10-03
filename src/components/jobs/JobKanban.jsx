import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ExternalLink, MapPin } from 'lucide-react';
import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import useListHeight from '@/hooks/useListHeight';
import { JOB_STATUSES, JOB_STATUS_STYLES } from '@/lib/jobConstants';

function normalizeUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  if (!isValid(d)) return null;
  const diff = differenceInCalendarDays(new Date(), d);
  if (diff <= 0) return 'Applied today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

const COLUMN_HEADER = {
  Offer: { text: 'text-success', border: 'border-success/40' },
  Rejected: { text: 'text-destructive', border: 'border-destructive/40' },
  Ghosted: { text: 'text-destructive', border: 'border-destructive/40' },
};

export default function JobKanban({ applications, onStatusChange, onCardClick }) {
  const [listRef, listHeight] = useListHeight();

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const destStatus = result.destination.droppableId;
    const app = applications.find((a) => a.id === result.draggableId);
    if (app && app.status !== destStatus) onStatusChange(app, destStatus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        ref={listRef}
        style={{ maxHeight: listHeight ?? undefined }}
        className="flex gap-4 overflow-x-auto pb-2"
      >
        {JOB_STATUSES.map((status) => {
          const items = applications.filter((a) => a.status === status);
          const header = COLUMN_HEADER[status] || {
            text: 'text-foreground',
            border: 'border-border',
          };
          return (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  className={cn(
                    'flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border bg-background/40',
                    header.border
                  )}
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card/60 px-3 py-2.5">
                    <span className={cn('text-sm font-semibold', header.text)}>
                      {status}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        JOB_STATUS_STYLES[status]
                      )}
                    >
                      {items.length}
                    </span>
                  </div>

                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2',
                      snapshot.isDraggingOver && 'bg-muted/30'
                    )}
                  >
                    {items.map((app, index) => {
                      const url = normalizeUrl(app.job_url);
                      const days = daysSince(app.date_applied);
                      return (
                        <Draggable draggableId={app.id} index={index} key={app.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onCardClick(app)}
                              className={cn(
                                'cursor-pointer rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md',
                                snapshot.isDragging &&
                                  'shadow-lg ring-2 ring-primary/40'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium text-foreground">
                                    {app.company}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {app.title}
                                  </div>
                                </div>
                                {url && (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-primary"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {app.salary_range && <span>{app.salary_range}</span>}
                                {app.location && (
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {app.location}
                                  </span>
                                )}
                                {app.remote && (
                                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                    Remote
                                  </span>
                                )}
                              </div>

                              {days && (
                                <div className="mt-1.5 text-xs text-muted-foreground">
                                  {days}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}