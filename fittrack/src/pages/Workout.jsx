import { useState } from "react";
import { CheckCircle, Heart, Moon } from "lucide-react";
import { WORKOUT_PLAN, CARDIO_PLAN } from "../data/workouts";
import { useStorage } from "../hooks/useStorage";
import ExerciseCard from "../components/ExerciseCard";
import RestTimer from "../components/RestTimer";
import { isSetDone } from "../lib/progression";

const today = () => new Date().toISOString().split("T")[0];
const WORKOUT_DAYS = Object.keys(WORKOUT_PLAN);

// Tabs ordered Mon → Sun
const ALL_TABS = [
  { id: "A",       type: "workout", label: "Mon" },
  { id: "cardio1", type: "cardio",  label: "Tue" },
  { id: "B",       type: "workout", label: "Wed" },
  { id: "cardio2", type: "cardio",  label: "Thu" },
  { id: "C",       type: "workout", label: "Fri" },
  { id: "D",       type: "workout", label: "Sat" },
  { id: "rest",    type: "rest",    label: "Sun" },
];

export default function Workout() {
  const [selectedTab, setSelectedTab] = useState("A");
  const [logs, setLogs] = useStorage("ft_logs", {});
  const [setLog, setSetLog] = useStorage("ft_set_log", {});
  const [cardioLog, setCardioLog] = useStorage("ft_cardio", {});
  const [restLog, setRestLog] = useStorage("ft_rest", {});
  const [restState, setRestState] = useState(null);

  const todayStr = today();
  const isWorkoutTab = WORKOUT_DAYS.includes(selectedTab);
  const isRestTab = selectedTab === "rest";
  const plan = isWorkoutTab ? WORKOUT_PLAN[selectedTab] : null;
  const cardio = !isWorkoutTab && !isRestTab ? CARDIO_PLAN.find((c) => c.id === selectedTab) : null;

  // Workout logic
  const isCompleted = isWorkoutTab && logs[todayStr]?.completed && logs[todayStr]?.day === selectedTab;

  const commitSet = (exerciseId, setIdx, entry, exercise) => {
    const key = `${todayStr}_${exerciseId}_${setIdx}`;
    setSetLog((prev) => ({ ...prev, [key]: entry }));
    setRestState({
      duration: exercise.rest,
      label: `${exercise.name} · S${setIdx + 1} done`,
      startedAt: Date.now(),
    });
  };

  const clearSet = (exerciseId, setIdx) => {
    const key = `${todayStr}_${exerciseId}_${setIdx}`;
    setSetLog((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const allSetsComplete =
    isWorkoutTab &&
    plan.exercises.every((ex) =>
      Array.from({ length: ex.sets }, (_, i) =>
        isSetDone(setLog[`${todayStr}_${ex.id}_${i}`])
      ).every(Boolean)
    );

  const markComplete = () => {
    setLogs((prev) => ({
      ...prev,
      [todayStr]: { day: selectedTab, completed: true, ts: Date.now() },
    }));
  };

  // Cardio logic
  const cardioKey = cardio ? `${todayStr}_${cardio.id}` : null;
  const isCardioDone = cardio ? !!cardioLog[cardioKey]?.completed : false;

  const toggleCardio = () => {
    setCardioLog((prev) => ({
      ...prev,
      [cardioKey]: isCardioDone
        ? { ...prev[cardioKey], completed: false }
        : { cardioId: cardio.id, completed: true, ts: Date.now() },
    }));
  };

  // Rest day logic
  const isRestDone = !!restLog[todayStr]?.completed;
  const toggleRest = () => {
    setRestLog((prev) => ({
      ...prev,
      [todayStr]: isRestDone
        ? { ...prev[todayStr], completed: false }
        : { completed: true, ts: Date.now() },
    }));
  };

  // Tab button color
  const tabColor = (tab) => {
    if (tab.type === "workout") return WORKOUT_PLAN[tab.id].color;
    if (tab.type === "cardio") {
      const c = CARDIO_PLAN.find((x) => x.id === tab.id);
      return c.type === "HIIT" ? "#ef4444" : "#4ECDC4";
    }
    return "#6366f1"; // rest — indigo
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">Workout</h1>

      {/* Tab Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {ALL_TABS.map((tab) => {
          const active = tab.id === selectedTab;
          const color = tabColor(tab);
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all"
              style={{
                background: active ? color : "#0F0F1E",
                color: active ? "#fff" : "#555",
                border: `1px solid ${active ? color : "#1A1A2E"}`,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Workout View */}
      {isWorkoutTab && plan && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
            <h2 className="text-sm font-black text-white">{plan.label}</h2>
            <span className="text-xs" style={{ color: "#555" }}>— {plan.day}</span>
          </div>

          <div className="space-y-3">
            {plan.exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                dayColor={plan.color}
                today={todayStr}
                setLog={setLog}
                onCommitSet={commitSet}
                onClearSet={clearSet}
              />
            ))}
          </div>

          {isCompleted ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-center gap-2"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <CheckCircle size={20} color="#22C55E" />
              <span className="text-sm font-black" style={{ color: "#22C55E" }}>
                Workout Complete!
              </span>
            </div>
          ) : (
            <button
              onClick={markComplete}
              disabled={!allSetsComplete}
              className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
              style={{
                background: allSetsComplete
                  ? "linear-gradient(135deg, #FF6B35, #F59E0B)"
                  : "#1A1A2E",
              }}
            >
              Mark Workout Complete <span role="img" aria-label="fire">&#128293;</span>
            </button>
          )}
        </>
      )}

      {/* Cardio View */}
      {cardio && (
        <>
          <div className="flex items-center gap-2">
            <Heart size={14} style={{ color: cardio.type === "HIIT" ? "#ef4444" : "#4ECDC4" }} />
            <h2 className="text-sm font-black text-white">{cardio.day} — {cardio.type}</h2>
          </div>

          <div
            className="rounded-2xl p-4 transition-colors"
            style={{
              background: isCardioDone ? "rgba(34,197,94,0.08)" : "#0F0F1E",
              border: `1px solid ${isCardioDone ? "rgba(34,197,94,0.3)" : "#1A1A2E"}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{
                  background: cardio.type === "HIIT" ? "rgba(239,68,68,0.15)" : "rgba(78,205,196,0.15)",
                  color: cardio.type === "HIIT" ? "#ef4444" : "#4ECDC4",
                }}
              >
                {cardio.type}
              </span>
              <span className="text-xs font-bold text-white">{cardio.duration}</span>
            </div>
            <p className="text-sm font-bold text-white mb-2">
              {cardio.protocol ? cardio.protocol : `Speed: ${cardio.speed} · Incline: ${cardio.incline}`}
            </p>
            <p className="text-xs italic" style={{ color: "#555" }}>{cardio.notes}</p>
          </div>

          {isCardioDone ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
              onClick={toggleCardio}
            >
              <CheckCircle size={20} color="#22C55E" />
              <span className="text-sm font-black" style={{ color: "#22C55E" }}>Cardio Done!</span>
            </div>
          ) : (
            <button
              onClick={toggleCardio}
              className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #ef4444, #F59E0B)" }}
            >
              Mark Cardio Done <Heart size={16} />
            </button>
          )}
        </>
      )}

      {/* Rest Day View */}
      {isRestTab && (
        <>
          <div className="flex items-center gap-2">
            <Moon size={14} style={{ color: "#6366f1" }} />
            <h2 className="text-sm font-black text-white">Sunday — Rest Day</h2>
          </div>

          <div
            className="rounded-2xl p-5 text-center transition-colors"
            style={{
              background: isRestDone ? "rgba(99,102,241,0.08)" : "#0F0F1E",
              border: `1px solid ${isRestDone ? "rgba(99,102,241,0.3)" : "#1A1A2E"}`,
            }}
          >
            <Moon size={32} className="mx-auto mb-3" style={{ color: isRestDone ? "#6366f1" : "#333" }} />
            <p className="text-sm font-black text-white mb-1">Recovery Day</p>
            <p className="text-xs leading-relaxed" style={{ color: "#555" }}>
              No training today. Sleep 7–8 hours, stay hydrated, and let your muscles repair. Rest is when the gains happen.
            </p>
          </div>

          {isRestDone ? (
            <div
              className="rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}
              onClick={toggleRest}
            >
              <CheckCircle size={20} color="#6366f1" />
              <span className="text-sm font-black" style={{ color: "#6366f1" }}>Rest Day Complete!</span>
            </div>
          ) : (
            <button
              onClick={toggleRest}
              className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #6366f1, #A855F7)" }}
            >
              Mark Rest Day Done <Moon size={16} />
            </button>
          )}
        </>
      )}

      <RestTimer active={restState} onDismiss={() => setRestState(null)} />
    </div>
  );
}
