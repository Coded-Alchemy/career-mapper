import { useEffect, useRef, useState } from 'react';
import { format, addDays } from 'date-fns';
import { base44 } from '@/api/base44Client';
import RoadmapForm from './RoadmapForm';
import RoadmapResult from './RoadmapResult';
import RoadmapHistory from './RoadmapHistory';

const TIMEFRAME_DAYS = { '30 days': 30, '90 days': 90, '6 months': 180, '12 months': 365 };
const PROGRESS_MSGS = [
  'Analyzing your resume…',
  'Mapping skill gaps…',
  'Charting your role path…',
  'Designing milestones…',
  'Assessing feasibility…',
];

export default function RoadmapTab() {
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [timeframe, setTimeframe] = useState('90 days');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(PROGRESS_MSGS[0]);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const msgIdx = useRef(0);

  useEffect(() => {
    base44.entities.CareerRoadmap.list('-date_created', 50).then((data) => {
      setHistory(data);
      setHistoryLoading(false);
    });
    base44.entities.Resume.list('-created_date', 1).then((data) => {
      setHasResume(data.length > 0 && !!data[0].resume_text);
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

  const useLastResume = async () => {
    const data = await base44.entities.Resume.list('-created_date', 1);
    if (data.length && data[0].resume_text) setResumeText(data[0].resume_text);
  };

  const onFile = async (file) => {
    setError('');
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const res = await base44.functions.invoke('extractResumeText', { file_uri });
    if (res.data?.error) throw new Error(res.data.error);
    if (res.data?.text) setResumeText(res.data.text);
  };

  const build = async () => {
    setError('');
    if (!targetRole.trim() || !resumeText.trim()) {
      setError('Enter a target role and provide your resume.');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('buildRoadmap', {
        target_role: targetRole.trim(),
        resume_text: resumeText.trim(),
        timeframe,
      });
      if (res.data?.error) {
        setError(res.data.error);
        return;
      }
      const r = res.data.roadmap;
      const record = await base44.entities.CareerRoadmap.create({
        target_role: targetRole.trim(),
        timeframe,
        resume_text: resumeText.trim(),
        current_assessment: r.current_assessment,
        skill_gaps: r.skill_gaps || [],
        certifications: r.certifications || [],
        role_path: r.role_path || [],
        milestones: r.milestones || [],
        feasibility_note: r.feasibility_note || '',
        checked_skills: [],
        added_milestones: [],
        date_created: new Date().toISOString(),
      });
      setCurrent(record);
      setHistory((prev) => [record, ...prev]);
    } catch (e) {
      setError(e.message || 'Something went wrong building the roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoadmap = async (rec) => {
    await base44.entities.CareerRoadmap.delete(rec.id);
    setHistory((prev) => prev.filter((x) => x.id !== rec.id));
    if (current?.id === rec.id) setCurrent(null);
  };

  const toggleSkill = async (skill) => {
    if (!current) return;
    const checked = current.checked_skills || [];
    const next = checked.includes(skill)
      ? checked.filter((s) => s !== skill)
      : [...checked, skill];
    const updated = await base44.entities.CareerRoadmap.update(current.id, { checked_skills: next });
    setCurrent(updated);
    setHistory((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const addMilestonesToGoals = async () => {
    if (!current) return { created: 0, skipped: 0 };
    const phases = current.milestones || [];
    const already = current.added_milestones || [];
    const toAdd = phases.filter((p) => !already.includes(p.phase));
    if (toAdd.length === 0) return { created: 0, skipped: phases.length };

    const totalDays = TIMEFRAME_DAYS[current.timeframe] || 90;
    const n = phases.length;
    const goals = toAdd.map((p) => {
      const idx = phases.indexOf(p);
      const days = Math.round(((idx + 1) * totalDays) / n);
      return {
        title: p.phase,
        description: (p.actions || []).join('\n'),
        category: 'Career',
        status: 'active',
        target_date: format(addDays(new Date(), days), 'yyyy-MM-dd'),
      };
    });
    await base44.entities.Goal.bulkCreate(goals);
    const updated = await base44.entities.CareerRoadmap.update(current.id, {
      added_milestones: [...already, ...toAdd.map((p) => p.phase)],
    });
    setCurrent(updated);
    setHistory((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    return { created: toAdd.length, skipped: already.length };
  };

  return (
    <div className="space-y-6">
      <RoadmapForm
        targetRole={targetRole}
        setTargetRole={setTargetRole}
        resumeText={resumeText}
        setResumeText={setResumeText}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        onBuild={build}
        onFile={onFile}
        onUseLastResume={useLastResume}
        hasResume={hasResume}
        loading={loading}
        loadingMsg={loadingMsg}
        error={error}
      />
      {current && (
        <RoadmapResult
          roadmap={current}
          onToggleSkill={toggleSkill}
          onAddToGoals={addMilestonesToGoals}
        />
      )}
      <RoadmapHistory
        history={history}
        loading={historyLoading}
        currentId={current?.id}
        onOpen={setCurrent}
        onDelete={deleteRoadmap}
      />
    </div>
  );
}