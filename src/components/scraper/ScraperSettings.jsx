import TagInput from '@/components/projects/TagInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, statesFor } from '@/lib/locations';

const SOURCES = [
  'ClearanceJobs', 'LinkedIn Jobs', 'Indeed', 'USAJobs', 'Dice',
  'ZipRecruiter', 'Glassdoor', 'Wellfound', 'Google Jobs',
];

const EXPERIENCE = [
  { value: 'Internship', label: 'Internship' },
  { value: 'Entry Level', label: 'Entry Level' },
  { value: 'Mid Level', label: 'Mid Level' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead-Manager', label: 'Lead/Manager' },
];

const CLEARANCE = ['None', 'Ability to Obtain', 'Public Trust', 'Secret', 'Top Secret', 'TS-SCI'];
const RESULTS = [10, 25, 50];

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function ScraperSettings({ criteria, onChange }) {
  const stateList = statesFor(criteria.country);

  const toggleSource = (src) => {
    const cur = criteria.sources || [];
    const next = cur.includes(src) ? cur.filter((s) => s !== src) : [...cur, src];
    onChange({ sources: next });
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-5">
      <Field label="Job Titles">
        <TagInput
          value={criteria.job_titles || []}
          onChange={(v) => onChange({ job_titles: v })}
          placeholder='e.g. "Help Desk Technician", "SOC Analyst"'
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Country">
          <Select
            value={criteria.country || 'United States'}
            onValueChange={(v) => onChange({ country: v, state_region: '' })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="State / Region">
          {stateList ? (
            <Select
              value={criteria.state_region || ''}
              onValueChange={(v) => onChange({ state_region: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {stateList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={criteria.state_region || ''}
              onChange={(e) => onChange({ state_region: e.target.value })}
              placeholder="State / Region"
            />
          )}
        </Field>
      </div>

      <Field label="Cities (optional)">
        <TagInput
          value={criteria.cities || []}
          onChange={(v) => onChange({ cities: v })}
          placeholder="Add a city and press Enter"
        />
      </Field>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2.5">
          <Switch checked={!!criteria.remote_only} onCheckedChange={(v) => onChange({ remote_only: v })} />
          <Label className="font-normal cursor-pointer">Remote only</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch checked={!!criteria.hybrid_ok} onCheckedChange={(v) => onChange({ hybrid_ok: v })} />
          <Label className="font-normal cursor-pointer">Open to hybrid</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Minimum Salary">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              min="0"
              step="1000"
              className="pl-7"
              value={criteria.min_salary ?? ''}
              onChange={(e) => onChange({ min_salary: e.target.value ? Number(e.target.value) : null })}
              placeholder="55,000"
            />
          </div>
        </Field>
        <Field label="Experience Level">
          <Select
            value={criteria.experience_level || 'Entry Level'}
            onValueChange={(v) => onChange({ experience_level: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Clearance Level">
          <Select
            value={criteria.clearance_level || 'None'}
            onValueChange={(v) => onChange({ clearance_level: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CLEARANCE.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Required Skills">
        <TagInput
          value={criteria.required_skills || []}
          onChange={(v) => onChange({ required_skills: v })}
          placeholder="e.g. Splunk, Python, Active Directory"
        />
      </Field>

      <Field label="Exclude Keywords">
        <TagInput
          value={criteria.exclude_keywords || []}
          onChange={(v) => onChange({ exclude_keywords: v })}
          placeholder="e.g. senior, manager, 5+ years"
        />
      </Field>

      <div className="space-y-2">
        <Label>Sources to Search</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SOURCES.map((src) => {
            const checked = (criteria.sources || []).includes(src);
            return (
              <div key={src} className="flex items-center gap-2.5 rounded-lg border border-border bg-background/40 px-3 py-2">
                <Checkbox checked={checked} onCheckedChange={() => toggleSource(src)} id={`src-${src}`} />
                <label htmlFor={`src-${src}`} className="cursor-pointer text-sm text-foreground">{src}</label>
              </div>
            );
          })}
        </div>
      </div>

      <Field label="Results per Search">
        <Select
          value={String(criteria.results_per_search || 25)}
          onValueChange={(v) => onChange({ results_per_search: Number(v) })}
        >
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RESULTS.map((r) => (
              <SelectItem key={r} value={String(r)}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}