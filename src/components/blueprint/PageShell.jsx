import { cn } from '@/lib/utils';

export default function PageShell({ title, eyebrow, subtitle, actions, className, children }) {
  return (
    <div className="bp-page">
      <div className="bp-shell">
        <header className="bp-top">
          <div className="min-w-0">
            {eyebrow && <div className="bp-eyebrow mb-2">{eyebrow}</div>}
            <h1 className="bp-title">{title}</h1>
            {subtitle && <p className="bp-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="bp-actions">{actions}</div>}
        </header>
        <div className={cn(className)}>{children}</div>
      </div>
    </div>
  );
}