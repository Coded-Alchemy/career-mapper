import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Briefcase, CalendarCheck, FolderKanban, CheckCircle2, Target, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { computeHabitStreak } from '@/lib/habitStreak';
import StatCard from '@/components/home/StatCard';
import QuickLinks from '@/components/home/QuickLinks';
import FollowUpCard from '@/components/home/FollowUpCard';
import PageShell from '@/components/blueprint/PageShell';
import SectionTitle from '@/components/blueprint/SectionTitle';

const INTERVIEW_STATUSES = ['Phone Screen', 'Interview', 'Final Round'];
const CLOSED_STATUSES = ['Rejected', 'Ghosted'];

export default function Home() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [apps, projects, goals, habits, habitLogs] = await Promise.all([
        base44.entities.JobApplication.list('-created_date', 500),
        base44.entities.Project.list('-created_date', 500),
        base44.entities.Goal.list('-created_date', 500),
        base44.entities.Habit.list('-created_date', 500),
        base44.entities.HabitLog.list('-created_date', 2000),
      ]);
      if (!active) return;
      setData({ apps, projects, goals, habits, habitLogs });
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'there';
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  const stats = useMemo(() => {
    if (!data) return {};
    const { apps, projects, goals, habits, habitLogs } = data;

    const activeApplications = apps.filter(
      (a) => !CLOSED_STATUSES.includes(a.status)
    ).length;
    const interviews = apps.filter((a) =>
      INTERVIEW_STATUSES.includes(a.status)
    ).length;
    const projectsInProgress = projects.filter(
      (p) => p.status === 'In Progress'
    ).length;
    const projectsCompleted = projects.filter(
      (p) => p.status === 'Completed'
    ).length;
    const activeGoals = goals.filter((g) => g.status === 'active').length;

    const logsByHabit = {};
    habitLogs.forEach((l) => {
      (logsByHabit[l.habit_id] = logsByHabit[l.habit_id] || []).push(l.date);
    });
    const bestStreak = habits.reduce((max, h) => {
      const dates = logsByHabit[h.id] || [];
      return Math.max(max, computeHabitStreak(dates, h.frequency));
    }, 0);

    return {
      activeApplications,
      interviews,
      projectsInProgress,
      projectsCompleted,
      activeGoals,
      bestStreak,
    };
  }, [data]);

  const followUps = useMemo(() => {
    if (!data) return [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return data.apps
      .filter(
        (a) =>
          a.follow_up_date &&
          a.follow_up_date <= todayStr &&
          !CLOSED_STATUSES.includes(a.status) &&
          a.status !== 'Offer'
      )
      .sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date));
  }, [data]);

  return (
    <PageShell
      title={`Welcome back, ${displayName}`}
      eyebrow="Career overview"
      subtitle={today}
    >

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          icon={Briefcase}
          label="Active Applications"
          value={stats.activeApplications ?? 0}
          to="/jobs"
          loading={loading}
        />
        <StatCard
          icon={CalendarCheck}
          label="Interviews Scheduled"
          value={stats.interviews ?? 0}
          to="/jobs"
          tone="warning"
          loading={loading}
        />
        <StatCard
          icon={FolderKanban}
          label="Projects In Progress"
          value={stats.projectsInProgress ?? 0}
          to="/projects"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Projects Completed"
          value={stats.projectsCompleted ?? 0}
          to="/projects"
          tone="success"
          loading={loading}
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={stats.activeGoals ?? 0}
          to="/goals"
          loading={loading}
        />
        <StatCard
          icon={Flame}
          label="Best Habit Streak"
          value={stats.bestStreak ?? 0}
          to="/goals"
          tone="success"
          loading={loading}
        />
      </section>

      {/* Follow-up + quick links */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FollowUpCard items={followUps} loading={loading} />
        <div>
          <SectionTitle className="mb-3">Quick Links</SectionTitle>
          <QuickLinks />
        </div>
      </section>
    </PageShell>
  );
}