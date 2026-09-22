import { format, parseISO, isValid } from 'date-fns';
import { Briefcase, Sparkles, FilePen, Linkedin } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

function fmtDate(d) {
  if (!d) return '—';
  const dt = parseISO(d);
  return isValid(dt) ? format(dt, 'MMM d, yyyy') : '—';
}

function ListCard({ icon: Icon, title, items, accent }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent || 'text-primary'}`} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumeReviewResult({ review }) {
  const score = review.overall_score || 0;
  const band = score >= 75 ? 'emerald' : score >= 50 ? 'amber' : 'red';
  const bandText =
    band === 'emerald' ? 'Strong fit' : band === 'amber' ? 'Partial fit' : 'Weak fit';
  const bandColor =
    band === 'emerald' ? 'text-success' : band === 'amber' ? 'text-warning' : 'text-destructive';

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-6">
        <ScoreGauge score={score} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h3 className="text-xl font-semibold text-foreground">{review.target_role}</h3>
            <span className={`text-sm font-medium ${bandColor}`}>{bandText}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Reviewed {fmtDate(review.created_date)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ListCard icon={Briefcase} title="Best-Fit Roles Right Now" items={review.best_jobs} />
        <ListCard icon={Sparkles} title="Transferable Skills" items={review.transferable_skills} />
        <ListCard icon={FilePen} title="Resume Suggestions" items={review.resume_suggestions} accent="text-warning" />
        <ListCard icon={Linkedin} title="LinkedIn Suggestions" items={review.linkedin_suggestions} accent="text-primary" />
      </div>
    </div>
  );
}