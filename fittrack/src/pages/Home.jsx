import { useContext } from "react";
import { Flame, Trophy, Calendar, Scale, LogOut } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { AuthContext } from "../AuthContext";
import { useStorage } from "../hooks/useStorage";
import { DIET_PLAN } from "../data/diet";
import Ring from "../components/Ring";
import StatCard from "../components/StatCard";
import WorkoutCalendar from "../components/WorkoutCalendar";

const today = () => new Date().toISOString().split("T")[0];

const calcStreak = (logs) => {
  const dates = Object.keys(logs)
    .filter((d) => logs[d]?.completed)
    .sort()
    .reverse();
  if (!dates.length) return 0;
  let count = 0;
  let cursor = new Date();
  for (const d of dates) {
    const diff = Math.round((cursor - new Date(d)) / 86400000);
    if (diff <= 1) { count++; cursor = new Date(d); }
    else break;
  }
  return count;
};

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const [logs] = useStorage("ft_logs", {});
  const [diet] = useStorage("ft_diet", {});
  const [weightLog, setWeightLog] = useStorage("ft_weight", []);
  const [cardioLogs] = useStorage("ft_cardio", {});

  const streak = calcStreak(logs);
  const totalSessions = Object.values(logs).filter((l) => l?.completed).length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const thisWeek = Object.keys(logs).filter((d) => {
    const date = new Date(d);
    return date >= weekStart && logs[d]?.completed;
  }).length;

  const todayDiet = diet[today()] || {};
  const mealsChecked = DIET_PLAN.meals.filter((m) => todayDiet[m.id]).length;
  const mealProgress = DIET_PLAN.meals.length > 0 ? mealsChecked / DIET_PLAN.meals.length : 0;

  const todayCompleted = logs[today()]?.completed;

  const handleLogWeight = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const kg = parseFloat(form.get("kg"));
    if (!kg || kg < 20 || kg > 300) return;
    setWeightLog((prev) => {
      const filtered = prev.filter((w) => w.date !== today());
      return [...filtered, { date: today(), kg }].sort((a, b) => a.date.localeCompare(b.date));
    });
    e.target.reset();
  };

  const chartData = weightLog.slice(-14);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Hey, {user?.username}</h1>
          <p className="text-xs" style={{ color: "#555" }}>Let's crush it today</p>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-xl"
          style={{ background: "#1A1A2E" }}
          title="Sign out"
        >
          <LogOut size={18} style={{ color: "#555" }} />
        </button>
      </div>

      <div className="flex gap-3">
        <StatCard icon={<Flame size={16} />} label="Streak" value={`${streak}d`} color="#FF6B35" />
        <StatCard icon={<Trophy size={16} />} label="Total" value={totalSessions} color="#4ECDC4" />
        <StatCard icon={<Calendar size={16} />} label="Week" value={`${thisWeek}/4`} color="#A855F7" />
      </div>

      <div className="flex gap-3">
        <div
          className="rounded-2xl p-4 flex items-center gap-4 flex-1"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          <Ring progress={mealProgress} size={64} stroke={5} color="#F59E0B">
            <span className="text-xs font-black text-white">{mealsChecked}/{DIET_PLAN.meals.length}</span>
          </Ring>
          <div>
            <p className="text-xs font-bold uppercase" style={{ color: "#555" }}>Diet Today</p>
            <p className="text-sm font-black text-white">{Math.round(mealProgress * 100)}% done</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-center justify-center flex-1"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          {todayCompleted ? (
            <div className="text-center">
              <div className="text-2xl mb-1">&#10003;</div>
              <p className="text-xs font-bold" style={{ color: "#22C55E" }}>Workout Done</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-1" style={{ color: "#555" }}>&#9744;</div>
              <p className="text-xs font-bold" style={{ color: "#555" }}>No workout yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Weight Logger */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} style={{ color: "#4ECDC4" }} />
          <p className="text-xs font-bold uppercase" style={{ color: "#555" }}>Weight Log</p>
        </div>

        <form onSubmit={handleLogWeight} className="flex gap-2 mb-3">
          <input
            name="kg"
            type="number"
            step="0.1"
            placeholder="kg"
            className="flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none"
            style={{ background: "#0A0A12", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-black text-white"
            style={{ background: "#4ECDC4" }}
          >
            Log
          </button>
        </form>

        {chartData.length > 1 && (
          <div className="h-24 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                <Tooltip
                  contentStyle={{ background: "#0F0F1E", border: "1px solid #1A1A2E", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "#555" }}
                  itemStyle={{ color: "#4ECDC4" }}
                />
                <Line type="monotone" dataKey="kg" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 3, fill: "#4ECDC4" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-1.5">
          {weightLog.slice(-7).reverse().map((w) => (
            <div key={w.date} className="flex justify-between text-xs">
              <span style={{ color: "#555" }}>{w.date}</span>
              <span className="font-bold text-white">{w.kg} kg</span>
            </div>
          ))}
          {weightLog.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: "#555" }}>No entries yet</p>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} style={{ color: "#A855F7" }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#555" }}>Training Calendar</p>
        </div>
        <WorkoutCalendar logs={logs} cardioLogs={cardioLogs} />
      </div>
    </div>
  );
}
