import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageShell from '@/components/blueprint/PageShell';
import SectionTitle from '@/components/blueprint/SectionTitle';
import GoalsColumn from '@/components/goals/GoalsColumn';
import HabitsColumn from '@/components/habits/HabitsColumn';
import RoadmapTab from '@/components/roadmap/RoadmapTab';

export default function GoalsHabits() {
  return (
    <PageShell title="Goals & Habits">
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="bp-tablist mb-6">
          <TabsTrigger value="goals" className="bp-tab">Goals & Habits</TabsTrigger>
          <TabsTrigger value="roadmap" className="bp-tab">Roadmap</TabsTrigger>
        </TabsList>
        <TabsContent value="goals">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <SectionTitle>Goals</SectionTitle>
              <GoalsColumn />
            </section>
            <section className="space-y-3">
              <SectionTitle>Habits</SectionTitle>
              <HabitsColumn />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="roadmap">
          <RoadmapTab />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}