import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import HabitRow from './HabitRow';

const norm = (d) => {
  if (!d) return '';
  const dt = parseISO(d);
  return isValid(dt) ? format(dt, 'yyyy-MM-dd') : '';
};

export default function HabitsColumn() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', frequency: 'daily', goal_id: '' });

  useEffect(() => {
    Promise.all([
      base44.entities.Habit.list('-created_date', 500),
      base44.entities.HabitLog.list('-date', 1000),
      base44.entities.Goal.filter({ status: 'active' }, '-created_date', 200),
    ]).then(([hs, ls, gs]) => {
      setHabits(hs);
      setLogs(ls);
      setGoals(gs);
      setLoading(false);
    });
  }, []);

  const logsByHabit = useMemo(() => {
    const m = {};
    logs.forEach((l) => {
      const key = l.habit_id;
      (m[key] = m[key] || []).push({ ...l, date: norm(l.date) });
    });
    return m;
  }, [logs]);

  const add = async () => {
    if (!form.name.trim()) return;
    const created = await base44.entities.Habit.create({
      name: form.name,
      frequency: form.frequency,
      goal_id: form.goal_id || undefined,
    });
    setHabits((prev) => [created, ...prev]);
    setForm({ name: '', frequency: 'daily', goal_id: '' });
  };

  const remove = async (habit) => {
    await base44.entities.Habit.delete(habit.id);
    await base44.entities.HabitLog.deleteMany({ habit_id: habit.id }).catch(() => {});
    setHabits((prev) => prev.filter((x) => x.id !== habit.id));
    setLogs((prev) => prev.filter((l) => l.habit_id !== habit.id));
  };

  const toggleDay = async (habit, dateStr) => {
    const existing = (logsByHabit[habit.id] || []).find((l) => l.date === dateStr);
    if (existing) {
      await base44.entities.HabitLog.delete(existing.id);
      setLogs((prev) => prev.filter((l) => l.id !== existing.id));
    } else {
      const created = await base44.entities.HabitLog.create({ habit_id: habit.id, date: dateStr });
      setLogs((prev) => [...prev, created]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Habit name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <div className="flex gap-2">
          <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.goal_id || 'none'} onValueChange={(v) => setForm((f) => ({ ...f, goal_id: v === 'none' ? '' : v }))}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Link to goal (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No goal</SelectItem>
              {goals.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={add} disabled={!form.name.trim()} className="w-full">
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : habits.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No habits yet. Add one to start tracking.
        </p>
      ) : (
        <div className="space-y-2">
          {habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              logs={logsByHabit[h.id] || []}
              goals={goals}
              onToggleDay={toggleDay}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}