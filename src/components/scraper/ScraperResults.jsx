import { useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import ScrapedJobCard from './ScrapedJobCard';
import ApplicationForm from '@/components/jobs/ApplicationForm';

const PROGRESS = [
  'Searching job sources…',
  'Matching your criteria…',
  'Checking posting freshness…',
  'Ranking by relevance…',
  'Saving results…',
];

const SOURCES = [
  'ClearanceJobs', 'LinkedIn Jobs', 'Indeed', 'USAJobs', 'Dice',
  'ZipRecruiter', 'Glassdoor', 'Wellfound', 'Google Jobs',
];

function salaryValue(s) {
  if (!s) return 0;
  let max = 0;
  const re = /(\d[\d,]*)(\.\d+)?\s*(k|K)?/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    let n = parseFloat(m[1].replace(/,/g, '') + (m[2] || ''));
    if (m[3]) n *= 1000;
    if (n > max) max = n;
  }
  return max;
}

function isFresh(dateStr) {
  if (!dateStr) return false;
  const d = parseISO(dateStr);
  if (!isValid(d)) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  return d >= cutoff;
}

export default function ScraperResults() {
  const [jobs, setJobs] = useState([]);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState(PROGRESS[0]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sort, setSort] = useState('date');
  const [savedOnly, setSavedOnly] = useState(false);
  const [hideNotInterested, setHideNotInterested] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [savingJob, setSavingJob] = useState(null);
  const msgIdx = useRef(0);

  useEffect(() => {
    base44.entities.ScrapedJob.list('-created_date', 200).then((all) => {
      if (!all.length) return;
      const latestBatch = all[0].batch_id;
      if (!latestBatch) return;
      const batchJobs = all.filter((j) => j.batch_id === latestBatch);
      setJobs(batchJobs);
      setBatch({ batch_id: latestBatch, created_at: all[0].created_date, count: batchJobs.length });
    });
  }, []);

  useEffect(() => {
    if (!loading) return;
    msgIdx.current = 0;
    setProgressMsg(PROGRESS[0]);
    const t = setInterval(() => {
      msgIdx.current = (msgIdx.current + 1) % PROGRESS.length;
      setProgressMsg(PROGRESS[msgIdx.current]);
    }, 3000);
    return () => clearInterval(t);
  }, [loading]);

  const runSearch = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('runJobSearch', {});
      const data = res.data;
      if (data?.error) {
        setError(data.error);
        return;
      }
      setJobs(data.jobs || []);
      setBatch({ batch_id: data.batch_id, created_at: data.created_at, count: (data.jobs || []).length });
      if (data.message) setInfo(data.message);
    } catch (e) {
      setError(e.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const visibleJobs = useMemo(() => {
    let list = jobs.filter((j) => isFresh(j.date_posted));
    if (hideNotInterested) list = list.filter((j) => !j.not_interested);
    if (savedOnly) list = list.filter((j) => j.saved);
    if (sourceFilter !== 'all') list = list.filter((j) => j.source === sourceFilter);
    return [...list].sort((a, b) => {
      if (sort === 'relevance') return (b.relevance_score || 0) - (a.relevance_score || 0);
      if (sort === 'salary') return salaryValue(b.salary) - salaryValue(a.salary);
      const da = a.date_posted ? parseISO(a.date_posted).getTime() : 0;
      const db = b.date_posted ? parseISO(b.date_posted).getTime() : 0;
      return db - da;
    });
  }, [jobs, hideNotInterested, savedOnly, sourceFilter, sort]);

  const updateJob = (id, patch) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  };

  const saveToTracker = (job) => {
    setSavingJob(job);
    setFormOpen(true);
  };

  const onFormSave = async (form) => {
    await base44.entities.JobApplication.create(form);
    if (savingJob) {
      await base44.entities.ScrapedJob.update(savingJob.id, { saved: true });
      updateJob(savingJob.id, { saved: true });
    }
    setFormOpen(false);
    setSavingJob(null);
  };

  const notInterested = async (job) => {
    await base44.entities.ScrapedJob.update(job.id, { not_interested: true });
    updateJob(job.id, { not_interested: true });
  };

  const availableSources = useMemo(() => {
    const set = new Set(jobs.map((j) => j.source).filter(Boolean));
    return SOURCES.filter((s) => set.has(s));
  }, [jobs]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={runSearch} disabled={loading} className="sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Run Search
            </>
          )}
        </Button>
        {batch && (
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{batch.count}</span> results
            {batch.created_at && (
              <span> · {format(parseISO(batch.created_at), 'MMM d, yyyy h:mm a')}</span>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{progressMsg}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          {info}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest first</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="salary">Salary (high to low)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {availableSources.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={savedOnly} onCheckedChange={setSavedOnly} id="saved-only" />
              <Label htmlFor="saved-only" className="cursor-pointer text-sm">Saved only</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={hideNotInterested} onCheckedChange={setHideNotInterested} id="hide-ni" />
              <Label htmlFor="hide-ni" className="cursor-pointer text-sm">Hide not interested</Label>
            </div>
          </div>

          <div className="space-y-3">
            {visibleJobs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                No results match your filters.
              </p>
            ) : (
              visibleJobs.map((job) => (
                <ScrapedJobCard
                  key={job.id}
                  job={job}
                  onSaveToTracker={saveToTracker}
                  onNotInterested={notInterested}
                />
              ))
            )}
          </div>
        </>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">No results yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Press <span className="font-medium text-foreground">Run Search</span> to find fresh job postings matching your criteria.
          </p>
        </div>
      )}

      <ApplicationForm
        open={formOpen}
        application={savingJob ? {
          company: savingJob.company,
          title: savingJob.title,
          job_url: savingJob.job_url || '',
          salary_range: savingJob.salary && savingJob.salary !== 'Not listed' ? savingJob.salary : '',
          location: savingJob.location || '',
          status: 'To Apply',
          remote: /remote/i.test(savingJob.location || ''),
          tech_stack: [],
          contact_name: '',
          contact_email: '',
          notes: savingJob.description_summary || '',
          follow_up_date: '',
          date_applied: '',
        } : null}
        onClose={() => { setFormOpen(false); setSavingJob(null); }}
        onSave={onFormSave}
      />
    </div>
  );
}