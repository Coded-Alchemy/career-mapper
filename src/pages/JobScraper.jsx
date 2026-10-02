import { useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
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
  const clean = { ...record };
  delete clean.created_date;
  delete clean.updated_date;
  delete clean.created_by_id;
  return { ...DEFAULTS, ...clean };
};

export default function JobScraper() {
  const [searches, setSearches] = useState(null);
  const [criteria, setCriteria] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [panel, setPanel] = useState('settings');
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

  const renderTabs = (className) => (
    <div className={cn('jb-tabs', className)}>
      <button
        type="button"
        className={cn('jb-tab', panel === 'settings' && 'jb-tab-active')}
        onClick={() => setPanel('settings')}
      >
        Settings
      </button>
      <button
        type="button"
        className={cn('jb-tab', panel === 'results' && 'jb-tab-active')}
        onClick={() => setPanel('results')}
      >
        Results
      </button>
    </div>
  );

  return (
    <div className="jb-page">
      <div className="jb-shell">
        <header className="jb-top">
          <h1 className="jb-title">AI Job Scraper</h1>
          {saveState !== 'idle' && (
            <span className="jb-state">
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </>
              )}
            </span>
          )}
        </header>

        {renderTabs('jb-tabs-mobile')}

        <div className="jb-layout">
          <aside className={cn('jb-panel jb-rail', panel === 'results' && 'jb-hide-mobile')}>
            {criteria && searches && (
              <SavedSearches
                searches={searches}
                activeId={criteria.id}
                onSelect={selectSearch}
                onCreate={createSearch}
                onRename={renameSearch}
                onDelete={deleteSearch}
              />
            )}

            {criteria && <ScraperSummary criteria={criteria} />}

            {renderTabs('jb-tabs-desktop')}

            <h2 className="jb-sectiontitle">Settings</h2>

            {criteria ? (
              <ScraperSettings criteria={criteria} onChange={onChange} />
            ) : (
              <div className="flex justify-center py-14">
                <div className="jb-spinner animate-spin" />
              </div>
            )}
          </aside>

          <main className={cn('jb-panel jb-main', panel === 'settings' && 'jb-hide-mobile')}>
            <ScraperResults />
          </main>
        </div>
      </div>
    </div>
  );
}