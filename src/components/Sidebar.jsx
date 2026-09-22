import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  Briefcase,
  Target,
  FileText,
  MessageSquare,
  Search,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Project Tracker', to: '/projects', icon: FolderKanban },
  { label: 'Job Tracker', to: '/jobs', icon: Briefcase },
  { label: 'Goals & Habits', to: '/goals', icon: Target },
  { label: 'Resume & LinkedIn Reviewer', to: '/resume', icon: FileText },
  { label: 'Interview Prep', to: '/interview', icon: MessageSquare },
  { label: 'AI Job Scraper', to: '/scraper', icon: Search },
];

export function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-sidebar-background">
      <div className="px-4 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
      <SidebarContent />
    </aside>
  );
}