import { MessageSquare } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function InterviewPrep() {
  return (
    <PagePlaceholder
      title="Interview Prep"
      description="Practice with tailored questions, mock sessions, and review notes so you walk into every interview ready."
      icon={MessageSquare}
    />
  );
}