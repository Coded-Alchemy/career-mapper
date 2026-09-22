import { Link } from 'react-router-dom';
import { FolderKanban, Briefcase, Target, FileText, Search } from 'lucide-react';

const LINKS = [
  {
    label: 'Project Tracker',
    to: '/projects',
    icon: FolderKanban,
    description: 'Track portfolio projects and milestones',
  },
  {
    label: 'Job Tracker',
    to: '/jobs',
    icon: Briefcase,
    description: 'Manage applications across every stage',
  },
  {
    label: 'Goals & Habits',
    to: '/goals',
    icon: Target,
    description: 'Set goals and build daily habits',
  },
  {
    label: 'Resume Reviewer',
    to: '/resume',
    icon: FileText,
    description: 'Get AI feedback on your resume & LinkedIn',
  },
  {
    label: 'AI Job Scraper',
    to: '/scraper',
    icon: Search,
    description: 'Let AI surface relevant openings',
  },
];

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {LINKS.map(({ label, to, icon: Icon, description }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}