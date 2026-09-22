import { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import GoalItem from './GoalItem';

const CATEGORIES = ['Career', 'Learning', 'Health', 'Personal', 'Other'];

export default function GoalsColumn() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Career', target_date: '' });

  useEffect(() => {
    base44.entities.Goal.list('-created_date', 500).then((data) => {
      setGoals(data);
      setLoading(false);
    });
  }, []);

  const active = useMemo(() => goals.filter((g) => g.status !== 'completed'), [goals]);
  const completed = useMemo(() => goals.filter((g) => g.status === 'completed'), [goals]);

  const add = async () => {
    if (!form.title.trim()) return;
    const created = await base44.entities.Goal.create({ ...form, status: 'active' });
    setGoals((prev) => [created, ...prev]);
    setForm({ title: '', description: '', category: 'Career', target_date: '' });
  };

  const complete = async (g) => {
    const updated = await base44.entities.Goal.update(g.id, { status: 'completed' });
    setGoals((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const remove = async (id) => {
    await base44.entities.Goal.delete(id);
    setGoals((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Goal title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          placeholder="Description (optional)"
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="flex gap-2">
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={form.target_date}
            onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
            className="flex-1"
          />
        </div>
        <Button onClick={add} disabled={!form.title.trim()} className="w-full">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : active.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No active goals yet.
        </p>
      ) : (
        <div className="space-y-2">
          {active.map((g) => (
            <GoalItem key={g.id} goal={g} onComplete={complete} onDelete={remove} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((s) => !s)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', !showCompleted && '-rotate-90')} />
            Completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="mt-2 space-y-2">
              {completed.map((g) => (
                <GoalItem key={g.id} goal={g} onComplete={complete} onDelete={remove} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}