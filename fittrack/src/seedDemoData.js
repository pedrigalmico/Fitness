// Seeds personalized demo data after onboarding completes.
const P = "demo_";
const key = (k) => `${P}${k}`;

function dateStr(daysAgo) {
  const d = new Date("2026-05-09");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

// Rough calorie target based on activity + goal
function calcCalories(weight, height, age, activity, goal) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const multiplier = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 }[activity] ?? 1.55;
  const tdee = Math.round(bmr * multiplier);
  const offset = { recomp: -200, cut: -400, bulk: 300, maintain: 0 }[goal] ?? -200;
  return tdee + offset;
}

function calcProtein(weight, goal) {
  const factor = { recomp: 2.0, cut: 2.2, bulk: 1.8, maintain: 1.6 }[goal] ?? 2.0;
  return Math.round(weight * factor);
}

export function seedDemoData(profile) {
  const weight = parseFloat(profile.weight) || 76;
  const height = parseFloat(profile.height) || 175;
  const age    = parseFloat(profile.age)    || 28;
  const { goal = "recomp", level = "intermediate", activity = "moderate" } = profile;

  const calories = calcCalories(weight, height, age, activity, goal);
  const protein  = calcProtein(weight, goal);

  // --- Profile ---
  localStorage.setItem(key("ft_profile"), JSON.stringify({
    ...profile,
    calTarget:     calories,
    proteinTarget: protein,
    startWeight:   weight,
    currentWeight: weight,
    updatedAt:     new Date().toISOString(),
  }));

  // --- Weight log (8 entries, simulate slow cut/bulk trend) ---
  const trend = { recomp: -0.3, cut: -0.5, bulk: 0.4, maintain: 0.05 }[goal] ?? -0.3;
  const weights = Array.from({ length: 8 }, (_, i) => ({
    date: dateStr(21 - i * 3),
    kg:   Math.round((weight + trend * (7 - i) / 7 * 2) * 10) / 10,
  }));
  weights[weights.length - 1].date = dateStr(0); // today
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

  // Scale weights based on level
  const w = { beginner: 0.7, intermediate: 1.0, advanced: 1.3 }[level] ?? 1.0;
  const past  = dateStr(7);
  const today = dateStr(0);

  const sets = {
    // Past Day A (provides progression history)
    [`${past}_a1_0`]: { reps: 12, weight: Math.round(20 * w * 2) / 2, ts },
    [`${past}_a1_1`]: { reps: 12, weight: Math.round(20 * w * 2) / 2, ts },
    [`${past}_a1_2`]: { reps: 11, weight: Math.round(20 * w * 2) / 2, ts },
    [`${past}_a1_3`]: { reps: 10, weight: Math.round(20 * w * 2) / 2, ts },

    [`${past}_a2_0`]: { reps: 10, weight: Math.round(38 * w * 2) / 2, ts },
    [`${past}_a2_1`]: { reps: 10, weight: Math.round(38 * w * 2) / 2, ts },
    [`${past}_a2_2`]: { reps: 9,  weight: Math.round(38 * w * 2) / 2, ts },
    [`${past}_a2_3`]: { reps: 8,  weight: Math.round(38 * w * 2) / 2, ts },

    [`${past}_a3_0`]: { reps: 15, weight: Math.round(7 * w * 2) / 2, ts },
    [`${past}_a3_1`]: { reps: 14, weight: Math.round(7 * w * 2) / 2, ts },
    [`${past}_a3_2`]: { reps: 13, weight: Math.round(7 * w * 2) / 2, ts },

    [`${past}_a4_0`]: { reps: 12, weight: Math.round(12 * w * 2) / 2, ts },
    [`${past}_a4_1`]: { reps: 11, weight: Math.round(12 * w * 2) / 2, ts },
    [`${past}_a4_2`]: { reps: 10, weight: Math.round(12 * w * 2) / 2, ts },

    [`${past}_a5_0`]: { reps: null, weight: null, ts },
    [`${past}_a5_1`]: { reps: null, weight: null, ts },
    [`${past}_a5_2`]: { reps: null, weight: null, ts },

    // Today — partially done
    [`${today}_a1_0`]: { reps: 12, weight: Math.round(20 * w * 2) / 2, ts },
    [`${today}_a1_1`]: { reps: 12, weight: Math.round(20 * w * 2) / 2, ts },
    [`${today}_a1_2`]: { reps: 11, weight: Math.round(20 * w * 2) / 2, ts },
    [`${today}_a1_3`]: { reps: 10, weight: Math.round(20 * w * 2) / 2, ts },

    [`${today}_a2_0`]: { reps: 10, weight: Math.round(38 * w * 2) / 2, ts },
    [`${today}_a2_1`]: { reps: 10, weight: Math.round(38 * w * 2) / 2, ts },
    [`${today}_a2_2`]: { reps: 9,  weight: Math.round(38 * w * 2) / 2, ts },
  };
  localStorage.setItem(key("ft_sets"), JSON.stringify(sets));

  // --- Diet: first 3 meals checked ---
  localStorage.setItem(key("ft_diet"), JSON.stringify({
    [today]: { m1: true, m2: true, m3: true },
  }));

  // --- Cardio ---
  localStorage.setItem(key("ft_cardio"), JSON.stringify({
    [dateStr(8)]: { cardioId: "cardio1", completed: true, duration: 35 },
    [dateStr(6)]: { cardioId: "cardio2", completed: true, duration: 20 },
    [dateStr(1)]: { cardioId: "cardio1", completed: true, duration: 40 },
  }));

  localStorage.setItem(key("ft_seeded"), "1");
}
