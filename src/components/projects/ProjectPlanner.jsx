import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Plus, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const EXPERIENCE_LEVELS = ['New to this', 'Some exposure', 'Comfortable, want depth'];
const HOURS = ['2-3', '5', '10+'];

function buildNotes(plan) {
  const steps = (plan.build_steps || [])
    .map((s, i) => `[ ] ${i + 1}. ${s.step} (${s.time_estimate})`)
    .join('\n');
  const stretch = (plan.stretch_goals || []).map((s) => `[ ] ${s}`).join('\n');
  return [
    `Why this project: ${plan.why_this_project}`,
    '',
    'Build Steps:',
    steps,
    '',
    'Stretch Goals:',
    stretch,
    '',
    'Portfolio Bullet:',
    plan.portfolio_bullet,
  ].join('\n');
}

export default function ProjectPlanner({ open, onClose, onAdd }) {
  const [goals, setGoals] = useState([]);
  const [skillGoal, setSkillGoal] = useState('');
  const [experience, setExperience] = useState(EXPERIENCE_LEVELS[0]);
  const [hours, setHours] = useState('5');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      base44.entities.Goal.filter({ status: 'active' }).then(setGoals).catch(() => {});
    }
  }, [open]);

  const reset = () => {
    setSkillGoal('');
    setPlan(null);
    setError(null);
  };

  const runPlan = async () => {
    if (!skillGoal.trim()) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await base44.functions.invoke('planProject', {
        skill_goal: skillGoal,
        experience_level: experience,
        hours_per_week: hours,
      });
      if (res.data.error) setError(res.data.error);
      else setPlan(res.data.plan);
    } catch (e) {
      setError(e.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!plan) return;
    onAdd({
      title: plan.project_title,
      description: plan.description,
      category: plan.suggested_category,
      status: 'Planned',
      tech_stack: plan.tech_stack || [],
      skills_demonstrated: plan.skills_demonstrated || [],
      notes: buildNotes(plan),
    });
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Project Planner
          </DialogTitle>
          <DialogDescription>
            Tell the AI what you want to learn — it'll design a portfolio-worthy project around it.
          </DialogDescription>
        </DialogHeader>

        {!plan && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="skillGoal">Skill or goal to learn</Label>
              <Input
                id="skillGoal"
                value={skillGoal}
                onChange={(e) => setSkillGoal(e.target.value)}
                placeholder="e.g. SIEM log analysis, Terraform, Kubernetes"
              />
              {goals.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Or pick from a goal:</span>
                  <Select
                    value=""
                    onValueChange={(v) => v && setSkillGoal(v)}
                  >
                    <SelectTrigger className="h-8 w-[200px] text-xs">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((g) => (
                        <SelectItem key={g.id} value={g.title}>
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Current experience</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hours per week</Label>
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h} {h === '1' ? 'hour' : 'hours'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button onClick={runPlan} disabled={loading || !skillGoal.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Designing your project…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Plan My Project
                </>
              )}
            </Button>
          </div>
        )}

        {plan && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{plan.project_title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <p className="mt-2 text-sm text-primary">
                <span className="font-medium">Why: </span>
                {plan.why_this_project}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {plan.suggested_category}
              </span>
              {plan.tech_stack?.map((t) => (
                <span
                  key={t}
                  className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {t}
                </span>
              ))}
            </div>

            {plan.skills_demonstrated?.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skills Demonstrated
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plan.skills_demonstrated.map((s) => (
                    <span
                      key={s}
                      className="rounded border border-border px-2 py-0.5 text-xs text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Build Steps
              </div>
              <ol className="space-y-1.5">
                {plan.build_steps?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-[10px] text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{s.step}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {s.time_estimate}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {plan.stretch_goals?.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stretch Goals
                </div>
                <ul className="space-y-1">
                  {plan.stretch_goals.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg border border-success/30 bg-success/10 p-3">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-success">
                Portfolio Bullet
              </div>
              <p className="text-sm text-foreground">{plan.portfolio_bullet}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">
                <Plus className="h-4 w-4" />
                Add to Tracker
              </Button>
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Plan another
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}