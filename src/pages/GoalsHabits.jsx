import { Target } from 'lucide-react';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function GoalsHabits() {
  return (
    <PagePlaceholder
      title="Goals & Habits"
      description="Set career goals and build the daily habits that move you toward them, with streaks and progress tracking."
      icon={Target}
    />
  );
}