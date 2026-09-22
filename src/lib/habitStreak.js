import {
  format,
  subDays,
  startOfDay,
  isSameWeek,
  startOfWeek,
  subWeeks,
  parseISO,
  differenceInCalendarDays,
} from 'date-fns';

/**
 * Computes the current streak for a habit given its log dates and frequency.
 * - daily: consecutive days ending today (or yesterday if today not yet logged)
 * - weekly: consecutive weeks (Mon-start) ending this week (or last)
 */
export function computeHabitStreak(logDates, frequency = 'daily') {
  if (!logDates || logDates.length === 0) return 0;
  const dates = logDates.map((d) => new Date(d));
  return frequency === 'weekly' ? computeWeeklyStreak(dates) : computeDailyStreak(dates);
}

function computeDailyStreak(dates) {
  const set = new Set(dates.map((d) => format(startOfDay(d), 'yyyy-MM-dd')));
  let streak = 0;
  let cursor = startOfDay(new Date());
  if (!set.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1);
  }
  while (set.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

function computeWeeklyStreak(dates) {
  const weekStartsOn = 1;
  const inWeek = (c) => dates.some((d) => isSameWeek(d, c, { weekStartsOn }));
  let streak = 0;
  let cursor = startOfWeek(new Date(), { weekStartsOn });
  if (!inWeek(cursor)) {
    cursor = subWeeks(cursor, 1);
  }
  while (inWeek(cursor)) {
    streak += 1;
    cursor = subWeeks(cursor, 1);
  }
  return streak;
}

export function computeBestStreak(logDates, frequency = 'daily') {
  if (!logDates || logDates.length === 0) return 0;
  const dates = logDates.map((d) => new Date(d));
  return frequency === 'weekly' ? bestWeeklyStreak(dates) : bestDailyStreak(dates);
}

function bestDailyStreak(dates) {
  const set = [...new Set(dates.map((d) => format(startOfDay(d), 'yyyy-MM-dd')))].sort();
  let best = 0;
  let cur = 0;
  let prev = null;
  for (const ds of set) {
    if (prev && differenceInCalendarDays(parseISO(ds), parseISO(prev)) === 1) cur += 1;
    else cur = 1;
    best = Math.max(best, cur);
    prev = ds;
  }
  return best;
}

function bestWeeklyStreak(dates) {
  const set = [
    ...new Set(dates.map((d) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'))),
  ].sort();
  let best = 0;
  let cur = 0;
  let prev = null;
  for (const ds of set) {
    if (prev && differenceInCalendarDays(parseISO(ds), parseISO(prev)) === 7) cur += 1;
    else cur = 1;
    best = Math.max(best, cur);
    prev = ds;
  }
  return best;
}