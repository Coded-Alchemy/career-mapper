import { useState } from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const TIMEFRAMES = ['30 days', '90 days', '6 months', '12 months'];

export default function RoadmapForm({
  targetRole, setTargetRole,
  resumeText, setResumeText,
  timeframe, setTimeframe,
  onBuild, onFile, onUseLastResume, hasResume,
  loading, loadingMsg, error,
}) {
  const [extracting, setExtracting] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      await onFile(file);
    } finally {
      setExtracting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-1.5">
        <Label>Target Tech Role</Label>
        <Input
          placeholder='e.g. "SOC Analyst", "Cloud Engineer"'
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Resume</Label>
          {hasResume && (
            <button
              onClick={onUseLastResume}
              className="text-xs font-medium text-primary hover:underline"
            >
              Use my last reviewed resume
            </button>
          )}
        </div>
        <Textarea
          rows={8}
          placeholder="Paste your resume text here, or upload a PDF, Word or text file below"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent">
          {extracting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {extracting ? 'Extracting…' : 'Upload resume file'}
          <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFile} />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label>Goal Timeframe</Label>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEFRAMES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={onBuild} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingMsg}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Build My Roadmap
          </>
        )}
      </Button>
    </div>
  );
}