import { cn } from '@/lib/utils';
import { PROJECT_STATUSES, STATUS_STYLES } from '@/lib/projectConstants';
import ProjectCard from './ProjectCard';

export default function ProjectBoard({ projects, onStatusChange, onCardClick }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {PROJECT_STATUSES.map((status) => {
        const items = projects.filter((p) => p.status === status);
        const style = STATUS_STYLES[status];
        return (
          <div
            key={status}
            className="flex max-h-[calc(100vh-380px)] min-h-[240px] flex-col rounded-xl border border-border bg-background/40"
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                <h2 className="text-sm font-semibold text-foreground">{status}</h2>
              </div>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
              {items.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  No projects
                </p>
              ) : (
                items.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onStatusChange={onStatusChange}
                    onClick={onCardClick}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}