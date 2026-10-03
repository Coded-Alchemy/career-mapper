import { cn } from '@/lib/utils';

export default function SectionTitle({ className, children }) {
  return <h2 className={cn('bp-sectiontitle', className)}>{children}</h2>;
}