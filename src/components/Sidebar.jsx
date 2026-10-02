import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  Briefcase,
  Target,
  FileText,
  MessageSquare,
  Search,
  LogOut,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

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
  const { user, logout } = useAuth();
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Account';

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

      <div className="space-y-2 border-t border-sidebar-border px-3 py-3">
        <ThemeToggle />

        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
            {displayName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{displayName}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            aria-label="Log out"
            title="Log out"
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
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