import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, BookOpen } from "lucide-react";
import { DIET_PLAN } from "../data/diet";
import { useStorage } from "../hooks/useStorage";
import MealRow from "../components/MealRow";

const today = () => new Date().toISOString().split("T")[0];

export default function Diet() {
  const [diet, setDiet] = useStorage("ft_diet", {});
  const [tipsOpen, setTipsOpen] = useState(false);

  const todayStr = today();
  const todayDiet = diet[todayStr] || {};
  const mealsChecked = DIET_PLAN.meals.filter((m) => todayDiet[m.id]).length;
  const progress = DIET_PLAN.meals.length > 0 ? mealsChecked / DIET_PLAN.meals.length : 0;

  const toggleMeal = (mealId) => {
    setDiet((prev) => ({
      ...prev,
      [todayStr]: {
        ...prev[todayStr],
        [mealId]: !prev[todayStr]?.[mealId],
      },
    }));
  };

  const { targets } = DIET_PLAN;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">Diet</h1>

      {/* Macro Targets */}
      <div className="flex gap-2">
        {[
          { label: "Calories", value: targets.calories, unit: "kcal", color: "#FF6B35" },
          { label: "Protein", value: targets.protein, unit: "g", color: "#4ECDC4" },
          { label: "Carbs", value: targets.carbs, unit: "g", color: "#A855F7" },
          { label: "Fats", value: targets.fats, unit: "g", color: "#F59E0B" },
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
      <div
        className="rounded-2xl p-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold" style={{ color: "#555" }}>Daily Progress</span>
          <span className="text-xs font-black text-white">{mealsChecked}/{DIET_PLAN.meals.length} meals</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1A1A2E" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, #FF6B35, #F59E0B)" }}
          />
        </div>
      </div>

      {/* Meal Checklist */}
      <div className="space-y-2">
        {DIET_PLAN.meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            checked={!!todayDiet[meal.id]}
            onToggle={() => toggleMeal(meal.id)}
          />
        ))}
      </div>

      {/* Cholesterol Tips */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <button
          onClick={() => setTipsOpen(!tipsOpen)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} style={{ color: "#ef4444" }} />
            <span className="text-sm font-black text-white">Cholesterol Tips</span>
          </div>
          {tipsOpen ? (
            <ChevronUp size={16} style={{ color: "#555" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "#555" }} />
          )}
        </button>
        {tipsOpen && (
          <div className="px-4 pb-4 space-y-2">
            {DIET_PLAN.cholesterolTips.map((tip, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-xs" style={{ color: "#555" }}>&#8226;</span>
                <p className="text-xs" style={{ color: "#E8E8F0" }}>{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Rules */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} style={{ color: "#F59E0B" }} />
          <span className="text-sm font-black text-white">Daily Rules</span>
        </div>
        <div className="space-y-2">
          {DIET_PLAN.dailyRules.map((rule, i) => (
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
