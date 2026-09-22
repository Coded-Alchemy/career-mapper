import GoalsColumn from '@/components/goals/GoalsColumn';
import HabitsColumn from '@/components/habits/HabitsColumn';

export default function GoalsHabits() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Goals & Habits
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Goals</h2>
          <GoalsColumn />
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Habits</h2>
          <HabitsColumn />
        </section>
      </div>
    </div>
  );
}