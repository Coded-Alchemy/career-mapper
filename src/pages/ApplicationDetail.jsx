import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { ArrowLeft, Pencil, Save, X, ExternalLink, Trash2, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import PageShell from '@/components/blueprint/PageShell';
import SectionTitle from '@/components/blueprint/SectionTitle';
import TagInput from '@/components/projects/TagInput';
import StatusTimeline from '@/components/jobs/StatusTimeline';
import InteractionLog from '@/components/jobs/InteractionLog';
import { JOB_STATUSES, JOB_STATUS_STYLES } from '@/lib/jobConstants';

function normalizeUrl(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function fmtDate(d) {
  if (!d) return '—';
  const date = parseISO(d);
  return isValid(date) ? format(date, 'MMM d, yyyy') : '—';
}

function DetailField({ label, className = '', children }) {
  return (
    <div className={className}>
      <div className="bp-label">{label}</div>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    setLoading(true);
    base44.entities.JobApplication.get(id).then((data) => {
      setApp(data);
      setLoading(false);
    });
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = () => {
    setForm({ ...app, tech_stack: app.tech_stack || [] });
    setEditing(true);
  };

  const save = async () => {
    if (!form.company.trim() || !form.title.trim()) return;
    const updated = await base44.entities.JobApplication.update(id, form);
    setApp(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    await base44.entities.JobApplication.delete(id);
    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="bp-spinner animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <PageShell title="Application not found">
        <p className="bp-subtitle">This application may have been deleted.</p>
        <Link to="/jobs" className="bp-btn mt-4">
          Back to Job Tracker
        </Link>
      </PageShell>
    );
  }

  const url = normalizeUrl(app.job_url);

  return (
    <PageShell
      title={app.company}
      subtitle={app.title}
      actions={
        editing ? (
          <>
            <button type="button" className="bp-btn" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="button"
              className="bp-btn bp-btn-primary"
              onClick={save}
              disabled={!form.company.trim() || !form.title.trim()}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </button>
          </>
        ) : (
          <>
            {['Phone Screen', 'Interview', 'Final Round'].includes(app.status) && (
              <button
                type="button"
                className="bp-btn"
                onClick={() => navigate(`/interview?app=${app.id}`)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Prep for Interview
              </button>
            )}
            <button type="button" className="bp-btn" onClick={startEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button type="button" className="bp-btn bp-btn-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the application and its interactions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )
      }
    >
      <div className="mb-6">
        <Link to="/jobs" className="bp-link">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Job Tracker
        </Link>
      </div>

      <div className="bp-panel mb-6 p-3">
        <StatusTimeline status={app.status} />
      </div>

      {editing ? (
        <div className="bp-panel mb-6 space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => set('company', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date Applied</Label>
              <Input type="date" value={form.date_applied || ''} onChange={(e) => set('date_applied', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Job URL</Label>
              <Input value={form.job_url || ''} onChange={(e) => set('job_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Salary Range</Label>
              <Input value={form.salary_range || ''} onChange={(e) => set('salary_range', e.target.value)} placeholder="e.g. $90k–$120k" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location || ''} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Follow-Up Date</Label>
              <Input type="date" value={form.follow_up_date || ''} onChange={(e) => set('follow_up_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Name</Label>
              <Input value={form.contact_name || ''} onChange={(e) => set('contact_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label className="text-sm font-medium">Remote</Label>
            <Switch checked={!!form.remote} onCheckedChange={(v) => set('remote', v)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tech Stack</Label>
            <TagInput value={form.tech_stack} onChange={(v) => set('tech_stack', v)} placeholder="Add a technology and press Enter" />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={4} />
          </div>
        </div>
      ) : (
        <div className="bp-panel mb-6 grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
          <DetailField label="Company">{app.company}</DetailField>
          <DetailField label="Title">{app.title}</DetailField>
          <DetailField label="Status">
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${JOB_STATUS_STYLES[app.status] || ''}`}>
              {app.status}
            </span>
          </DetailField>
          <DetailField label="Date Applied">{fmtDate(app.date_applied)}</DetailField>
          <DetailField label="Salary Range">{app.salary_range || '—'}</DetailField>
          <DetailField label="Location">{app.location || '—'}</DetailField>
          <DetailField label="Remote">
            {app.remote ? (
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">Remote</span>
            ) : (
              <span className="text-xs text-muted-foreground">On-site</span>
            )}
          </DetailField>
          <DetailField label="Follow-Up Date">{fmtDate(app.follow_up_date)}</DetailField>
          <DetailField label="Contact Name">{app.contact_name || '—'}</DetailField>
          <DetailField label="Contact Email">{app.contact_email || '—'}</DetailField>
          <DetailField label="Tech Stack" className="sm:col-span-2">
            {app.tech_stack?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {app.tech_stack.map((t) => (
                  <span key={t} className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">{t}</span>
                ))}
              </div>
            ) : '—'}
          </DetailField>
          <DetailField label="Job URL" className="sm:col-span-2">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-btn"
              >
                Open Job Posting
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : '—'}
          </DetailField>
          <DetailField label="Notes" className="sm:col-span-2">
            {app.notes ? <p className="whitespace-pre-wrap">{app.notes}</p> : '—'}
          </DetailField>
        </div>
      )}

      <section>
        <SectionTitle>Interactions</SectionTitle>
        <InteractionLog applicationId={app.id} />
      </section>
    </PageShell>
  );
}