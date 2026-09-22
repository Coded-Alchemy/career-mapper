import { useEffect, useState } from 'react';
import {
  Phone, Mail, Users, MessageSquare, MoreHorizontal, Trash2, Plus,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const INTERACTION_TYPES = ['Call', 'Email', 'Interview', 'Message', 'Other'];
const TYPE_ICON = {
  Call: Phone, Email: Mail, Interview: Users, Message: MessageSquare, Other: MoreHorizontal,
};
const TYPE_COLOR = {
  Call: 'text-indigo-400 bg-indigo-500/15',
  Email: 'text-primary bg-primary/15',
  Interview: 'text-warning bg-warning/15',
  Message: 'text-success bg-success/15',
  Other: 'text-muted-foreground bg-muted/40',
};

function fmtDate(d) {
  if (!d) return '—';
  const date = parseISO(d);
  return isValid(date) ? format(date, 'MMM d, yyyy') : '—';
}

export default function InteractionLog({ applicationId }) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'Email',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  useEffect(() => {
    setLoading(true);
    base44.entities.Interaction
      .filter({ application_id: applicationId }, '-date', 200)
      .then((data) => {
        setInteractions(data);
        setLoading(false);
      });
  }, [applicationId]);

  const add = async () => {
    if (!form.type) return;
    const created = await base44.entities.Interaction.create({
      application_id: applicationId,
      type: form.type,
      date: form.date,
      notes: form.notes,
    });
    setInteractions((prev) => [created, ...prev]);
    setForm({ type: 'Email', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  };

  const remove = async (id) => {
    await base44.entities.Interaction.delete(id);
    setInteractions((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Type</span>
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Date</span>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-[160px]"
            />
          </div>
          <div className="min-w-[200px] flex-1 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Notes</span>
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Add notes about this interaction"
            />
          </div>
          <Button onClick={add}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : interactions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No interactions logged yet.
        </p>
      ) : (
        <div className="space-y-2">
          {interactions.map((it) => {
            const Icon = TYPE_ICON[it.type] || MoreHorizontal;
            return (
              <div key={it.id} className="flex gap-3 rounded-xl border border-border bg-background/40 p-3">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', TYPE_COLOR[it.type] || TYPE_COLOR.Other)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{it.type}</span>
                    <span className="text-xs text-muted-foreground">{fmtDate(it.date)}</span>
                  </div>
                  {it.notes && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{it.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(it.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}