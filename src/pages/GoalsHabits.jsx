import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import GoalsColumn from '@/components/goals/GoalsColumn';
import HabitsColumn from '@/components/habits/HabitsColumn';
import RoadmapTab from '@/components/roadmap/RoadmapTab';

export default function GoalsHabits() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Goals & Habits
      </h1>
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="goals">Goals & Habits</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>
        <TabsContent value="goals">
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
        </TabsContent>
        <TabsContent value="roadmap">
          <RoadmapTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}