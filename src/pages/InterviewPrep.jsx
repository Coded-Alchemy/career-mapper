import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PrepForm from '@/components/interview/PrepForm';
import PrepResult from '@/components/interview/PrepResult';
import PrepHistory from '@/components/interview/PrepHistory';

const PROGRESS_MSGS = [
  'Reading the job description…',
  'Drafting likely questions…',
  'Preparing behavioral prompts…',
  'Mapping technical topics…',
  'Building your prep plan…',
];

export default function InterviewPrep() {
  const [searchParams] = useSearchParams();
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(PROGRESS_MSGS[0]);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const msgIdx = useRef(0);

  useEffect(() => {
    base44.entities.JobApplication.list('-created_date', 500).then((data) => {
      setApplications(data);
    });
    base44.entities.InterviewPrep.list('-date_created', 50).then((data) => {
      setHistory(data);
      setHistoryLoading(false);
    });
    const preselectId = searchParams.get('app');
    if (preselectId) {
      base44.entities.JobApplication.get(preselectId).then((a) => {
        if (a) {
          setApplicationId(a.id);
          setCompany(a.company || '');
          setRoleTitle(a.title || '');
        }
      }).catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading) return;
    msgIdx.current = 0;
    setLoadingMsg(PROGRESS_MSGS[0]);
    const t = setInterval(() => {
      msgIdx.current = (msgIdx.current + 1) % PROGRESS_MSGS.length;
      setLoadingMsg(PROGRESS_MSGS[msgIdx.current]);
    }, 2500);
    return () => clearInterval(t);
  }, [loading]);

  const selectApplication = (id) => {
    setApplicationId(id);
    if (!id) return;
    const a = applications.find((x) => x.id === id);
    if (a) {
      setCompany(a.company || '');
      setRoleTitle(a.title || '');
    }
  };

  const generate = async () => {
    setError('');
    if (!company.trim() || !roleTitle.trim() || !jobDescription.trim()) {
      setError('Company, role title, and job description are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generatePrep', {
        job_description: jobDescription.trim(),
        company: company.trim(),
        role_title: roleTitle.trim(),
      });
      if (res.data?.error) {
        setError(res.data.error);
        return;
      }
      const r = res.data.prep;
      const record = await base44.entities.InterviewPrep.create({
        company: company.trim(),
        role_title: roleTitle.trim(),
        job_description: jobDescription.trim(),
        application_id: applicationId || undefined,
        role_summary: r.role_summary,
        likely_questions: r.likely_questions || [],
        behavioral_questions: r.behavioral_questions || [],
        technical_questions: r.technical_questions || [],
        prep_plan: r.prep_plan || [],
        questions_to_ask: r.questions_to_ask || [],
        checked_prep: [],
        date_created: new Date().toISOString(),
      });
      setCurrent(record);
      setHistory((prev) => [record, ...prev]);
    } catch (e) {
      setError(e.message || 'Something went wrong generating the prep plan.');
    } finally {
      setLoading(false);
    }
  };

  const deletePrep = async (rec) => {
    await base44.entities.InterviewPrep.delete(rec.id);
    setHistory((prev) => prev.filter((x) => x.id !== rec.id));
    if (current?.id === rec.id) setCurrent(null);
  };

  const togglePrep = async (item) => {
    if (!current) return;
    const checked = current.checked_prep || [];
    const next = checked.includes(item) ? checked.filter((x) => x !== item) : [...checked, item];
    const updated = await base44.entities.InterviewPrep.update(current.id, { checked_prep: next });
    setCurrent(updated);
    setHistory((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Interview Prep</h1>
      <div className="space-y-6">
        <PrepForm
          company={company}
          setCompany={setCompany}
          roleTitle={roleTitle}
          setRoleTitle={setRoleTitle}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          applicationId={applicationId}
          onSelectApplication={selectApplication}
          applications={applications}
          onGenerate={generate}
          loading={loading}
          loadingMsg={loadingMsg}
          error={error}
        />
        {current && <PrepResult prep={current} onTogglePrep={togglePrep} />}
        <PrepHistory
          history={history}
          loading={historyLoading}
          currentId={current?.id}
          onOpen={setCurrent}
          onDelete={deletePrep}
          applications={applications}
        />
      </div>
    </div>
  );
}