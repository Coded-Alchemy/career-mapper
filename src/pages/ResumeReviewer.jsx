import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ResumeReviewForm from '@/components/resume/ResumeReviewForm';
import ResumeReviewResult from '@/components/resume/ResumeReviewResult';
import ResumeReviewHistory from '@/components/resume/ResumeReviewHistory';

const PROGRESS_MSGS = [
  'Scanning for ATS keywords…',
  'Evaluating transferable skills…',
  'Scoring resume fit…',
  'Drafting LinkedIn suggestions…',
];

export default function ResumeReviewer() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(PROGRESS_MSGS[0]);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const msgIdx = useRef(0);

  useEffect(() => {
    base44.entities.Resume.list('-created_date', 50).then((data) => {
      setHistory(data);
      setHistoryLoading(false);
    });
  }, []);

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

  const onFile = async (file) => {
    setError('');
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const res = await base44.functions.invoke('extractResumeText', { file_uri });
    if (res.data?.error) throw new Error(res.data.error);
    if (res.data?.text) setResumeText(res.data.text);
  };

  const review = async () => {
    setError('');
    if (!resumeText.trim() || !targetRole.trim()) {
      setError('Enter a target job title and provide your resume.');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('reviewResume', {
        resume_text: resumeText.trim(),
        target_role: targetRole.trim(),
      });
      if (res.data?.error) {
        setError(res.data.error);
        return;
      }
      const r = res.data.review;
      const record = await base44.entities.Resume.create({
        resume_text: resumeText.trim(),
        target_role: targetRole.trim(),
        overall_score: r.overall_score,
        best_jobs: r.best_jobs || [],
        transferable_skills: r.transferable_skills || [],
        resume_suggestions: r.resume_suggestions || [],
        linkedin_suggestions: r.linkedin_suggestions || [],
      });
      setCurrent(record);
      setHistory((prev) => [record, ...prev]);
    } catch (e) {
      setError(e.message || 'Something went wrong reviewing the resume.');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (rec) => {
    await base44.entities.Resume.delete(rec.id);
    setHistory((prev) => prev.filter((x) => x.id !== rec.id));
    if (current?.id === rec.id) setCurrent(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Resume & LinkedIn Reviewer
      </h1>
      <div className="space-y-6">
        <ResumeReviewForm
          resumeText={resumeText}
          setResumeText={setResumeText}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          onReview={review}
          onFile={onFile}
          loading={loading}
          loadingMsg={loadingMsg}
          error={error}
        />
        {current && <ResumeReviewResult review={current} />}
        <ResumeReviewHistory
          history={history}
          loading={historyLoading}
          currentId={current?.id}
          onOpen={setCurrent}
          onDelete={deleteReview}
        />
      </div>
    </div>
  );
}