import { Home } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function HomePage() {
  return (
    <PagePlaceholder
      title="Home"
      description="Your tech career command center — a unified overview of projects, applications, goals, and prep, all in one place."
      icon={Home}
    />
  );
}