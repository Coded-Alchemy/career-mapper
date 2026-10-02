import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Settings as SettingsIcon, ListChecks } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SavedSearches from '@/components/scraper/SavedSearches';
import ScraperSettings from '@/components/scraper/ScraperSettings';
import ScraperSummary from '@/components/scraper/ScraperSummary';
import ScraperResults from '@/components/scraper/ScraperResults';

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

const toCriteria = (record) => {
  const { created_date, updated_date, created_by_id, ...rest } = record;
  return { ...DEFAULTS, ...rest };
};

export default function JobScraper() {
  const [searches, setSearches] = useState(null);
  const [criteria, setCriteria] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const skipSave = useRef(true);

  useEffect(() => {
    base44.entities.SearchCriteria.list('-updated_date').then(async (data) => {
      if (data.length) {
        setSearches(data);
        setCriteria(toCriteria(data[0]));
      } else {
        const created = await base44.entities.SearchCriteria.create({ ...DEFAULTS, name: 'My Search' });
        setSearches([created]);
        setCriteria(toCriteria(created));
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
      const { id, ...payload } = criteria;
      await base44.entities.SearchCriteria.update(id, payload);
      setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, ...payload } : s)));
      setSaveState('saved');
    }, 600);
    return () => clearTimeout(t);
  }, [criteria]);

  const loadSearch = (record) => {
    skipSave.current = true;
    setCriteria(toCriteria(record));
    setSaveState('idle');
  };

  const onChange = (patch) => setCriteria((prev) => ({ ...prev, ...patch }));

  const selectSearch = (id) => {
    if (id === criteria?.id) return;
    const record = (searches || []).find((s) => s.id === id);
    if (record) loadSearch(record);
  };

  const createSearch = async (name) => {
    const created = await base44.entities.SearchCriteria.create({ ...DEFAULTS, name });
    setSearches((prev) => [created, ...(prev || [])]);
    loadSearch(created);
  };

  const renameSearch = async (name) => {
    const id = criteria.id;
    await base44.entities.SearchCriteria.update(id, { name });
    setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    skipSave.current = true;
    setCriteria((prev) => ({ ...prev, name }));
  };

  const deleteSearch = async (id) => {
    await base44.entities.SearchCriteria.delete(id);
    const remaining = (searches || []).filter((s) => s.id !== id);

    if (criteria?.id !== id) {
      setSearches(remaining);
      return;
    }
    if (remaining.length) {
      setSearches(remaining);
      loadSearch(remaining[0]);
    } else {
      const created = await base44.entities.SearchCriteria.create({ ...DEFAULTS, name: 'My Search' });
      setSearches([created]);
      loadSearch(created);
    }
  };

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

      {criteria && searches && (
        <div className="mb-4">
          <SavedSearches
            searches={searches}
            activeId={criteria.id}
            onSelect={selectSearch}
            onCreate={createSearch}
            onRename={renameSearch}
            onDelete={deleteSearch}
          />
        </div>
      )}

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
          <ScraperResults />
        </TabsContent>
      </Tabs>
    </div>
  );
}