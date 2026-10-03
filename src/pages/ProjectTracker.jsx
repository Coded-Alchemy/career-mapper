import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/blueprint/PageShell';
import ProjectStats from '@/components/projects/ProjectStats';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ProjectBoard from '@/components/projects/ProjectBoard';
import ProjectModal from '@/components/projects/ProjectModal';
import ProjectPlanner from '@/components/projects/ProjectPlanner';

export default function ProjectTracker() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', tech: 'all' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [plannerOpen, setPlannerOpen] = useState(false);

  useEffect(() => {
    base44.entities.Project.list('-created_date', 500).then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const technologies = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => p.tech_stack?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.tech !== 'all' && !(p.tech_stack || []).includes(filters.tech)) return false;
      return true;
    });
  }, [projects, filters]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editing) {
      const updated = await base44.entities.Project.update(editing.id, data);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await base44.entities.Project.create(data);
      setProjects((prev) => [created, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Project.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setModalOpen(false);
  };

  const handleStatusChange = async (project, status) => {
    const data = { status };
    if (status === 'Completed' && !project.completed_date) {
      data.completed_date = format(new Date(), 'yyyy-MM-dd');
    }
    const updated = await base44.entities.Project.update(project.id, data);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePlannerAdd = async (data) => {
    const created = await base44.entities.Project.create(data);
    setProjects((prev) => [created, ...prev]);
  };

  return (
    <PageShell
      title="Project Tracker"
      actions={
        <>
          <button type="button" className="bp-btn" onClick={() => setPlannerOpen(true)}>
            <Sparkles className="h-3.5 w-3.5" />
            Project Planner
          </button>
          <button type="button" className="bp-btn bp-btn-primary" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" />
            Add Project
          </button>
        </>
      }
    >

      <div className="mb-6">
        <ProjectStats projects={projects} />
      </div>

      <div className="mb-6">
        <ProjectFilters
          filters={filters}
          setFilters={setFilters}
          technologies={technologies}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="bp-spinner animate-spin" />
        </div>
      ) : filtered.length === 0 && projects.length === 0 ? (
        <div className="bp-empty">
          <strong>No projects yet</strong>
          <p>Add one or let the AI plan one for you.</p>
        </div>
      ) : (
        <ProjectBoard
          projects={filtered}
          onStatusChange={handleStatusChange}
          onCardClick={openEdit}
        />
      )}

      <ProjectModal
        open={modalOpen}
        project={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ProjectPlanner
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        onAdd={handlePlannerAdd}
      />
    </PageShell>
  );
}