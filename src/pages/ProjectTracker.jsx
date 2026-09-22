import { FolderKanban } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function ProjectTracker() {
  return (
    <PagePlaceholder
      title="Project Tracker"
      description="Organize portfolio projects, track milestones, and showcase the work that powers your career narrative."
      icon={FolderKanban}
    />
  );
}