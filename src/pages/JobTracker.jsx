import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { Plus, LayoutDashboard, Columns3, Table2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/blueprint/PageShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import JobStats from '@/components/jobs/JobStats';
import FollowUpList from '@/components/jobs/FollowUpList';
import RecentApplications from '@/components/jobs/RecentApplications';
import ApplicationForm from '@/components/jobs/ApplicationForm';
import JobKanban from '@/components/jobs/JobKanban';
import JobTable from '@/components/jobs/JobTable';

export default function JobTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.JobApplication.list('-created_date', 500).then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, []);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (app) => {
    navigate(`/applications/${app.id}`);
  };

  const handleSave = async (data) => {
    if (editing) {
      const updated = await base44.entities.JobApplication.update(editing.id, data);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await base44.entities.JobApplication.create(data);
      setApplications((prev) => [created, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.JobApplication.delete(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setFormOpen(false);
  };

  const handleSnooze = async (app) => {
    const newDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const updated = await base44.entities.JobApplication.update(app.id, {
      follow_up_date: newDate,
    });
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleStatusChange = async (app, status) => {
    const updated = await base44.entities.JobApplication.update(app.id, { status });
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  return (
    <PageShell
      title="Job Tracker"
      actions={
        <button type="button" className="bp-btn bp-btn-primary" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" />
          Add Application
        </button>
      }
    >

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bp-tablist mb-6">
          <TabsTrigger value="dashboard" className="bp-tab">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="kanban" className="bp-tab">
            <Columns3 className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="table" className="bp-tab">
            <Table2 className="h-4 w-4" />
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="bp-spinner animate-spin" />
            </div>
          ) : (
            <>
              <JobStats applications={applications} />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FollowUpList
                  applications={applications}
                  onSnooze={handleSnooze}
                  onOpen={openEdit}
                />
                <RecentApplications
                  applications={applications}
                  onOpen={openEdit}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="kanban">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="bp-spinner animate-spin" />
            </div>
          ) : (
            <JobKanban
              applications={applications}
              onStatusChange={handleStatusChange}
              onCardClick={openEdit}
            />
          )}
        </TabsContent>

        <TabsContent value="table">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="bp-spinner animate-spin" />
            </div>
          ) : (
            <JobTable applications={applications} onCardClick={openEdit} />
          )}
        </TabsContent>
      </Tabs>

      <ApplicationForm
        open={formOpen}
        application={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </PageShell>
  );
}