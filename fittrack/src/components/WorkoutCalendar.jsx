import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ACTIVE_COLOR = "#F59E0B";

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
          const didWorkout = logs[ds]?.completed;
          const didCardio = cardioLogs[ds]?.completed;
          const active = didWorkout || didCardio;

          return (
            <div key={ds} className="flex flex-col items-center py-0.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: active ? `${ACTIVE_COLOR}25` : "transparent",
                  border: isToday
                    ? `1.5px solid ${ACTIVE_COLOR}`
                    : "1.5px solid transparent",
                }}
              >
                <span
                  className="text-[11px] font-black leading-none"
                  style={{
                    color: isToday
                      ? ACTIVE_COLOR
                      : active
                        ? ACTIVE_COLOR
                        : isFuture
                          ? "#333"
                          : "#555",
                  }}
                >
                  {day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
