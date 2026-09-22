export const PROJECT_CATEGORIES = [
  'Home Lab',
  'Certification Project',
  'Course Project',
  'Portfolio Piece',
  'Work Project',
  'Other',
];

export const PROJECT_STATUSES = ['Planned', 'In Progress', 'Completed'];

export const STATUS_STYLES = {
  Planned: {
    dot: 'bg-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
  },
  'In Progress': {
    dot: 'bg-warning',
    badge: 'bg-warning/15 text-warning',
  },
  Completed: {
    dot: 'bg-success',
    badge: 'bg-success/15 text-success',
  },
};