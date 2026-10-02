import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const CLEARANCE_ORDER = ['None', 'Ability to Obtain', 'Public Trust', 'Secret', 'Top Secret', 'TS-SCI'];

function normExp(v, fallback) {
  if (!v) return fallback || 'Entry Level';
  const norm = String(v).toLowerCase().replace(/[\s\-\/]/g, '');
  const map = {
    internship: 'Internship',
    entrylevel: 'Entry Level',
    midlevel: 'Mid Level',
    senior: 'Senior',
    leadmanager: 'Lead-Manager',
  };
  return map[norm] || fallback || 'Entry Level';
}

function key(t, comp) {
  return String(t || '').toLowerCase().trim() + '|' + String(comp || '').toLowerCase().trim();
}

function validUrl(url) {
  if (!url) return false;
  return /^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(url);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const criteriaList = await base44.entities.SearchCriteria.list('-created_date', 1);
    if (!criteriaList.length) {
      return Response.json(
        { error: 'No search criteria found. Configure your search settings first.' },
        { status: 400 }
      );
    }
    const c = criteriaList[0];

    const sources = c.sources || [];
    const titles = c.job_titles || [];
    const cities = c.cities || [];
    const requiredSkills = c.required_skills || [];
    const excludeKeywords = c.exclude_keywords || [];
    const minResults = Math.max(c.results_per_search || 25, 15);

    // Postings the user dismissed or already has in the Job Tracker must not come
    // back. Everything else stays eligible, so repeat searches still fill the list.
    const [existingScraped, existingApps] = await Promise.all([
      base44.entities.ScrapedJob.list('-created_date', 500),
      base44.entities.JobApplication.list('-created_date', 500),
    ]);
    const dismissedKeys = new Set(
      existingScraped.filter((s) => s.not_interested).map((s) => key(s.title, s.company))
    );
    const trackedKeys = new Set(existingApps.map((a) => key(a.title, a.company)));

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    let clearanceClause;
    if (c.clearance_level && c.clearance_level !== 'None') {
      const idx = CLEARANCE_ORDER.indexOf(c.clearance_level);
      const allowed = idx >= 0 ? CLEARANCE_ORDER.slice(0, idx + 1) : CLEARANCE_ORDER;
      clearanceClause = `CLEARANCE FILTER: The candidate's clearance level is "${c.clearance_level}". PRIORITIZE the ClearanceJobs and USAJobs sources. ONLY return roles whose clearance requirement is "${c.clearance_level}" or BELOW (i.e. one of: ${allowed.join(', ')}). NEVER include roles requiring a higher clearance than "${c.clearance_level}".`;
    } else {
      clearanceClause = `CLEARANCE FILTER: No specific clearance required — include roles with any or no clearance requirement.`;
    }

    const prompt = `You are an expert technical job-sourcing assistant with live web search access.

TODAY'S DATE: ${todayStr}. Compute this first. The freshness cutoff is ${cutoffStr} (90 days ago).

Search ALL of the following job sources for currently-open postings: ${sources.join(', ')}.

Match EVERY one of these criteria:
- Job titles: ${titles.length ? titles.join(', ') : 'any relevant tech role'}
- Country: ${c.country || 'any'}
- State/Region: ${c.state_region || 'any'}
- Cities: ${cities.length ? cities.join(', ') : 'any'}
- Remote only: ${c.remote_only ? 'YES — only remote roles' : 'no (on-site/hybrid allowed)'}
- Open to hybrid: ${c.hybrid_ok ? 'yes' : 'no'}
- Minimum salary: ${c.min_salary ? '$' + c.min_salary + ' or above' : 'any'}
- Experience level: ${c.experience_level || 'any'}
- Required skills: ${requiredSkills.length ? requiredSkills.join(', ') : 'any'}
- Exclude keywords: ${excludeKeywords.length ? excludeKeywords.join(', ') : 'none'} — discard any posting matching these

${clearanceClause}

FRESHNESS IS A HARD RULE, not a preference:
1. First compute today's date (${todayStr}).
2. ONLY return postings whose date_posted falls within the last 90 days (on or after ${cutoffStr}).
3. A posting from an earlier year, or one whose date cannot be confirmed as within the last 90 days, MUST be discarded and replaced with a fresh one — NEVER pad results with stale postings.
4. Prefer postings from the last 14 days when available.
5. Before returning, re-check every result's date_posted against today's date and drop any violation.

Return AT LEAST ${minResults} real, currently-open postings — never fewer than 15. Each must be a REAL, LIVE posting, and no two may be the same role at the same company. Favour the most recently posted roles. Do not invent or fabricate postings.

URL INTEGRITY (CRITICAL): For job_url, copy the EXACT, verbatim URL of the live posting directly from your web search results. NEVER fabricate, guess, reconstruct, or shorten URLs. A fabricated URL is worse than no URL — if the real direct URL for a posting is not visible in your search results, set job_url to an empty string "" and do NOT invent one.

For each posting return:
- title: job title
- company: hiring company
- location: city, state or "Remote"
- salary: salary range or figure exactly as posted (or "Not listed")
- description_summary: EXACTLY 2 sentences summarizing the role
- date_posted: YYYY-MM-DD
- job_url: the EXACT verbatim URL copied from the search result for this posting, or "" if no real URL is available
- source: the source site name (one of: ${sources.join(', ')})
- experience_level: one of Internship, Entry Level, Mid Level, Senior, Lead/Manager
- clearance_required: the clearance level required (or "None")
- relevance_score: integer 0-100 reflecting how well the posting matches ALL the criteria above`;

    const response_json_schema = {
      type: 'object',
      properties: {
        jobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              company: { type: 'string' },
              location: { type: 'string' },
              salary: { type: 'string' },
              description_summary: { type: 'string' },
              date_posted: { type: 'string' },
              job_url: { type: 'string' },
              source: { type: 'string' },
              experience_level: { type: 'string' },
              clearance_required: { type: 'string' },
              relevance_score: { type: 'number' },
            },
            required: [
              'title', 'company', 'location', 'salary', 'description_summary',
              'date_posted', 'job_url', 'source', 'experience_level',
              'clearance_required', 'relevance_score',
            ],
          },
        },
      },
      required: ['jobs'],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema,
    });

    let jobs = (result && result.jobs) || [];

    // Freshness safety net (server-side)
    const cutoffTime = cutoff.getTime();
    jobs = jobs.filter((j) => {
      if (!j.date_posted) return false;
      const d = new Date(j.date_posted);
      if (isNaN(d.getTime())) return false;
      return d.getTime() >= cutoffTime;
    });

    // Dedup within this batch (same title + company)
    const seenInBatch = new Set();
    jobs = jobs.filter((j) => {
      const k = key(j.title, j.company);
      if (seenInBatch.has(k)) return false;
      seenInBatch.add(k);
      return true;
    });

    const fresh = jobs.filter((j) => {
      const k = key(j.title, j.company);
      return !dismissedKeys.has(k) && !trackedKeys.has(k);
    });

    if (!fresh.length) {
      return Response.json({
        batch_id: null,
        created_at: new Date().toISOString(),
        jobs: [],
        message: 'No postings found for your current criteria — try widening your search in Settings.',
      });
    }

    const batch_id = crypto.randomUUID();
    const records = fresh.map((j) => ({
      title: j.title,
      company: j.company,
      location: j.location || '',
      salary: j.salary || '',
      description_summary: j.description_summary || '',
      date_posted: j.date_posted,
      job_url: validUrl(j.job_url) ? j.job_url : '',
      source: j.source || '',
      experience_level: normExp(j.experience_level, c.experience_level),
      clearance_required: j.clearance_required || '',
      relevance_score: typeof j.relevance_score === 'number' ? j.relevance_score : null,
      not_interested: false,
      saved: false,
      batch_id,
    }));

    const created = await base44.entities.ScrapedJob.bulkCreate(records);

    return Response.json({ batch_id, created_at: new Date().toISOString(), jobs: created });
  } catch (error) {
    return Response.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}