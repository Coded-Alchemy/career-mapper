import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { JOB_STATUS_STYLES } from '@/lib/jobConstants';
import SectionTitle from '@/components/blueprint/SectionTitle';

function normalizeUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function RecentApplications({ applications, onOpen }) {
  const recent = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10);
  }, [applications]);

  return (
    <div className="bp-card">
      <div className="bp-cardhead">
        <SectionTitle>Recent Applications</SectionTitle>
        <span className="bp-count ml-auto">{recent.length}</span>
      </div>

      {recent.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((app) => {
            const url = normalizeUrl(app.job_url);
            return (
              <li
                key={app.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5"
              >
                <button
                  onClick={() => onOpen(app)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {app.company}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${JOB_STATUS_STYLES[app.status] || ''}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {app.title}
                  </div>
                </button>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bp-link shrink-0"
                  >
                    Apply Now
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground">No link</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}