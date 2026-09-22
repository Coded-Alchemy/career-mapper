import { Briefcase } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function JobTracker() {
  return (
    <PagePlaceholder
      title="Job Tracker"
      description="Manage applications across every stage — from saved leads to offers — so nothing slips through the cracks."
      icon={Briefcase}
    />
  );
}