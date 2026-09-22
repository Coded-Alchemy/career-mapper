import { FileText } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function ResumeReviewer() {
  return (
    <PagePlaceholder
      title="Resume & LinkedIn Reviewer"
      description="Get AI-powered feedback on your resume and LinkedIn profile, tuned to the roles you're targeting."
      icon={FileText}
    />
  );
}