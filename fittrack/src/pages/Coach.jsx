import { useMemo, useState } from "react";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Zap, Scale, Calendar, ChevronRight, Copy, Download, FileText } from "lucide-react";
import { useStorage } from "../hooks/useStorage";
import { WORKOUT_PLAN, CARDIO_PLAN } from "../data/workouts";
import { DIET_PLAN } from "../data/diet";
import { getLastSession, getProgressionSuggestion, formatLastSession, findLastSessionDate } from "../lib/progression";

const today = () => new Date().toISOString().split("T")[0];
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// How many distinct sessions has this exercise been logged?
function countSessions(setLog, exId) {
  const dates = new Set();
  for (const key of Object.keys(setLog || {})) {
    const parts = key.split("_");
    const id = parts.slice(1, -1).join("_");
    if (id === exId) dates.add(parts[0]);
  }
  return dates.size;
}

// Get all logged sessions for an exercise in order
function getAllSessions(setLog, exercise) {
  const dateSet = new Set();
  for (const key of Object.keys(setLog || {})) {
    const parts = key.split("_");
    const id = parts.slice(1, -1).join("_");
    if (id === exercise.id) dateSet.add(parts[0]);
  }
  return [...dateSet].sort().map((date) => {
    const entries = [];
    for (let i = 0; i < exercise.sets; i++) {
      const e = setLog[`${date}_${exercise.id}_${i}`];
      if (e) entries.push(e);
    }
    return { date, entries };
  });
}

// Detect plateau: same weight on every set for 3+ consecutive sessions
function detectPlateau(sessions, repTarget) {
  if (sessions.length < 3) return false;
  const last3 = sessions.slice(-3);
  return last3.every((s) => {
    const w = s.entries[0]?.weight;
    return w != null && w === last3[0].entries[0]?.weight &&
      s.entries.every((e) => e.reps != null && e.reps < (repTarget ?? 999));
  });
}

// Get best set ever (max weight × reps volume)
function getPR(sessions) {
  let best = null;
  for (const s of sessions) {
    for (const e of s.entries) {
      if (e.weight == null) continue;
      if (!best || e.weight > best.weight || (e.weight === best.weight && (e.reps ?? 0) > (best.reps ?? 0))) {
        best = { ...e, date: s.date };
      }
    }
  }
  return best;
}

// Weeks since start of current mesocycle (we use profile.startDate or first log)
function getMesocycleWeek(startDate) {
  if (!startDate) return null;
  const days = daysBetween(startDate, today());
  return Math.floor(days / 7) + 1;
}

const GOAL_STRATEGY = {
  recomp:   { label: "Body Recomp",  color: "#FF6B35", advice: "Prioritise hitting reps over weight. Keep protein high. Progress weight only when reps feel easy." },
  cut:      { label: "Cut",          color: "#4ECDC4", advice: "Maintain strength — don't push new weight PRs. Hit reps, keep intensity up, manage fatigue." },
  bulk:     { label: "Lean Bulk",    color: "#A855F7", advice: "Push weight aggressively. Bump when you hit the top of your rep range — don't wait." },
  maintain: { label: "Maintain",     color: "#F59E0B", advice: "Keep weights stable. Focus on consistency and form, not load progression." },
};

function SectionHeader({ icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span style={{ color }}>{icon}</span>
      <h2 className="text-sm font-black text-white">{label}</h2>
    </div>
  );
}

