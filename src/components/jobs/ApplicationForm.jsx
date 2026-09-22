import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TagInput from '@/components/projects/TagInput';
import { JOB_STATUSES } from '@/lib/jobConstants';

const EMPTY = {
  company: '',
  title: '',
  job_url: '',
  date_applied: '',
  status: 'To Apply',
  salary_range: '',
  location: '',
  remote: false,
  tech_stack: [],
  contact_name: '',
  contact_email: '',
  notes: '',
  follow_up_date: '',
};

export default function ApplicationForm({
  open,
  application,
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(application ? { ...EMPTY, ...application } : EMPTY);
  }, [open, application]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.company.trim() || !form.title.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {application ? 'Edit Application' : 'Add Application'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Company"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_applied">Date Applied</Label>
              <Input
                id="date_applied"
                type="date"
                value={form.date_applied}
                onChange={(e) => set('date_applied', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job_url">Job URL</Label>
            <Input
              id="job_url"
              value={form.job_url}
              onChange={(e) => set('job_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={form.salary_range}
                onChange={(e) => set('salary_range', e.target.value)}
                placeholder="e.g. $90k–$120k"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="City, State or Remote"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label htmlFor="remote" className="text-sm font-medium">
              Remote
            </Label>
            <Switch
              id="remote"
              checked={!!form.remote}
              onCheckedChange={(v) => set('remote', v)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tech Stack</Label>
            <TagInput
              value={form.tech_stack}
              onChange={(v) => set('tech_stack', v)}
              placeholder="Add a technology and press Enter"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={form.contact_name}
                onChange={(e) => set('contact_name', e.target.value)}
                placeholder="Recruiter or hiring manager"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="follow_up_date">Follow-Up Date</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={form.follow_up_date}
              onChange={(e) => set('follow_up_date', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Notes about the role, conversation, etc."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {application && onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(application.id)}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.company.trim() || !form.title.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}