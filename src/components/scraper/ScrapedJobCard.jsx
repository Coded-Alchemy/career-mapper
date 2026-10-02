import { MapPin, ExternalLink, Calendar, Bookmark, Ban } from 'lucide-react';
import { parseISO, isValid, differenceInCalendarDays, format } from 'date-fns';
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

export default function ScrapedJobCard({ job, onSaveToTracker, onNotInterested }) {
  const directUrl = job.job_url && /^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(job.job_url) ? job.job_url : null;
  const viewUrl = directUrl || buildSourceSearchUrl(job);
  const score = job.relevance_score;
  const posted = relDays(job.date_posted);

  return (
    <article className="jb-job">
      <div className="jb-jobtop">
        <div className="min-w-0">
          <h3 className="jb-jobtitle truncate">{job.title}</h3>
          <div className="jb-company truncate">{job.company}</div>
        </div>
        {score != null && (
          <div className="jb-score">
            <span className="jb-label">Relevance</span>
            <strong>{score}</strong>
          </div>
        )}
      </div>

      <div className="jb-chips">
        {job.source && <span className="jb-chip">{job.source}</span>}
        {job.clearance_required && job.clearance_required !== 'None' && (
          <span className="jb-chip">{job.clearance_required}</span>
        )}
        {job.experience_level && <span className="jb-chip">{job.experience_level}</span>}
      </div>

      {job.description_summary && <p className="jb-description">{job.description_summary}</p>}

      <div className="jb-meta">
        {job.location && (
          <span>
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {job.salary && job.salary !== 'Not listed' && <span>{job.salary}</span>}
        {posted && (
          <span>
            <Calendar className="h-3 w-3" />
            {posted}
          </span>
        )}
      </div>

      <div className="jb-jobactions">
        <button
          type="button"
          className="jb-btn"
          onClick={() => onSaveToTracker(job)}
          disabled={job.saved}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {job.saved ? 'Saved' : 'Save to Tracker'}
        </button>
        <button type="button" className="jb-btn" onClick={() => onNotInterested(job)}>
          <Ban className="h-3.5 w-3.5" />
          Not Interested
        </button>
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="jb-link"
        >
          View Posting <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}