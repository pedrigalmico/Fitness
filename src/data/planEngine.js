import { TEMPLATES } from "./templates";

// ─── Equipment Substitutions ───
const SUBSTITUTIONS = {
  "DB Incline Press":         { requires: "bench",      fallback: "DB Floor Press" },
  "DB Bulgarian Split Squat": { requires: "bench",      fallback: "DB Reverse Lunge" },
  "Pull-up":                  { requires: "pullup_bar", fallback: "Single-Arm DB Row" },
  "Face Pull (band)":         { requires: "bands",      fallback: null },
};

function resolveExercise(ex, equipment) {
  const sub = SUBSTITUTIONS[ex.name];
  if (!sub) return ex;
  if (equipment.includes(sub.requires)) return ex;
  if (sub.fallback) return { ...ex, name: sub.fallback, note: `Substituted for ${ex.name}` };
  return null; // skip
}

// ─── TDEE Calculation (Mifflin-St Jeor for males) ───
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export function calcTDEE(stats) {
  if (!stats?.weightKg || !stats?.heightCm || !stats?.age) return null;
  const bmr = 10 * stats.weightKg + 6.25 * stats.heightCm - 5 * stats.age + 5;
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[stats.activityLevel] || 1.375));
}

// ─── Main getPlan Function ───
export function getPlan(templateId, equipment = [], stats = {}) {
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  // Resolve exercises with equipment substitutions
  const schedule = template.schedule.map((day) => ({
    ...day,
    exercises: day.exercises
      .map((ex) => resolveExercise(ex, equipment))
      .filter(Boolean),
  }));

  // Calculate nutrition
  const tdee = calcTDEE(stats);
  let nutrition;

  if (tdee) {
    const calories = stats.calorieOverride || tdee + template.calorieAdjustment;
    const protein = Math.round(stats.weightKg * template.proteinMultiplier);
    const fats = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
    nutrition = { tdee, calories, protein, carbs, fats, calculated: true };
  } else {
    // Fallback: sum from default meals
    const meals = template.defaultMeals;
    const calories = meals.reduce((s, m) => s + m.cal, 0);
    const protein = meals.reduce((s, m) => s + m.protein, 0);
    const fats = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
    nutrition = { tdee: null, calories, protein, carbs, fats, calculated: false };
  }

  return {
    template,
    schedule,
    nutrition,
    cardio: template.cardio,
    meals: template.defaultMeals,
  };
}

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
