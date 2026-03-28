import { useState, useMemo } from "react";
import { CheckCircle, Heart, ExternalLink, Moon, Footprints } from "lucide-react";
import { useStorage } from "../hooks/useStorage";
import { getPlan } from "../data/planEngine";
import ExerciseCard from "../components/ExerciseCard";

const today = () => new Date().toISOString().split("T")[0];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CircuitCard({ exercise, dayColor }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-heading font-semibold text-white uppercase">{exercise.name}</h3>
        <a
          href={exercise.yt}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ml-2"
          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
        >
          <ExternalLink size={12} /> Watch
        </a>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold" style={{ color: dayColor }}>
          {exercise.work} work / {exercise.rest} rest
        </span>
        {exercise.note && <span className="text-[10px]" style={{ color: "#555" }}>{exercise.note}</span>}
      </div>
    </div>
  );
}

function CardioCard({ cardio, templateColor }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart size={14} style={{ color: "#ef4444" }} />
          <span className="text-sm font-heading font-bold text-white uppercase">{cardio.type}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{
            background: cardio.type === "HIIT" ? "rgba(239,68,68,0.15)" : "rgba(78,205,196,0.15)",
            color: cardio.type === "HIIT" ? "#ef4444" : "#4ECDC4",
          }}
        >
          {cardio.duration}
        </span>
      </div>
      {cardio.protocol && (
        <p className="text-xs font-bold text-white mb-1">{cardio.protocol}</p>
      )}
      {cardio.speed && (
        <div className="flex gap-3 mb-1">
          <span className="text-xs text-white font-bold">Speed: {cardio.speed}</span>
          <span className="text-xs text-white font-bold">Incline: {cardio.incline}</span>
        </div>
      )}
      {cardio.notes && <p className="text-xs mt-1 italic" style={{ color: "#888" }}>{cardio.notes}</p>}
    </div>
  );
}

// Build a full 7-day week from lifting schedule + cardio
function buildWeek(schedule, cardio) {
  const week = WEEKDAYS.map((dayName, i) => ({
    dayName,
    shortDay: SHORT_DAYS[i],
    dayIndex: i,
    type: "rest",       // default
    lifting: null,
    cardioSessions: [],
    label: "Rest Day",
    color: "#333",
    emoji: null,
  }));

  // Place lifting days
  schedule.forEach((s) => {
    const idx = WEEKDAYS.indexOf(s.day);
    if (idx >= 0) {
      week[idx].type = s.type === "cardio_session" ? "cardio_session" : "lifting";
      week[idx].lifting = s;
      week[idx].label = s.label;
      week[idx].key = s.key;
    }
  });

  // Place cardio sessions
  cardio.forEach((c) => {
    const idx = WEEKDAYS.indexOf(c.day);
    if (idx >= 0) {
      week[idx].cardioSessions.push(c);
      // If day has no lifting, mark it as cardio-only
      if (week[idx].type === "rest") {
        week[idx].type = "cardio";
        week[idx].label = `${c.type} Cardio`;
      }
    }
  });

  return week;
}

