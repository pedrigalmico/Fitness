import { useState } from "react";
import { ChevronRight, X, CheckCircle, Clock, Dumbbell } from "lucide-react";
import { PROGRAMS } from "../data/programs";
import { useStorage } from "../hooks/useStorage";

function DifficultyDots({ level, color }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i <= level ? color : "#1A1A2E" }}
        />
      ))}
    </div>
  );
}

function ProgramDetail({ program, isActive, onStart, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#0A0A12" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "#0F0F1E" }}
        >
          <X size={18} style={{ color: "#aaa" }} />
        </button>
        {isActive && (
          <span
            className="text-xs font-black px-3 py-1 rounded-xl"
            style={{ background: `${program.color}20`, color: program.color }}
          >
            ACTIVE
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-5">
        {/* Hero */}
        <div className="text-center py-4">
          <div className="text-5xl mb-3">{program.emoji}</div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">{program.title}</h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>{program.tagline}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <DifficultyDots level={program.difficulty} color={program.color} />
            <span className="text-xs font-bold" style={{ color: "#555" }}>
              <Clock size={10} className="inline mr-1" />{program.duration}
            </span>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#555" }}>
            Weekly Schedule
          </p>
          <div className="space-y-2">
            {program.schedule.map((s) => (
              <div key={s.day} className="flex items-center justify-between">
                <span
                  className="text-sm font-black w-28"
                  style={{ color: s.type === "rest" ? "#555" : program.color }}
                >
                  {s.day}
                </span>
                <span
                  className="text-sm font-bold text-right flex-1"
                  style={{ color: s.type === "rest" ? "#555" : "#E8E8F0" }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample workout */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#555" }}>
            {program.sample.label}
          </p>
          <div className="space-y-2">
            {program.sample.exercises.map((ex) => (
              <div key={ex.name} className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{ex.name}</span>
                <span className="text-sm font-bold" style={{ color: "#555" }}>
                  {ex.sets}×{ex.reps}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition strategy */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#555" }}>
            Nutrition Strategy
          </p>
          <p className="text-sm font-bold text-white">
            Calories: {program.nutrition.calStrategy} &nbsp;|&nbsp; Protein: {program.nutrition.proteinStrategy}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: "#0A0A12", borderTop: "1px solid #1A1A2E" }}
      >
        <button
          onClick={() => onStart(program)}
          className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2"
          style={{
            background: isActive ? "#1A1A2E" : `linear-gradient(135deg, ${program.color}, ${program.color}99)`,
            color: isActive ? program.color : "#fff",
          }}
        >
          {isActive ? (
            <><CheckCircle size={18} /> Currently Active</>
          ) : (
            <>Start This Program <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Programs() {
  const [profile, setProfile] = useStorage("ft_profile", {});
  const [selected, setSelected] = useState(null);

  const activeId = profile.activeProgram ?? "recomp";

  const handleStart = (program) => {
    setProfile((prev) => ({
      ...prev,
      activeProgram: program.id,
      goal: program.goal,
      updatedAt: new Date().toISOString(),
    }));
    setSelected(null);
  };

  if (selected) {
    return (
      <ProgramDetail
        program={selected}
        isActive={selected.id === activeId}
        onStart={handleStart}
        onClose={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <Dumbbell size={22} style={{ color: "#FF6B35" }} />
        <h1 className="text-2xl font-black text-white">Programs</h1>
      </div>
      <p className="text-xs" style={{ color: "#555" }}>
        Choose a training program. Your Coach tab will adapt its suggestions to match your goal.
      </p>

      <div className="space-y-3">
        {PROGRAMS.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
              style={{
                background: isActive ? `${p.color}12` : "#0F0F1E",
                border: `1px solid ${isActive ? p.color : "#1A1A2E"}`,
              }}
            >
              <span className="text-3xl shrink-0">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base font-black text-white uppercase tracking-tight">{p.title}</span>
                  {isActive && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-lg shrink-0"
                      style={{ background: p.color, color: "#fff" }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: "#888" }}>{p.tagline}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <DifficultyDots level={p.difficulty} color={p.color} />
                  <span className="text-[10px] font-bold" style={{ color: "#555" }}>{p.duration}</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "#555", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
