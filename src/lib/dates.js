// All log keys are YYYY-MM-DD in the user's LOCAL timezone.
// toISOString() shifts to UTC, which puts evening workouts on the
// wrong date for anyone east of Greenwich — never use it for keys.
export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const todayStr = () => toDateStr(new Date());

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Sunday of the week containing today, shifted by weekOffset weeks
export function weekStart(weekOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + weekOffset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}
