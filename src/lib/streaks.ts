/**
 * Compute the current attendance streak (consecutive workdays with at least
 * one check-in, ending on the most recent workday). Saturday/Sunday are
 * skipped — they don't break a streak but also don't extend one.
 */
export function currentStreak(checkInISOs: string[]): number {
  if (checkInISOs.length === 0) return 0;

  const days = new Set<string>();
  for (const iso of checkInISOs) days.add(toDateKey(new Date(iso)));

  let streak = 0;
  let cursor = startOfDay(new Date());
  while (true) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const key = toDateKey(cursor);
      if (days.has(key)) streak += 1;
      else if (streak > 0 || sameDay(cursor, new Date())) break;
    }
    cursor = addDays(cursor, -1);
    if (streak === 0 && diffDays(new Date(), cursor) > 30) break;
    if (streak > 0 && diffDays(new Date(), cursor) > 365) break;
  }
  return streak;
}

export function attendancePercent(checkInISOs: string[], windowDays = 30): number {
  if (checkInISOs.length === 0) return 100;
  const today = startOfDay(new Date());
  const windowStart = addDays(today, -(windowDays - 1));
  const presentSet = new Set(checkInISOs.map((i) => toDateKey(new Date(i))));
  const firstCheckIn = checkInISOs
    .map((i) => startOfDay(new Date(i)))
    .reduce((min, d) => (d < min ? d : min));
  const start = firstCheckIn > windowStart ? firstCheckIn : windowStart;
  let workdays = 0;
  let absent = 0;
  for (let d = new Date(start); d <= today; d = addDays(d, 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    workdays += 1;
    if (!presentSet.has(toDateKey(d))) absent += 1;
  }
  if (workdays === 0) return 100;
  return Math.round(((workdays - absent) / workdays) * 100);
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}
function diffDays(a: Date, b: Date) {
  return Math.abs(Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000));
}
