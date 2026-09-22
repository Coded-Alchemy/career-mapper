import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TagInput from './TagInput';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/lib/projectConstants';

const EMPTY = {
  title: '',
  description: '',
  category: '',
  status: 'Planned',
  tech_stack: [],
  skills_demonstrated: [],
  github_url: '',
  live_url: '',
  start_date: '',
  completed_date: '',
  notes: '',
};

export default function ProjectModal({ open, project, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(project ? { ...EMPTY, ...project } : EMPTY);
  }, [open, project]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleStatusChange = (v) => {
    const next = { ...form, status: v };
    if (v === 'Completed' && !next.completed_date) {
      next.completed_date = format(new Date(), 'yyyy-MM-dd');
    }
    setForm(next);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = { ...form };
    if (data.status === 'Completed' && !data.completed_date) {
      data.completed_date = format(new Date(), 'yyyy-MM-dd');
    }
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add Project'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Project title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What is this project?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
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

          <div className="space-y-1.5">
            <Label>Tech Stack</Label>
            <TagInput
              value={form.tech_stack}
              onChange={(v) => set('tech_stack', v)}
              placeholder="Add a technology and press Enter"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Skills Demonstrated</Label>
            <TagInput
              value={form.skills_demonstrated}
              onChange={(v) => set('skills_demonstrated', v)}
              placeholder="Add a skill and press Enter"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={form.github_url}
                onChange={(e) => set('github_url', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="live_url">Live URL</Label>
              <Input
                id="live_url"
                value={form.live_url}
                onChange={(e) => set('live_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="completed_date">Completed Date</Label>
              <Input
                id="completed_date"
                type="date"
                value={form.completed_date}
                onChange={(e) => set('completed_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Notes, checklists, build steps..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {project && (
            <Button
              variant="destructive"
              onClick={() => onDelete(project.id)}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}