import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function PrepForm({
  company, setCompany,
  roleTitle, setRoleTitle,
  jobDescription, setJobDescription,
  applicationId, onSelectApplication,
  applications,
  onGenerate, loading, loadingMsg, error,
}) {
  const eligible = applications.filter((a) => !['Rejected', 'Ghosted'].includes(a.status));

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-1.5">
        <Label>Link to Application (optional)</Label>
        <Select
          value={applicationId || 'none'}
          onValueChange={(v) => onSelectApplication(v === 'none' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="No linked application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No linked application</SelectItem>
            {eligible.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.company} — {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Role Title</Label>
          <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Job Description</Label>
        <Textarea
          rows={8}
          placeholder="Paste the full job description here"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={onGenerate} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingMsg}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Prep Plan
          </>
        )}
      </Button>
    </div>
  );
}