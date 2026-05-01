import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WORKOUT_PLAN, CARDIO_PLAN } from "../data/workouts";

const DAY_COLORS = { A: "#FF6B35", B: "#4ECDC4", C: "#A855F7", D: "#F59E0B" };
const CARDIO_COLOR = "#ef4444";

// Map weekday name → scheduled workout day label for the current plan
const WEEKDAY_SCHEDULE = {};
Object.entries(WORKOUT_PLAN).forEach(([key, plan]) => {
  WEEKDAY_SCHEDULE[plan.day] = { key, color: plan.color, label: plan.label.split("—")[1]?.trim() ?? key };
});
CARDIO_PLAN.forEach((c) => {
  WEEKDAY_SCHEDULE[c.day] = { key: null, color: CARDIO_COLOR, label: c.type, isCardio: true, cardio: c };
});

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WorkoutCalendar({ logs = {}, cardioLogs = {} }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const todayStr = now.toISOString().split("T")[0];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = (d) => `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#1A1A2E" }}
        >
          <ChevronLeft size={16} style={{ color: "#aaa" }} />
        </button>
        <span className="text-sm font-black text-white">
          {new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#1A1A2E" }}
        >
          <ChevronRight size={16} style={{ color: "#aaa" }} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-bold uppercase tracking-wide" style={{ color: "#555" }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const ds = dateStr(day);
          const isToday = ds === todayStr;
          const isFuture = ds > todayStr;
          const dow = (firstDow + day - 1) % 7;
          const dayName = FULL_DAYS[dow];
          const scheduled = WEEKDAY_SCHEDULE[dayName];

          const logEntry = logs[ds];
          const workoutDone = logEntry?.completed;
          const cardioDone = cardioLogs[ds]?.completed;

          // Colors for this cell
          const workoutColor = workoutDone
            ? DAY_COLORS[logEntry.day] ?? "#22C55E"
            : null;
          const scheduledColor = scheduled && !isFuture ? scheduled.color : null;

          return (
            <div key={ds} className="flex flex-col items-center py-0.5">
              <div
                className="w-8 h-8 rounded-xl flex flex-col items-center justify-center relative"
                style={{
                  background: isToday
                    ? "rgba(255,107,53,0.2)"
                    : workoutDone
                      ? `${workoutColor}20`
                      : "transparent",
                  border: isToday ? "1px solid #FF6B35" : "1px solid transparent",
                }}
              >
                <span
                  className="text-[11px] font-black leading-none"
                  style={{
                    color: isToday
                      ? "#FF6B35"
                      : workoutDone
                        ? workoutColor
                        : isFuture
                          ? "#333"
                          : "#777",
                  }}
                >
                  {day}
                </span>

                {/* Dot indicators */}
                <div className="flex gap-0.5 mt-0.5">
                  {workoutDone && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: workoutColor }}
                    />
                  )}
                  {cardioDone && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: CARDIO_COLOR }}
                    />
                  )}
                  {/* Scheduled but not done — tiny outline dot */}
                  {!workoutDone && !cardioDone && scheduled && !isFuture && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ border: `1px solid ${scheduled.color}`, background: "transparent" }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3" style={{ borderTop: "1px solid #1A1A2E" }}>
        {Object.entries(DAY_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px] font-bold" style={{ color: "#555" }}>
              {WORKOUT_PLAN[key]?.label.split("—")[1]?.trim()}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: CARDIO_COLOR }} />
          <span className="text-[10px] font-bold" style={{ color: "#555" }}>Cardio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border" style={{ borderColor: "#555", background: "transparent" }} />
          <span className="text-[10px] font-bold" style={{ color: "#555" }}>Scheduled</span>
        </div>
      </div>
    </div>
  );
}
