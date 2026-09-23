function enc(s) {
  return encodeURIComponent((s || '').trim());
}

function query(job) {
  return [job.title, job.company].filter(Boolean).map(enc).join('%20');
}

const BUILDERS = {
  ClearanceJobs: (j) => `https://www.clearancejobs.com/search?q=${enc(j.title)}`,
  'LinkedIn Jobs': (j) => `https://www.linkedin.com/jobs/search/?keywords=${query(j)}`,
  Indeed: (j) => `https://www.indeed.com/jobs?q=${enc(j.title)}${j.location ? `&l=${enc(j.location)}` : ''}`,
  USAJobs: (j) => `https://www.usajobs.gov/Search/?keyword=${enc(j.title)}`,
  Dice: (j) => `https://www.dice.com/jobs?q=${enc(j.title)}`,
  ZipRecruiter: (j) => `https://www.ziprecruiter.com/candidate/search?search=${enc(j.title)}`,
  Glassdoor: (j) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${enc(j.title)}`,
  Wellfound: (j) => `https://wellfound.com/jobs?q=${enc(j.title)}`,
  'Google Jobs': (j) => `https://www.google.com/search?q=${query(j)}%20jobs`,
};

// Scraped job URLs come from LLM web search and are frequently fabricated or stale,
// so "View Posting" links to a real search-results page on the source site instead
// of trusting the (often broken) direct job_url.
export function buildSourceSearchUrl(job) {
  const builder = BUILDERS[job.source];
  if (builder) return builder(job);
  return `https://www.google.com/search?q=${query(job)}%20jobs`;
}