import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DotCalendar({ logs = {}, diet = {}, mealCount = 5 }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const firstDay = new Date(month.year, month.month, 1).getDay();
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const monthLabel = new Date(month.year, month.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prev = () =>
    setMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }));
  const next = () =>
    setMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }));

  const getDateStr = (day) => {
    const d = new Date(month.year, month.month, day);
    return d.toISOString().split("T")[0];
  };

  const getActivity = (day) => {
    const dateStr = getDateStr(day);
    const hasWorkout = logs[dateStr]?.completed;
    const dietDay = diet[dateStr] || {};
    const mealsChecked = Object.values(dietDay).filter(Boolean).length;
    const dietProgress = mealCount > 0 ? mealsChecked / mealCount : 0;

    if (hasWorkout && dietProgress >= 0.8) return 1;
    if (hasWorkout || dietProgress >= 0.6) return 0.75;
    if (dietProgress > 0) return 0.4;
    return 0;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronLeft size={18} style={{ color: "#555" }} />
        </button>
        <h3 className="text-sm sm:text-base font-black text-white">{monthLabel}</h3>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronRight size={18} style={{ color: "#555" }} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] sm:text-xs font-bold" style={{ color: "#555" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Dots grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="flex justify-center py-1" />;
          }
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;
          const activity = getActivity(day);
          const isFuture = new Date(dateStr) > today;

          let dotColor = "#1A1A2E";
          if (!isFuture) {
            if (activity >= 0.75) dotColor = "#F59E0B";
            else if (activity >= 0.4) dotColor = "#92700a";
            else if (activity > 0) dotColor = "#5a4508";
            else dotColor = "#2A2A3E";
          }

          return (
            <div key={day} className="flex justify-center py-1">
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-colors"
                style={{
                  background: dotColor,
                  boxShadow: isToday ? "0 0 0 2px #FF6B35" : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 pt-3" style={{ borderTop: "1px solid #1A1A2E" }}>
        {[
          { color: "#2A2A3E", label: "None" },
          { color: "#5a4508", label: "Some" },
          { color: "#92700a", label: "Good" },
          { color: "#F59E0B", label: "Full" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] font-bold" style={{ color: "#555" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
