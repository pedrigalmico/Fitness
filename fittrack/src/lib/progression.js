// Pure helpers for progressive-overload logic.
// setLog shape: { ["YYYY-MM-DD_exId_setIdx"]: { weight: number|null, reps: number|null, ts: number } }

export function getSetEntry(setLog, date, exId, setIdx) {
  return setLog?.[`${date}_${exId}_${setIdx}`] || null;
}

export function isSetDone(entry) {
  if (!entry) return false;
  // A set is "done" if user committed it (ts present). Weight/reps may be null for bodyweight.
  return Boolean(entry.ts);
}

// Find the most recent date (before `today`) where this exercise has any logged set.
export function findLastSessionDate(setLog, exId, today) {
  if (!setLog) return null;
  const dates = new Set();
  for (const key of Object.keys(setLog)) {
    const [date, ...rest] = key.split("_");
    const id = rest.slice(0, -1).join("_");
    if (id === exId && date < today) dates.add(date);
  }
  if (!dates.size) return null;
  return [...dates].sort().reverse()[0];
}

export function getLastSession(setLog, exercise, today) {
  const lastDate = findLastSessionDate(setLog, exercise.id, today);
  if (!lastDate) return null;
  const entries = [];
  for (let i = 0; i < exercise.sets; i++) {
    const e = getSetEntry(setLog, lastDate, exercise.id, i);
    if (e) entries.push(e);
  }
  if (!entries.length) return null;
  return { date: lastDate, entries };
}

// Double-progression suggestion. Returns { type, weight, reps, message } or null.
//   - "bump"   → user hit top of rep range on every set last time → +increment
//   - "push"   → kept weight, did not hit top → push for one more rep
//   - "first"  → no prior data, pre-fill nothing
export function getProgressionSuggestion(exercise, lastSession) {
  if (exercise.repTarget == null) return null; // time-based holds — no auto progression

  if (!lastSession || lastSession.entries.length === 0) {
    return { type: "first", weight: null, reps: exercise.repTarget, message: "First time logging — start light, find your working weight." };
  }

  const sameWeight = lastSession.entries.every(
    (e, _, arr) => e.weight != null && e.weight === arr[0].weight
  );
  const lastWeight = sameWeight ? lastSession.entries[0].weight : null;
  const allHitTop = lastSession.entries.length === exercise.sets &&
    lastSession.entries.every((e) => e.reps != null && e.reps >= exercise.repTarget);

  if (allHitTop && lastWeight != null && exercise.progression) {
    const next = +(lastWeight + exercise.progression).toFixed(2);
    return {
      type: "bump",
      weight: next,
      reps: Math.max(exercise.repTarget - 4, 6), // drop ~4 reps to start the new range
      message: `Hit ${exercise.repTarget} on every set last time — bump to ${next}kg today.`,
    };
  }

  // bodyweight or no weight tracked: push reps
  if (allHitTop && (!lastWeight || !exercise.progression)) {
    return {
      type: "push",
      weight: lastWeight,
      reps: exercise.repTarget + 1,
      message: `Crushed it — try +1 rep on every set today.`,
    };
  }

  return {
    type: "push",
    weight: lastWeight,
    reps: exercise.repTarget,
    message: lastWeight != null
      ? `Last: ${lastWeight}kg. Push for ${exercise.repTarget} on every set.`
      : `Last: ${lastSession.entries.map(e => e.reps).join(", ")} reps. Push for ${exercise.repTarget}.`,
  };
}

export function formatLastSession(lastSession) {
  if (!lastSession) return null;
  const { entries } = lastSession;
  const sameWeight = entries.every((e, _, arr) => e.weight != null && e.weight === arr[0].weight);
  const reps = entries.map((e) => e.reps ?? "—").join(",");
  if (sameWeight) return `${entries[0].weight}kg × ${reps}`;
  return entries.map((e) => `${e.weight ?? "—"}×${e.reps ?? "—"}`).join(" / ");
}
