import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Check, Target, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PRIORITY_STYLES = {
  Critical: 'bg-destructive/15 text-destructive',
  Important: 'bg-warning/15 text-warning',
  'Nice to Have': 'bg-primary/15 text-primary',
};
const PRIORITY_ORDER = ['Critical', 'Important', 'Nice to Have'];

function fmtDate(d) {
  if (!d) return '—';
  const dt = parseISO(d);
  return isValid(dt) ? format(dt, 'MMM d, yyyy') : '—';
}

export default function RoadmapResult({ roadmap, onToggleSkill, onAddToGoals }) {
  const [addMsg, setAddMsg] = useState('');
  const checked = new Set(roadmap.checked_skills || []);
  const added = new Set(roadmap.added_milestones || []);

  const grouped = (roadmap.skill_gaps || []).reduce((acc, g) => {
    (acc[g.priority] = acc[g.priority] || []).push(g);
    return acc;
  }, {});

  const confirmAdd = async () => {
    const res = await onAddToGoals();
    setAddMsg(
      `Created ${res.created} goal${res.created === 1 ? '' : 's'}${
        res.skipped ? ` · ${res.skipped} already added` : ''
      }.`
    );
  };

  const rolePath = roadmap.role_path || [];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-semibold text-foreground">{roadmap.target_role}</h3>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            {roadmap.timeframe}
          </span>
          <span className="text-xs text-muted-foreground">{fmtDate(roadmap.date_created)}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{roadmap.current_assessment}</p>
      </div>

      {rolePath.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Role Path</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2.5">
            {rolePath.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex w-44 shrink-0 flex-col rounded-lg border p-3',
                    step.is_target
                      ? 'border-success/50 bg-success/10'
                      : step.is_current
                        ? 'border-border bg-muted/30'
                        : 'border-border bg-background/40'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {step.is_target ? (
                      <Target className="h-3.5 w-3.5 text-success" />
                    ) : step.is_current ? (
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={cn('text-sm font-medium', step.is_target && 'text-success')}>
                      {step.title}
                    </span>
                  </div>
                  <span className="mt-1 text-xs text-muted-foreground">{step.duration}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{step.extract}</span>
                </div>
                {i < rolePath.length - 1 && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmap.feasibility_note && (
        <div className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">{roadmap.feasibility_note}</p>
        </div>
      )}

      {(roadmap.skill_gaps || []).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Skill Gaps</h4>
          <div className="space-y-4">
            {PRIORITY_ORDER.filter((p) => grouped[p]?.length).map((p) => (
              <div key={p}>
                <div className="mb-2">
                  <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-medium', PRIORITY_STYLES[p])}>
                    {p}
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[p].map((g, idx) => {
                    const isChecked = checked.has(g.skill);
                    return (
                      <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-border bg-background/40 p-3">
                        <button
                          onClick={() => onToggleSkill(g.skill)}
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                            isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                          )}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <div className={cn('text-sm font-medium text-foreground', isChecked && 'text-muted-foreground line-through')}>
                            {g.skill}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{g.how_to_learn}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(roadmap.certifications || []).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Certifications</h4>
          <div className="space-y-2">
            {roadmap.certifications.map((c, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border bg-background/40 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.why}</div>
                  <div className="mt-1 text-xs font-medium text-primary">{c.timeline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(roadmap.milestones || []).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Milestones</h4>
          <div className="relative space-y-4 pl-6">
            <div className="absolute bottom-1 left-2 top-1 w-px bg-border" />
            {roadmap.milestones.map((m, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{m.phase}</span>
                  {added.has(m.phase) && (
                    <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                      Added to Goals
                    </span>
                  )}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {(m.actions || []).map((a, j) => (
                    <li key={j} className="text-xs text-muted-foreground">• {a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Milestones to Goals
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add roadmap milestones to Goals?</AlertDialogTitle>
              <AlertDialogDescription>
                This creates a Career goal for each milestone phase, with target dates spread across{' '}
                {roadmap.timeframe}. Phases already added will be skipped.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAdd}>Add Goals</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {addMsg && <span className="text-sm text-muted-foreground">{addMsg}</span>}
      </div>
    </div>
  );
}