import { useState } from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ResumeReviewForm({
  resumeText, setResumeText,
  targetRole, setTargetRole,
  onReview, onFile,
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
        <Label>Target Job Title</Label>
        <Input
          placeholder='e.g. "SOC Analyst"'
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Resume</Label>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={onReview} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingMsg}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Review My Resume
          </>
        )}
      </Button>
    </div>
  );
}