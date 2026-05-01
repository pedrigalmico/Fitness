import { useEffect, useState } from "react";
import { ExternalLink, Check, TrendingUp, Lightbulb } from "lucide-react";
import { isSetDone, getProgressionSuggestion, getLastSession, formatLastSession } from "../lib/progression";

const isTimeReps = (reps) => typeof reps === "string";

export default function ExerciseCard({ exercise, dayColor, today, setLog, onCommitSet, onClearSet }) {
  const lastSession = getLastSession(setLog, exercise, today);
  const suggestion = getProgressionSuggestion(exercise, lastSession);
  const lastSummary = formatLastSession(lastSession);

  // Per-set draft inputs (weight + reps). Pre-fill from today's log, or from suggestion, or from last session.
  const initialDraft = (i) => {
    const todayEntry = setLog?.[`${today}_${exercise.id}_${i}`];
    if (todayEntry) {
      return { weight: todayEntry.weight ?? "", reps: todayEntry.reps ?? "" };
    }
    if (suggestion) {
      return {
        weight: suggestion.weight ?? "",
        reps: suggestion.reps ?? "",
      };
    }
    return { weight: "", reps: isTimeReps(exercise.reps) ? "" : exercise.repTarget ?? "" };
  };

  const [drafts, setDrafts] = useState(() =>
    Array.from({ length: exercise.sets }, (_, i) => initialDraft(i))
  );

  // If today's log changes from outside (e.g. clear), keep drafts fresh.
  useEffect(() => {
    setDrafts(Array.from({ length: exercise.sets }, (_, i) => initialDraft(i)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, exercise.id]);

  const updateDraft = (i, field, value) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const sets = Array.from({ length: exercise.sets }, (_, i) =>
    setLog?.[`${today}_${exercise.id}_${i}`] || null
  );
  const allDone = sets.every(isSetDone);

  const isBodyweight = exercise.type === "bodyweight" || exercise.type === "core";
  const isTimed = isTimeReps(exercise.reps);

  const handleCommit = (i) => {
    const entry = sets[i];
    if (isSetDone(entry)) {
      onClearSet(exercise.id, i);
      return;
    }
    const d = drafts[i];
    const weight = d.weight === "" || isBodyweight ? null : Number(d.weight);
    const reps = d.reps === "" ? null : isTimed ? d.reps : Number(d.reps);
    onCommitSet(exercise.id, i, { weight, reps, ts: Date.now() }, exercise);
  };

  return (
    <div
      className="rounded-2xl p-4 transition-colors"
      style={{
        background: allDone ? "rgba(34,197,94,0.08)" : "#0F0F1E",
        border: `1px solid ${allDone ? "rgba(34,197,94,0.3)" : "#1A1A2E"}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-white leading-tight">{exercise.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: "#555" }}>{exercise.equipment}</p>
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

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold" style={{ color: dayColor }}>
          {exercise.sets} × {exercise.reps}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#555" }}>
          Rest {exercise.rest}s
        </p>
      </div>

      {/* Progression hint */}
      {(lastSummary || suggestion?.message) && (
        <div
          className="rounded-xl px-3 py-2 mb-3 text-xs space-y-0.5"
          style={{ background: "#0A0A12", border: "1px solid #1A1A2E" }}
        >
          {lastSummary && (
            <p style={{ color: "#888" }}>
              <span className="font-bold" style={{ color: "#aaa" }}>Last:</span> {lastSummary}
            </p>
          )}
          {suggestion?.message && (
            <p className="flex items-start gap-1.5 font-bold" style={{ color: suggestion.type === "bump" ? "#22C55E" : dayColor }}>
              {suggestion.type === "bump" ? <TrendingUp size={12} className="mt-0.5 shrink-0" /> : <Lightbulb size={12} className="mt-0.5 shrink-0" />}
              <span>{suggestion.message}</span>
            </p>
          )}
        </div>
      )}

      {/* Set rows */}
      <div className="space-y-2">
        {Array.from({ length: exercise.sets }, (_, i) => {
          const done = isSetDone(sets[i]);
          const d = drafts[i] || { weight: "", reps: "" };
          return (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{ opacity: done ? 0.85 : 1 }}
            >
              <span
                className="w-7 text-[10px] font-black text-center shrink-0"
                style={{ color: done ? "#22C55E" : "#555" }}
              >
                S{i + 1}
              </span>

              {!isBodyweight && (
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="kg"
                  value={d.weight}
                  disabled={done}
                  onChange={(e) => updateDraft(i, "weight", e.target.value)}
                  className="w-16 px-2 py-1.5 rounded-lg text-xs font-bold text-white text-center"
                  style={{ background: "#0A0A12", border: "1px solid #1A1A2E" }}
                />
              )}
              {!isBodyweight && <span className="text-xs font-bold" style={{ color: "#555" }}>×</span>}

              <input
                type={isTimed ? "text" : "number"}
                inputMode={isTimed ? "text" : "numeric"}
                placeholder={isTimed ? "40s" : "reps"}
                value={d.reps}
                disabled={done}
                onChange={(e) => updateDraft(i, "reps", e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs font-bold text-white text-center"
                style={{ background: "#0A0A12", border: "1px solid #1A1A2E" }}
              />

              <button
                onClick={() => handleCommit(i)}
                className="w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: done ? "#22C55E" : "#1A1A2E",
                  color: done ? "#fff" : "#555",
                }}
                aria-label={done ? "Undo set" : "Log set"}
              >
                <Check size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
