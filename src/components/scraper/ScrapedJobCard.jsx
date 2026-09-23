import { MapPin, ExternalLink, Calendar, Bookmark, Ban } from 'lucide-react';
import { parseISO, isValid, differenceInCalendarDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildSourceSearchUrl } from '@/lib/sourceSearchUrls';

function relDays(d) {
  if (!d) return null;
  const dt = parseISO(d);
  if (!isValid(dt)) return null;
  const diff = differenceInCalendarDays(new Date(), dt);
  if (diff <= 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 14) return `${diff} days ago`;
  return format(dt, 'MMM d');
}

function normalizeUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function ScrapedJobCard({ job, onSaveToTracker, onNotInterested }) {
  const directUrl = job.job_url && /^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(job.job_url) ? job.job_url : null;
  const viewUrl = directUrl || buildSourceSearchUrl(job);
  const score = job.relevance_score;
  const posted = relDays(job.date_posted);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{job.title}</h3>
          <div className="truncate text-sm text-muted-foreground">{job.company}</div>
        </div>
        {score != null && (
          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Relevance</div>
            <div
              className={cn(
                'text-lg font-bold',
                score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-muted-foreground'
              )}
            >
              {score}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {job.source && (
          <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
            {job.source}
          </span>
        )}
        {job.clearance_required && job.clearance_required !== 'None' && (
          <span className="rounded bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
            {job.clearance_required}
          </span>
        )}
        {job.experience_level && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {job.experience_level}
          </span>
        )}
      </div>

      {job.description_summary && (
        <p className="mt-3 text-sm text-muted-foreground">{job.description_summary}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {job.salary && job.salary !== 'Not listed' && <span>{job.salary}</span>}
        {posted && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {posted}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onSaveToTracker(job)} disabled={job.saved}>
          <Bookmark className="h-3.5 w-3.5" />
          {job.saved ? 'Saved' : 'Save to Tracker'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onNotInterested(job)}>
          <Ban className="h-3.5 w-3.5" />
          Not Interested
        </Button>
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View Posting <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}