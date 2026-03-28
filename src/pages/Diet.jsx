import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, AlertCircle, BookOpen } from "lucide-react";
import { useStorage } from "../hooks/useStorage";
import { getPlan } from "../data/planEngine";
import MealRow from "../components/MealRow";

const today = () => new Date().toISOString().split("T")[0];

const CHOLESTEROL_TIPS = [
  "Use olive oil instead of vegetable oil",
  "Eat fatty fish (salmon, tuna, sardines) 3x/week",
  "Use low-fat Greek yogurt and labneh",
  "Limit red meat to 2-3x/week — rotate with chicken and fish",
  "Add oats at breakfast — beta-glucan fiber lowers LDL",
  "Add garlic to meals — natural LDL reducer",
  "No fried food — grill, bake, or air-fry only",
];

const DAILY_RULES = [
  "Hit your daily protein target",
  "Drink 2.5-3L of water",
  "Sleep 7-8 hours for muscle recovery",
  "No pork — stick to chicken, beef, fish, eggs",
  "Weigh yourself weekly, same time each day",
];

export default function Diet() {
  const [templateId] = useStorage("ft_template", "recomp");
  const [equipment] = useStorage("ft_equipment", []);
  const [stats] = useStorage("ft_stats", {});
  const [diet, setDiet] = useStorage("ft_diet", {});
  const [tipsOpen, setTipsOpen] = useState(false);

  const plan = useMemo(() => getPlan(templateId, equipment, stats), [templateId, equipment, stats]);
  const { nutrition, meals } = plan;

  const todayStr = today();
  const todayDiet = diet[todayStr] || {};
  const mealsChecked = meals.filter((m) => todayDiet[m.id]).length;
  const progress = meals.length > 0 ? mealsChecked / meals.length : 0;

  const toggleMeal = (mealId) => {
    setDiet((prev) => ({
      ...prev,
      [todayStr]: {
        ...prev[todayStr],
        [mealId]: !prev[todayStr]?.[mealId],
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white font-heading uppercase tracking-wide">Diet</h1>
        <p className="text-xs" style={{ color: "#555" }}>
          {plan.template.emoji} {plan.template.label}
          {nutrition.calculated && nutrition.tdee && (
            <span> | TDEE: {nutrition.tdee} kcal</span>
          )}
        </p>
      </div>

      {/* Macro Targets */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {[
          { label: "Calories", value: nutrition.calories, unit: "kcal", color: "#FF6B35" },
          { label: "Protein", value: nutrition.protein, unit: "g", color: "#4ECDC4" },
          { label: "Carbs", value: nutrition.carbs, unit: "g", color: "#A855F7" },
          { label: "Fats", value: nutrition.fats, unit: "g", color: "#F59E0B" },
        ].map((m) => (
          <div
            key={m.label}
            className="flex-1 rounded-xl p-2.5 text-center"
            style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
          >
            <p className="text-lg font-black text-white leading-tight">{m.value}</p>
            <p className="text-[10px] font-bold" style={{ color: m.color }}>
              {m.unit} {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold" style={{ color: "#555" }}>Daily Progress</span>
          <span className="text-xs font-black text-white">{mealsChecked}/{meals.length} meals</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1A1A2E" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${plan.template.color}, ${plan.template.color}cc)` }}
          />
        </div>
      </div>

      {/* Meal Checklist */}
      <div className="space-y-2">
        {meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            checked={!!todayDiet[meal.id]}
            onToggle={() => toggleMeal(meal.id)}
          />
        ))}
      </div>

      {/* Cholesterol Tips */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
        <button
          onClick={() => setTipsOpen(!tipsOpen)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} style={{ color: "#ef4444" }} />
            <span className="text-sm font-heading font-bold text-white uppercase">Cholesterol Tips</span>
          </div>
          {tipsOpen ? <ChevronUp size={16} style={{ color: "#555" }} /> : <ChevronDown size={16} style={{ color: "#555" }} />}
        </button>
        {tipsOpen && (
          <div className="px-4 pb-4 space-y-2">
            {CHOLESTEROL_TIPS.map((tip, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-xs" style={{ color: "#555" }}>&#8226;</span>
                <p className="text-xs" style={{ color: "#E8E8F0" }}>{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Rules */}
      <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} style={{ color: "#F59E0B" }} />
          <span className="text-sm font-heading font-bold text-white uppercase">Daily Rules</span>
        </div>
        <div className="space-y-2">
          {DAILY_RULES.map((rule, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs" style={{ color: "#22C55E" }}>&#10003;</span>
              <p className="text-xs font-medium" style={{ color: "#E8E8F0" }}>{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
