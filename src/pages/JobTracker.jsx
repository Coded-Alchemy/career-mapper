import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { Plus, LayoutDashboard, Columns3, Table2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Job Tracker
        </h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </header>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <Columns3 className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table2 className="h-4 w-4" />
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
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
    </div>
  );
}