export default function Workout() {
  const [templateId] = useStorage("ft_template", "recomp");
  const [equipment] = useStorage("ft_equipment", []);
  const [stats] = useStorage("ft_stats", {});
  const [logs, setLogs] = useStorage("ft_logs", {});
  const [sets, setSets] = useStorage("ft_sets", {});

  const plan = useMemo(() => getPlan(templateId, equipment, stats), [templateId, equipment, stats]);
  const week = useMemo(() => buildWeek(plan.schedule, plan.cardio), [plan.schedule, plan.cardio]);

  // Default to today's day of week
  const todayDow = new Date().getDay();
  const [selectedIdx, setSelectedIdx] = useState(todayDow);

  const selected = week[selectedIdx];
  const todayStr = today();
  const isCompleted = logs[todayStr]?.completed && logs[todayStr]?.day === selected?.key;

  const toggleSet = (exerciseId, setIdx) => {
    const key = `${todayStr}_${exerciseId}_${setIdx}`;
    setSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getExerciseSets = (exercise) => {
    if (!exercise.sets) return [];
    return Array.from({ length: exercise.sets }, (_, i) =>
      sets[`${todayStr}_${exercise.id}_${i}`] || false
    );
  };

  const liftingDay = selected?.lifting;
  const isLifting = selected?.type === "lifting";
  const isCircuitOrCardioSession = selected?.type === "circuit" || selected?.type === "cardio_session";
  const allSetsComplete = isLifting && liftingDay?.exercises.every((ex) =>
    getExerciseSets(ex).every(Boolean)
  );

  const markComplete = () => {
    setLogs((prev) => ({
      ...prev,
      [todayStr]: { day: selected.key || selected.dayName, completed: true, ts: Date.now() },
    }));
  };

  // Day selector colors
  const getDayStyle = (d, active) => {
    if (active) {
      if (d.type === "rest") return { bg: "#333", color: "#fff", border: "#333" };
      if (d.type === "cardio") return { bg: "#ef4444", color: "#fff", border: "#ef4444" };
      return { bg: plan.template.color, color: "#fff", border: plan.template.color };
    }
    return {
      bg: "#0F0F1E",
      color: d.type === "rest" ? "#333" : d.type === "cardio" ? "#ef444480" : "#555",
      border: "#1A1A2E",
    };
  };

  const getDayIcon = (d) => {
    if (d.type === "rest") return "💤";
    if (d.type === "cardio") return "🏃";
    if (d.type === "cardio_session") return "⚡";
    return d.key || "💪";
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white font-heading uppercase tracking-wide">Workout</h1>
        <p className="text-xs" style={{ color: "#555" }}>
          {plan.template.emoji} {plan.template.label}
        </p>
      </div>

      {/* Full Week Day Selector */}
      <div className="grid grid-cols-7 gap-1">
        {week.map((d, i) => {
          const active = i === selectedIdx;
          const isToday = i === todayDow;
          const style = getDayStyle(d, active);
          return (
            <button
              key={d.dayName}
              onClick={() => setSelectedIdx(i)}
              className="flex flex-col items-center py-2 rounded-xl text-center transition-all relative"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
              }}
            >
              <span className="text-[9px] font-bold uppercase" style={{ color: active ? style.color : "#555" }}>
                {d.shortDay}
              </span>
              <span className="text-xs font-black mt-0.5" style={{ color: style.color }}>
                {getDayIcon(d)}
              </span>
              {isToday && (
                <div
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: "#FF6B35" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: selected.type === "rest" ? "#333" : selected.type === "cardio" ? "#ef4444" : plan.template.color,
          }}
        />
        <h2 className="text-sm font-heading font-bold text-white uppercase">{selected.label}</h2>
        <span className="text-xs" style={{ color: "#555" }}>— {selected.dayName}</span>
        {selectedIdx === todayDow && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#FF6B3520", color: "#FF6B35" }}>
            TODAY
          </span>
        )}
      </div>

      {/* ─── REST DAY ─── */}
      {selected.type === "rest" && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
          <Moon size={40} className="mx-auto mb-3" style={{ color: "#333" }} />
          <h3 className="text-base font-heading font-bold text-white uppercase mb-1">Rest Day</h3>
          <p className="text-xs" style={{ color: "#555" }}>
            Recovery is when muscles grow. Sleep 7-8 hours, hit your protein, drink 2.5-3L water.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs" style={{ color: "#22C55E" }}>&#10003;</span>
              <span className="text-xs" style={{ color: "#888" }}>Stretch or foam roll 10 min</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs" style={{ color: "#22C55E" }}>&#10003;</span>
              <span className="text-xs" style={{ color: "#888" }}>Light walk if you feel like it</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs" style={{ color: "#22C55E" }}>&#10003;</span>
              <span className="text-xs" style={{ color: "#888" }}>Hit your protein and water goals</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── CARDIO-ONLY DAY ─── */}
      {selected.type === "cardio" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Footprints size={16} style={{ color: "#ef4444" }} />
            <span className="text-xs font-bold uppercase" style={{ color: "#555" }}>Treadmill Session</span>
          </div>
          {selected.cardioSessions.map((c) => (
            <CardioCard key={c.id} cardio={c} templateColor={plan.template.color} />
          ))}

          <button
            onClick={markComplete}
            disabled={isCompleted}
            className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            style={{
              background: isCompleted
                ? "rgba(34,197,94,0.1)"
                : "linear-gradient(135deg, #ef4444, #ef4444cc)",
              border: isCompleted ? "1px solid rgba(34,197,94,0.3)" : "none",
              color: isCompleted ? "#22C55E" : "#fff",
            }}
          >
            {isCompleted ? (
              <><CheckCircle size={18} /> Cardio Done!</>
            ) : (
              <>Mark Cardio Complete {"🔥"}</>
            )}
          </button>
        </div>
      )}

      {/* ─── LIFTING / CIRCUIT / CARDIO_SESSION DAY ─── */}
      {liftingDay && selected.type !== "cardio" && (
        <>
          {liftingDay.trainingStyle && (
            <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E", color: "#888" }}>
              {liftingDay.trainingStyle}
            </p>
          )}

          {/* Exercise Cards */}
          <div className="space-y-3">
            {liftingDay.exercises.map((ex) =>
              ex.work ? (
                <CircuitCard key={ex.id} exercise={ex} dayColor={plan.template.color} />
              ) : (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  dayColor={plan.template.color}
                  sets={getExerciseSets(ex)}
                  onToggleSet={(i) => toggleSet(ex.id, i)}
                />
              )
            )}
          </div>

          {liftingDay.rounds && (
            <p className="text-xs text-center font-bold" style={{ color: plan.template.color }}>
              {liftingDay.rounds} rounds | Rest {liftingDay.roundRest} between rounds
            </p>
          )}

          {/* Cardio after lifting (if any on same day) */}
          {selected.cardioSessions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Footprints size={14} style={{ color: "#ef4444" }} />
                <span className="text-xs font-bold uppercase" style={{ color: "#555" }}>Post-Workout Cardio</span>
              </div>
              {selected.cardioSessions.map((c) => (
                <CardioCard key={c.id} cardio={c} templateColor={plan.template.color} />
              ))}
            </div>
          )}

          {/* Complete Button */}
          {isLifting ? (
            isCompleted ? (
              <div
                className="rounded-2xl p-4 flex items-center justify-center gap-2"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                <CheckCircle size={20} color="#22C55E" />
                <span className="text-sm font-black" style={{ color: "#22C55E" }}>Workout Complete!</span>
              </div>
            ) : (
              <button
                onClick={markComplete}
                disabled={!allSetsComplete}
                className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
                style={{
                  background: allSetsComplete
                    ? `linear-gradient(135deg, ${plan.template.color}, ${plan.template.color}cc)`
                    : "#1A1A2E",
                }}
              >
                Mark Workout Complete {"🔥"}
              </button>
            )
          ) : (
            <button
              onClick={markComplete}
              disabled={isCompleted}
              className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
              style={{
                background: isCompleted
                  ? "rgba(34,197,94,0.1)"
                  : `linear-gradient(135deg, ${plan.template.color}, ${plan.template.color}cc)`,
                border: isCompleted ? "1px solid rgba(34,197,94,0.3)" : "none",
                color: isCompleted ? "#22C55E" : "#fff",
              }}
            >
              {isCompleted ? (
                <><CheckCircle size={18} /> Session Complete!</>
              ) : (
                <>Mark Session Complete {"🔥"}</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
