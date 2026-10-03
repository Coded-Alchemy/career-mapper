import { useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Search, Download, ArrowUp, ArrowDown, ArrowUpDown, ExternalLink, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useListHeight from '@/hooks/useListHeight';
import { JOB_STATUSES, JOB_STATUS_STYLES } from '@/lib/jobConstants';

function normalizeUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

const SORTABLE = ['company', 'title', 'status', 'date_applied', 'salary_range', 'location', 'follow_up_date'];

// The header row and the scrolling rows live in two tables so the scrollbar
// only spans the rows — both share these widths so the columns line up.
const COLGROUP = (
  <colgroup>
    {[14, 16, 11, 10, 11, 11, 8, 10, 9].map((w) => (
      <col key={w} style={{ width: `${w}%` }} />
    ))}
  </colgroup>
);

function sortValue(row, field) {
  if (field === 'date_applied' || field === 'follow_up_date') {
    if (!row[field]) return 0;
    const d = parseISO(row[field]);
    return isValid(d) ? d.getTime() : 0;
  }
  return (row[field] || '').toLowerCase();
}

function exportCsv(rows) {
  const headers = [
    'Company', 'Title', 'Status', 'Date Applied', 'Salary Range',
    'Location', 'Remote', 'Follow-Up Date', 'Job URL',
  ];
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [
      r.company, r.title, r.status, r.date_applied, r.salary_range, r.location,
      r.remote ? 'Remote' : 'On-site', r.follow_up_date, normalizeUrl(r.job_url) || '',
    ]
      .map(escape)
      .join(',')
  );
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'applications.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function JobTable({ applications, onCardClick }) {
  const [tableRef, tableHeight] = useListHeight();
  const [cardsRef, cardsHeight] = useListHeight();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [sortField, setSortField] = useState('date_applied');
  const [sortDir, setSortDir] = useState('desc');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = applications.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (remoteFilter === 'remote' && !a.remote) return false;
      if (remoteFilter === 'onsite' && a.remote) return false;
      if (q) {
        const hay = `${a.company || ''} ${a.title || ''} ${a.location || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    filtered = [...filtered].sort((a, b) => {
      const av = sortValue(a, sortField);
      const bv = sortValue(b, sortField);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return filtered;
  }, [applications, search, statusFilter, remoteFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const th = (label, field, className = '') => (
    <th className={`bg-card px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground ${className}`}>
      {field ? (
        <button
          onClick={() => toggleSort(field)}
          className="flex items-center gap-1 hover:text-foreground"
        >
          {label}
          <SortIcon field={field} />
        </button>
      ) : (
        label
      )}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, title, location…"
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={remoteFilter} onValueChange={setRemoteFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Remote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => exportCsv(rows)}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Desktop table — the header row stays put and only the rows below it
          scroll, so the scrollbar starts under the header. The cap sits on the
          whole box so its border never pushes the page into a page scrollbar. */}
      <div
        ref={tableRef}
        style={{ maxHeight: tableHeight ?? undefined }}
        className="hidden overflow-hidden rounded-xl border border-border md:flex md:flex-col"
      >
        <div className="shrink-0 pr-[var(--scrollbar-size)]">
          <table className="w-full table-fixed">
            {COLGROUP}
            <thead className="border-b border-border">
              <tr>
                {th('Company', 'company')}
                {th('Title', 'title')}
                {th('Status', 'status')}
                {th('Date Applied', 'date_applied')}
                {th('Salary Range', 'salary_range')}
                {th('Location', 'location')}
                {th('Remote', null, 'text-center')}
                {th('Follow-Up', 'follow_up_date')}
                {th('Apply', null, 'text-center')}
              </tr>
            </thead>
          </table>
        </div>

        <div className="bp-gutter flex-1 overflow-y-auto">
          <table className="w-full table-fixed">
            {COLGROUP}
            <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No applications match your filters.
                </td>
              </tr>
            ) : (
              rows.map((a) => {
                const url = normalizeUrl(a.job_url);
                return (
                  <tr
                    key={a.id}
                    onClick={() => onCardClick(a)}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5 text-sm font-medium text-foreground">{a.company}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{a.title}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${JOB_STATUS_STYLES[a.status] || ''}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{fmtDate(a.date_applied)}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{a.salary_range || '—'}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{a.location || '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      {a.remote ? (
                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary">Remote</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">On-site</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{fmtDate(a.follow_up_date)}</td>
                    <td className="px-3 py-2.5 text-center">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                        >
                          Apply
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Mobile stacked cards */}
      <div
        ref={cardsRef}
        style={{ maxHeight: cardsHeight ?? undefined }}
        className="space-y-2 overflow-y-auto md:hidden"
      >
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No applications match your filters.
          </p>
        ) : (
          rows.map((a) => {
            const url = normalizeUrl(a.job_url);
            return (
              <div
                key={a.id}
                onClick={() => onCardClick(a)}
                className="cursor-pointer rounded-xl border border-border bg-card p-3 hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{a.company}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.title}</div>
                  </div>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${JOB_STATUS_STYLES[a.status] || ''}`}>
                    {a.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {a.location && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {a.location}
                    </span>
                  )}
                  {a.remote && (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">Remote</span>
                  )}
                  {a.salary_range && <span>{a.salary_range}</span>}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Applied {fmtDate(a.date_applied)}</span>
                  <span>Follow-up {fmtDate(a.follow_up_date)}</span>
                </div>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                  >
                    Apply Now
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}