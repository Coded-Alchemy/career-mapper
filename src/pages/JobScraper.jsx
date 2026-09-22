import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Settings as SettingsIcon, ListChecks, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ScraperSettings from '@/components/scraper/ScraperSettings';
import ScraperSummary from '@/components/scraper/ScraperSummary';

const ALL_SOURCES = [
  'ClearanceJobs', 'LinkedIn Jobs', 'Indeed', 'USAJobs', 'Dice',
  'ZipRecruiter', 'Glassdoor', 'Wellfound', 'Google Jobs',
];

const DEFAULTS = {
  job_titles: [],
  country: 'United States',
  state_region: '',
  cities: [],
  remote_only: false,
  hybrid_ok: true,
  min_salary: null,
  experience_level: 'Entry Level',
  clearance_level: 'None',
  required_skills: [],
  exclude_keywords: [],
  sources: [...ALL_SOURCES],
  results_per_search: 25,
};

export default function JobScraper() {
  const [criteria, setCriteria] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const skipSave = useRef(true);
  const recordId = useRef(null);

  useEffect(() => {
    base44.entities.SearchCriteria.list('-created_date', 1).then((data) => {
      if (data.length) {
        recordId.current = data[0].id;
        setCriteria({ ...DEFAULTS, ...data[0] });
      } else {
        setCriteria({ ...DEFAULTS });
      }
    });
  }, []);

  useEffect(() => {
    if (!criteria) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    setSaveState('saving');
    const t = setTimeout(async () => {
      const { id, created_date, updated_date, created_by_id, ...payload } = criteria;
      try {
        if (recordId.current) {
          await base44.entities.SearchCriteria.update(recordId.current, payload);
        } else {
          const created = await base44.entities.SearchCriteria.create(payload);
          recordId.current = created.id;
        }
        setSaveState('saved');
      } catch {
        setSaveState('idle');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [criteria]);

  const onChange = (patch) => setCriteria((prev) => ({ ...prev, ...patch }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI Job Scraper</h1>
        {saveState !== 'idle' && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === 'saving' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                Saved
              </>
            )}
          </span>
        )}
      </header>

      {criteria && (
        <div className="mb-6">
          <ScraperSummary criteria={criteria} />
        </div>
      )}

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="results">
            <ListChecks className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          {criteria ? (
            <ScraperSettings criteria={criteria} onChange={onChange} />
          ) : (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="results">
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Results</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Scraped job results will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}