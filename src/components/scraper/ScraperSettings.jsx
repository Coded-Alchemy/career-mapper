import TagInput from '@/components/projects/TagInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const SELECT_CLASS = 'bp-select bp-control';

function Field({ label, children }) {
  return (
    <div className="bp-field">
      <Label className="bp-label">{label}</Label>
      {children}
    </div>
  );
}

function TagField({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <TagInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bp-tagbox bp-control"
        chipClassName="bp-chip"
        inputClassName="bp-taginput"
      />
    </Field>
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
    <div className="bp-form">
      <TagField
        label="Job Titles"
        value={criteria.job_titles || []}
        onChange={(v) => onChange({ job_titles: v })}
        placeholder='e.g. "Help Desk Technician", "SOC Analyst"'
      />

      <div className="bp-fieldrow">
        <Field label="Country">
          <Select
            value={criteria.country || 'United States'}
            onValueChange={(v) => onChange({ country: v, state_region: '' })}
          >
            <SelectTrigger className={SELECT_CLASS}><SelectValue /></SelectTrigger>
            <SelectContent className="bp-popover">
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c} className="bp-item">{c}</SelectItem>
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
              <SelectTrigger className={SELECT_CLASS}><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent className="bp-popover">
                {stateList.map((s) => (
                  <SelectItem key={s} value={s} className="bp-item">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={criteria.state_region || ''}
              onChange={(e) => onChange({ state_region: e.target.value })}
              placeholder="State / Region"
              className="bp-input bp-control"
            />
          )}
        </Field>
      </div>

      <TagField
        label="Cities (optional)"
        value={criteria.cities || []}
        onChange={(v) => onChange({ cities: v })}
        placeholder="Add a city and press Enter"
      />

      <div className="bp-toggleline">
        <label className="bp-checklabel">
          <input
            type="checkbox"
            className="bp-check"
            checked={!!criteria.remote_only}
            onChange={(e) => onChange({ remote_only: e.target.checked })}
          />
          Remote only
        </label>
        <label className="bp-checklabel">
          <input
            type="checkbox"
            className="bp-check"
            checked={!!criteria.hybrid_ok}
            onChange={(e) => onChange({ hybrid_ok: e.target.checked })}
          />
          Open to hybrid
        </label>
      </div>

      <div className="bp-triple">
        <Field label="Minimum Salary">
          <div className="bp-money">
            <span>$</span>
            <Input
              type="number"
              min="0"
              step="1000"
              value={criteria.min_salary ?? ''}
              onChange={(e) => onChange({ min_salary: e.target.value ? Number(e.target.value) : null })}
              placeholder="55,000"
              className="bp-input bp-control"
            />
          </div>
        </Field>

        <Field label="Experience Level">
          <Select
            value={criteria.experience_level || 'Entry Level'}
            onValueChange={(v) => onChange({ experience_level: v })}
          >
            <SelectTrigger className={SELECT_CLASS}><SelectValue /></SelectTrigger>
            <SelectContent className="bp-popover">
              {EXPERIENCE.map((o) => (
                <SelectItem key={o.value} value={o.value} className="bp-item">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Clearance Level">
          <Select
            value={criteria.clearance_level || 'None'}
            onValueChange={(v) => onChange({ clearance_level: v })}
          >
            <SelectTrigger className={SELECT_CLASS}><SelectValue /></SelectTrigger>
            <SelectContent className="bp-popover">
              {CLEARANCE.map((c) => (
                <SelectItem key={c} value={c} className="bp-item">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <TagField
        label="Required Skills"
        value={criteria.required_skills || []}
        onChange={(v) => onChange({ required_skills: v })}
        placeholder="e.g. Splunk, Python, Active Directory"
      />

      <TagField
        label="Exclude Keywords"
        value={criteria.exclude_keywords || []}
        onChange={(v) => onChange({ exclude_keywords: v })}
        placeholder="e.g. senior, manager, 5+ years"
      />

      <Field label="Sources to Search">
        <div className="bp-sourcegrid">
          {SOURCES.map((src) => (
            <label key={src} className="bp-source">
              <input
                type="checkbox"
                className="bp-check"
                checked={(criteria.sources || []).includes(src)}
                onChange={() => toggleSource(src)}
              />
              {src}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Results per Search">
        <Select
          value={String(criteria.results_per_search || 25)}
          onValueChange={(v) => onChange({ results_per_search: Number(v) })}
        >
          <SelectTrigger className={SELECT_CLASS}><SelectValue /></SelectTrigger>
          <SelectContent className="bp-popover">
            {RESULTS.map((r) => (
              <SelectItem key={r} value={String(r)} className="bp-item">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}