function InsightCard({ icon, title, body, color, badge }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#0F0F1E", border: `1px solid ${color}33` }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-sm font-black text-white">{title}</span>
        </div>
        {badge && (
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0"
            style={{ background: `${color}20`, color }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{body}</p>
    </div>
  );
}

function ExerciseRow({ exercise, sessions, suggestion, plateau, pr, dayColor, sessionCount }) {
  const lastSummary = sessions.length ? formatLastSession(sessions[sessions.length - 1]) : null;
  const status = plateau ? "plateau" : suggestion?.type === "bump" ? "bump" : suggestion?.type === "push" ? "push" : "new";

  const statusConfig = {
    plateau: { color: "#F59E0B", icon: <AlertTriangle size={12} />, label: "PLATEAU" },
    bump:    { color: "#22C55E", icon: <TrendingUp size={12} />,    label: "BUMP WEIGHT" },
    push:    { color: "#4ECDC4", icon: <ChevronRight size={12} />,  label: "PUSH REPS" },
    new:     { color: "#555",    icon: null,                         label: "NO DATA" },
  }[status];

  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "#0A0A12", border: "1px solid #1A1A2E" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs font-black text-white leading-tight">{exercise.name}</p>
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0"
          style={{ background: `${statusConfig.color}20`, color: statusConfig.color }}
        >
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <p className="text-[10px]" style={{ color: "#555" }}>{sessionCount} session{sessionCount !== 1 ? "s" : ""} logged</p>
        {lastSummary && <p className="text-[10px] font-bold" style={{ color: "#777" }}>Last: {lastSummary}</p>}
        {pr && <p className="text-[10px] font-bold" style={{ color: dayColor }}>PR: {pr.weight}kg × {pr.reps}</p>}
      </div>
      {suggestion?.message && status !== "new" && (
        <p className="text-[10px] mt-1.5 font-bold" style={{ color: statusConfig.color }}>
          → {suggestion.message}
        </p>
      )}
    </div>
  );
}

function buildTextSummary({ profile, logs, setLog, weightLog, dietLog, cardioLog }) {
  const lines = [];
  const todayStr = new Date().toISOString().split("T")[0];

  lines.push(`=== FitTrack Export — ${todayStr} ===\n`);

  // Profile
  const goal = profile.goal ?? "recomp";
  const mesoWeek = profile.startDate
    ? Math.floor((new Date(todayStr) - new Date(profile.startDate)) / (86400000 * 7)) + 1
    : null;
  lines.push(`PROFILE`);
  lines.push(`Goal: ${goal} | Weekly target: ${profile.weeklyTarget ?? 4} sessions${mesoWeek ? ` | Mesocycle week: ${mesoWeek}` : ""}\n`);

  // Weight
  if (weightLog.length) {
    lines.push(`WEIGHT LOG (${weightLog.length} entries)`);
    weightLog.slice(-14).forEach((w) => lines.push(`  ${w.date}: ${w.kg} kg`));
    const delta = weightLog.length >= 2
      ? +(weightLog[weightLog.length - 1].kg - weightLog[0].kg).toFixed(1)
      : null;
    if (delta != null) lines.push(`  Total change: ${delta > 0 ? "+" : ""}${delta} kg`);
    lines.push("");
  }

  // Workout history
  const completedSessions = Object.entries(logs)
    .filter(([, v]) => v?.completed)
    .sort(([a], [b]) => a.localeCompare(b));
  lines.push(`WORKOUT HISTORY (${completedSessions.length} total sessions)`);
  completedSessions.slice(-20).forEach(([date, v]) => {
    lines.push(`  ${date}: Day ${v.day}`);
  });
  lines.push("");

  // Exercise log
  lines.push(`EXERCISE LOG`);
  for (const [, day] of Object.entries(WORKOUT_PLAN)) {
    for (const ex of day.exercises) {
      if (ex.repTarget == null) continue;
      const sessionDates = new Set();
      for (const key of Object.keys(setLog)) {
        const parts = key.split("_");
        const id = parts.slice(1, -1).join("_");
        if (id === ex.id) sessionDates.add(parts[0]);
      }
      if (!sessionDates.size) continue;
      const sessions = [...sessionDates].sort().map((date) => {
        const entries = [];
        for (let i = 0; i < ex.sets; i++) {
          const e = setLog[`${date}_${ex.id}_${i}`];
          if (e) entries.push(e);
        }
        return { date, entries };
      });
      const last = sessions[sessions.length - 1];
      const lastStr = last.entries
        .filter((e) => e.weight != null || e.reps != null)
        .map((e) => `${e.weight ?? "BW"}kg×${e.reps}`)
        .join(", ");
      lines.push(`  ${ex.name} (${day.label.split("—")[1]?.trim()}): ${sessions.length} sessions | Last (${last.date}): ${lastStr || "logged"}`);
    }
  }
  lines.push("");

  // Diet adherence (last 14 days)
  const dietDates = Object.keys(dietLog).sort().slice(-14);
  if (dietDates.length) {
    lines.push(`DIET LOG (last ${dietDates.length} days)`);
    dietDates.forEach((date) => {
      const checked = Object.values(dietLog[date] || {}).filter(Boolean).length;
      const total = DIET_PLAN.meals.length;
      lines.push(`  ${date}: ${checked}/${total} meals`);
    });
    lines.push("");
  }

  // Cardio
  const cardioDates = Object.keys(cardioLog).sort().slice(-20);
  if (cardioDates.length) {
    lines.push(`CARDIO LOG`);
    cardioDates.forEach((key) => {
      const entry = cardioLog[key];
      if (entry?.completed) {
        const c = CARDIO_PLAN.find((x) => x.id === entry.cardioId);
        lines.push(`  ${key.split("_")[0]}: ${c ? `${c.day} ${c.type}` : entry.cardioId}`);
      }
    });
    lines.push("");
  }

  lines.push(`---`);
  lines.push(`Please analyse my training data above. Tell me:`);
  lines.push(`1. How am I progressing overall for body recomposition?`);
  lines.push(`2. Which exercises need attention (plateaus, weak links)?`);
  lines.push(`3. Is my weight trend on track?`);
  lines.push(`4. What should I prioritise this week?`);

  return lines.join("\n");
}

export default function Coach() {
  const [setLog] = useStorage("ft_set_log", {});
  const [logs] = useStorage("ft_logs", {});
  const [weightLog] = useStorage("ft_weight", []);
  const [profile] = useStorage("ft_profile", {});
  const [dietLog] = useStorage("ft_diet", {});
  const [cardioLog] = useStorage("ft_cardio", {});
  const [copied, setCopied] = useState(false);

  const todayStr = today();
  const totalSessions = Object.values(logs).filter((l) => l?.completed).length;
  const goalStrategy = GOAL_STRATEGY[profile.goal] || GOAL_STRATEGY.recomp;
  const mesoWeek = getMesocycleWeek(profile.startDate);
  const needsDeload = mesoWeek != null && mesoWeek % 4 === 0;

  // Weight trend over last 4 weeks
  const recentWeights = weightLog.slice(-8);
  const weightTrend = recentWeights.length >= 2
    ? +(recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg).toFixed(1)
    : null;

  // Per-exercise analysis across all days
  const exerciseAnalysis = useMemo(() => {
    const all = [];
    for (const [dayKey, day] of Object.entries(WORKOUT_PLAN)) {
      for (const ex of day.exercises) {
        if (ex.repTarget == null) continue; // skip timed holds
        const sessions = getAllSessions(setLog, ex);
        const lastSession = sessions.length ? sessions[sessions.length - 1] : null;
        const suggestion = getProgressionSuggestion(ex, lastSession);
        const plateau = detectPlateau(sessions, ex.repTarget);
        const pr = getPR(sessions);
        all.push({
          exercise: ex,
          dayKey,
          dayColor: day.color,
          dayLabel: day.label,
          sessions,
          sessionCount: sessions.length,
          suggestion,
          plateau,
          pr,
        });
      }
    }
    return all;
  }, [setLog]);

  const plateaus = exerciseAnalysis.filter((e) => e.plateau);
  const bumps = exerciseAnalysis.filter((e) => !e.plateau && e.suggestion?.type === "bump");
  const newExercises = exerciseAnalysis.filter((e) => e.sessionCount === 0);
  const hasEnoughData = totalSessions >= 2;

  // Days since last workout
  const lastWorkoutDate = Object.keys(logs)
    .filter((d) => logs[d]?.completed)
    .sort()
    .reverse()[0];
  const daysSinceWorkout = lastWorkoutDate ? daysBetween(lastWorkoutDate, todayStr) : null;

  const handleCopy = () => {
    const text = buildTextSummary({ profile, logs, setLog, weightLog, dietLog, cardioLog });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadText = () => {
    const text = buildTextSummary({ profile, logs, setLog, weightLog, dietLog, cardioLog });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fittrack-${todayStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = {
      exportDate: todayStr,
      profile,
      weightLog,
      workoutLogs: logs,
      setLog,
      dietLog,
      cardioLog,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fittrack-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Brain size={22} style={{ color: "#FF6B35" }} />
        <h1 className="text-2xl font-black text-white">AI Coach</h1>
      </div>

      {/* Goal banner */}
      <div
        className="rounded-2xl p-4"
        style={{ background: `${goalStrategy.color}12`, border: `1px solid ${goalStrategy.color}33` }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: goalStrategy.color }}>
            Current Goal — {goalStrategy.label}
          </span>
          {mesoWeek && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "#1A1A2E", color: "#888" }}>
              Week {mesoWeek}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#aaa" }}>{goalStrategy.advice}</p>
      </div>

      {/* Deload alert */}
      {needsDeload && (
        <InsightCard
          color="#F59E0B"
          icon={<RefreshCw size={16} />}
          title="Deload Week"
          badge="THIS WEEK"
          body="You're in week 4 of your mesocycle. Drop to 2 sets at 60% weight this week — let your joints and CNS recover. You'll come back stronger."
        />
      )}

      {/* No data state */}
      {!hasEnoughData && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          <Brain size={32} className="mx-auto mb-3" style={{ color: "#555" }} />
          <p className="text-sm font-black text-white mb-1">Not enough data yet</p>
          <p className="text-xs leading-relaxed" style={{ color: "#555" }}>
            Log at least 2 workout sessions to unlock analysis. The more you log, the smarter the suggestions get.
          </p>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#1A1A2E" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, (totalSessions / 2) * 100)}%`, background: "#FF6B35" }}
            />
          </div>
          <p className="text-[10px] mt-1.5 font-bold" style={{ color: "#555" }}>
            {totalSessions}/2 sessions logged
          </p>
        </div>
      )}

      {hasEnoughData && (
        <>
          {/* Weekly snapshot */}
          <section>
            <SectionHeader icon={<Zap size={16} />} label="This Week's Snapshot" color="#FF6B35" />
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Sessions",
                  value: (() => {
                    const now = new Date();
                    const wStart = new Date(now); wStart.setDate(now.getDate() - now.getDay());
                    return Object.keys(logs).filter((d) => new Date(d) >= wStart && logs[d]?.completed).length;
                  })(),
                  unit: `/${profile.weeklyTarget ?? 4}`,
                  color: "#FF6B35",
                },
                {
                  label: "Rest Days",
                  value: daysSinceWorkout != null ? daysSinceWorkout : "—",
                  unit: "days",
                  color: daysSinceWorkout != null && daysSinceWorkout > 3 ? "#F59E0B" : "#4ECDC4",
                },
                {
                  label: "Weight Δ",
                  value: weightTrend != null ? (weightTrend > 0 ? `+${weightTrend}` : weightTrend) : "—",
                  unit: weightTrend != null ? "kg" : "",
                  color: weightTrend == null ? "#555" : Math.abs(weightTrend) < 1 ? "#22C55E" : "#F59E0B",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
                >
                  <p className="text-lg font-black" style={{ color: s.color }}>
                    {s.value}<span className="text-xs">{s.unit}</span>
                  </p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: "#555" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Weight feedback */}
          {weightTrend != null && (
            <InsightCard
              color={Math.abs(weightTrend) < 0.5 ? "#F59E0B" : profile.goal === "bulk" && weightTrend > 0 ? "#22C55E" : profile.goal === "cut" && weightTrend < 0 ? "#22C55E" : "#4ECDC4"}
              icon={<Scale size={16} />}
              title="Weight Trend"
              body={
                Math.abs(weightTrend) < 0.5
                  ? "Your weight is stable. Good for recomp — focus on body composition markers like waist measurement and strength gains."
                  : weightTrend > 0
                    ? `You're up ${weightTrend}kg over the last ${recentWeights.length} weigh-ins. ${profile.goal === "bulk" ? "On track for lean bulk. Watch the rate — aim for 0.5–1kg/month max." : "Slight surplus — check diet adherence."}`
                    : `You're down ${Math.abs(weightTrend)}kg over the last ${recentWeights.length} weigh-ins. ${profile.goal === "cut" ? "On track for the cut. Ensure protein stays high to preserve muscle." : "Check you're eating enough to fuel your training."}`
              }
            />
          )}

          {/* Plateaus */}
          {plateaus.length > 0 && (
            <section>
              <SectionHeader icon={<AlertTriangle size={16} />} label="Plateaus Detected" color="#F59E0B" />
              <div className="space-y-2">
                {plateaus.map((e) => (
                  <InsightCard
                    key={e.exercise.id}
                    color="#F59E0B"
                    icon={<AlertTriangle size={16} />}
                    title={e.exercise.name}
                    badge={e.dayLabel.split("—")[1]?.trim()}
                    body={`Same weight for 3+ sessions. Consider switching to a variation for 4 weeks, then cycling back — your body has adapted to this stimulus.`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ready to bump */}
          {bumps.length > 0 && (
            <section>
              <SectionHeader icon={<TrendingUp size={16} />} label="Ready to Progress" color="#22C55E" />
              <div className="space-y-2">
                {bumps.map((e) => (
                  <div
                    key={e.exercise.id}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-white">{e.exercise.name}</p>
                      <span className="text-[10px] font-bold" style={{ color: "#22C55E" }}>+{e.exercise.progression}kg</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#22C55E" }}>{e.suggestion.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Per-exercise breakdown */}
          <section>
            <SectionHeader icon={<Calendar size={16} />} label="Exercise Breakdown" color="#4ECDC4" />
            {Object.entries(WORKOUT_PLAN).map(([dayKey, day]) => {
              const dayExercises = exerciseAnalysis.filter((e) => e.dayKey === dayKey && e.exercise.repTarget != null);
              if (!dayExercises.length) return null;
              return (
                <div key={dayKey} className="mb-4">
                  <p
                    className="text-[10px] font-black uppercase tracking-wider mb-2"
                    style={{ color: day.color }}
                  >
                    {day.label}
                  </p>
                  <div className="space-y-2">
                    {dayExercises.map((e) => (
                      <ExerciseRow key={e.exercise.id} {...e} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* New exercises tip */}
      {newExercises.length > 0 && hasEnoughData && (
        <InsightCard
          color="#555"
          icon={<CheckCircle size={16} />}
          title={`${newExercises.length} exercise${newExercises.length > 1 ? "s" : ""} not yet logged`}
          body={`Start logging ${newExercises.map((e) => e.exercise.name).join(", ")} to get progression hints for those lifts.`}
        />
      )}

      {/* Export for AI */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} style={{ color: "#A855F7" }} />
          <h2 className="text-sm font-black text-white">Export for AI</h2>
        </div>
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "#888" }}>
            Export your data to analyse with ChatGPT or Claude — paste it in and ask how you're doing.
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity"
            style={{ background: "linear-gradient(135deg, #A855F7, #6366f1)" }}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Summary to Clipboard"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadText}
              className="flex-1 py-2.5 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5"
              style={{ background: "#3b82f6" }}
            >
              <FileText size={14} /> Download .txt
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
              style={{ background: "#1A1A2E", color: "#888", border: "1px solid #2a2a3e" }}
            >
              <Download size={14} /> Download .json
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
