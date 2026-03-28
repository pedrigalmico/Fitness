import { useState, useCallback } from "react";
import { ExternalLink, Check } from "lucide-react";
import RestTimer from "./RestTimer";

export default function ExerciseCard({ exercise, dayColor, sets, onToggleSet }) {
  const totalSets = exercise.sets;
  const allDone = Array.from({ length: totalSets }, (_, i) => sets[i]).every(Boolean);
  const [activeTimer, setActiveTimer] = useState(null); // set index that triggered timer

  const handleToggleSet = useCallback((i) => {
    const wasDone = sets[i];
    onToggleSet(i);

    // Start timer when marking a set as done (not the last set)
    if (!wasDone && exercise.rest) {
      const isLastSet = i === totalSets - 1;
      // Check if all OTHER sets are done after this one
      const othersDone = Array.from({ length: totalSets }, (_, j) =>
        j === i ? true : sets[j]
      ).every(Boolean);

      if (!isLastSet && !othersDone) {
        setActiveTimer(i);
      } else {
        setActiveTimer(null);
      }
    } else {
      setActiveTimer(null);
    }
  }, [sets, onToggleSet, exercise.rest, totalSets]);

  const dismissTimer = useCallback(() => setActiveTimer(null), []);

  return (
    <div
      className="rounded-2xl p-4 transition-colors"
      style={{
        background: allDone ? "rgba(34,197,94,0.08)" : "#0F0F1E",
        border: `1px solid ${allDone ? "rgba(34,197,94,0.3)" : "#1A1A2E"}`,
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-tight font-heading uppercase">{exercise.name}</h3>
          <p className="text-[10px] mt-0.5" style={{ color: "#555" }}>
            {Array.isArray(exercise.equipment) ? exercise.equipment.join(", ") : exercise.equipment}
          </p>
        </div>
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

      {/* Sets x Reps + Rest info */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold" style={{ color: dayColor }}>
          {exercise.sets} &times; {exercise.reps}
        </span>
        {exercise.rest && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#1A1A2E", color: "#555" }}>
            Rest: {exercise.rest}
          </span>
        )}
      </div>

      {/* Note */}
      {exercise.note && (
        <p className="text-[10px] mb-2 italic" style={{ color: "#666" }}>{exercise.note}</p>
      )}

      {/* Set buttons */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: totalSets }, (_, i) => {
          const done = sets[i];
          return (
            <button
              key={i}
              onClick={() => handleToggleSet(i)}
              className="w-10 h-10 rounded-xl text-xs font-black flex items-center justify-center transition-all active:scale-95"
              style={{
                background: done ? "#22C55E" : "#1A1A2E",
                color: done ? "#fff" : "#555",
              }}
            >
              {done ? <Check size={16} /> : `S${i + 1}`}
            </button>
          );
        })}
      </div>

      {/* Rest Timer */}
      {activeTimer !== null && exercise.rest && !allDone && (
        <RestTimer
          key={activeTimer}
          restTime={exercise.rest}
          color={dayColor}
          onDismiss={dismissTimer}
        />
      )}
    </div>
  );
}
