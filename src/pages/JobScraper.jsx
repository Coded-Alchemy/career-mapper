import { Search } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function JobScraper() {
  return (
    <PagePlaceholder
      title="AI Job Scraper"
      description="Let AI find and surface relevant openings that match your target roles, skills, and preferences."
      icon={Search}
    />
  );
}