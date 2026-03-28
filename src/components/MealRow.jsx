import { Check } from "lucide-react";

export default function MealRow({ meal, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-colors"
      style={{
        background: checked ? "rgba(34,197,94,0.08)" : "#0F0F1E",
        border: `1px solid ${checked ? "rgba(34,197,94,0.3)" : "#1A1A2E"}`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{
          background: checked ? "#22C55E" : "#1A1A2E",
          border: checked ? "none" : "1px solid #2A2A3E",
        }}
      >
        {checked && <Check size={14} color="#fff" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>
            {meal.time}
          </span>
        </div>
        <p
          className="text-sm font-bold leading-tight"
          style={{
            color: checked ? "#555" : "#E8E8F0",
            textDecoration: checked ? "line-through" : "none",
          }}
        >
          {meal.food}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-black text-white">{meal.cal} kcal</p>
        <p className="text-xs font-bold" style={{ color: "#4ECDC4" }}>
          {meal.protein}g protein
        </p>
      </div>
    </button>
  );
}
