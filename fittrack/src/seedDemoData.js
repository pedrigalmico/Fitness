// Seeds realistic demo data on first load. Runs once — skipped if data already exists.
const P = "demo_";
const key = (k) => `${P}${k}`;

function dateStr(daysAgo) {
  const d = new Date("2026-05-09");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export function seedDemoData() {
  if (localStorage.getItem(key("ft_seeded"))) return;

  // --- Weight log (last 3 weeks, gradual cut) ---
  const weights = [
    { date: dateStr(21), kg: 78.4 },
    { date: dateStr(18), kg: 78.1 },
    { date: dateStr(15), kg: 77.8 },
    { date: dateStr(12), kg: 77.5 },
    { date: dateStr(9),  kg: 77.2 },
    { date: dateStr(6),  kg: 76.9 },
    { date: dateStr(3),  kg: 76.7 },
    { date: dateStr(0),  kg: 76.5 },
  ];
  localStorage.setItem(key("ft_weight"), JSON.stringify(weights));

  // --- Workout logs ---
  const logs = {
    [dateStr(14)]: { day: "A", completed: true,  ts: Date.now() },
    [dateStr(12)]: { day: "B", completed: true,  ts: Date.now() },
    [dateStr(10)]: { day: "C", completed: true,  ts: Date.now() },
    [dateStr(9)]:  { day: "D", completed: true,  ts: Date.now() },
    [dateStr(7)]:  { day: "A", completed: true,  ts: Date.now() },
    [dateStr(5)]:  { day: "B", completed: true,  ts: Date.now() },
    [dateStr(3)]:  { day: "C", completed: true,  ts: Date.now() },
    [dateStr(2)]:  { day: "D", completed: true,  ts: Date.now() },
    [dateStr(0)]:  { day: "A", completed: false, ts: Date.now() },
  };
  localStorage.setItem(key("ft_logs"), JSON.stringify(logs));

  const ts = Date.now();

  // --- Sets: past Day A session (7 days ago) so progression has history ---
  const past = dateStr(7);
  const today = dateStr(0);

  const sets = {
    // Past Day A — all sets complete with weight+reps+ts
    [`${past}_a1_0`]: { reps: 12, weight: 22.5, ts },
    [`${past}_a1_1`]: { reps: 12, weight: 22.5, ts },
    [`${past}_a1_2`]: { reps: 11, weight: 22.5, ts },
    [`${past}_a1_3`]: { reps: 10, weight: 22.5, ts },

    [`${past}_a2_0`]: { reps: 10, weight: 40, ts },
    [`${past}_a2_1`]: { reps: 10, weight: 40, ts },
    [`${past}_a2_2`]: { reps: 9,  weight: 40, ts },
    [`${past}_a2_3`]: { reps: 8,  weight: 40, ts },

    [`${past}_a3_0`]: { reps: 15, weight: 8, ts },
    [`${past}_a3_1`]: { reps: 14, weight: 8, ts },
    [`${past}_a3_2`]: { reps: 13, weight: 8, ts },

    [`${past}_a4_0`]: { reps: 12, weight: 14, ts },
    [`${past}_a4_1`]: { reps: 11, weight: 14, ts },
    [`${past}_a4_2`]: { reps: 10, weight: 14, ts },

    [`${past}_a5_0`]: { reps: null, weight: null, ts },
    [`${past}_a5_1`]: { reps: null, weight: null, ts },
    [`${past}_a5_2`]: { reps: null, weight: null, ts },

    // Today Day A — partially done (2 exercises in, sets have ts)
    [`${today}_a1_0`]: { reps: 12, weight: 22.5, ts },
    [`${today}_a1_1`]: { reps: 12, weight: 22.5, ts },
    [`${today}_a1_2`]: { reps: 11, weight: 22.5, ts },
    [`${today}_a1_3`]: { reps: 10, weight: 22.5, ts },

    [`${today}_a2_0`]: { reps: 10, weight: 40, ts },
    [`${today}_a2_1`]: { reps: 10, weight: 40, ts },
    [`${today}_a2_2`]: { reps: 9,  weight: 40, ts },
  };
  localStorage.setItem(key("ft_sets"), JSON.stringify(sets));

  // --- Diet: today's meals, first 3 checked ---
  const diet = {
    [today]: { m1: true, m2: true, m3: true },
  };
  localStorage.setItem(key("ft_diet"), JSON.stringify(diet));

  // --- Cardio logs ---
  const cardio = {
    [dateStr(8)]: { cardioId: "cardio1", completed: true, duration: 35 },
    [dateStr(6)]: { cardioId: "cardio2", completed: true, duration: 20 },
    [dateStr(1)]: { cardioId: "cardio1", completed: true, duration: 40 },
  };
  localStorage.setItem(key("ft_cardio"), JSON.stringify(cardio));

  localStorage.setItem(key("ft_seeded"), "1");
}
