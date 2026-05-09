import { useState } from "react";
import { ChevronRight, Dumbbell } from "lucide-react";

const GOALS = [
  { id: "recomp",   label: "Body Recomp",  desc: "Lose fat + build muscle at the same time", color: "#FF6B35", emoji: "🔥" },
  { id: "cut",      label: "Cut",           desc: "Lose fat, preserve lean muscle",            color: "#4ECDC4", emoji: "✂️" },
  { id: "bulk",     label: "Lean Bulk",     desc: "Build muscle with minimal fat gain",        color: "#A855F7", emoji: "💪" },
  { id: "maintain", label: "Maintain",      desc: "Keep your current body composition",        color: "#F59E0B", emoji: "⚖️" },
];

const LEVELS = [
  { id: "beginner",     label: "Beginner",     desc: "< 1 year lifting" },
  { id: "intermediate", label: "Intermediate", desc: "1–3 years lifting" },
  { id: "advanced",     label: "Advanced",     desc: "3+ years lifting" },
];

const ACTIVITY = [
  { id: "sedentary",   label: "Sedentary",         desc: "Desk job, little exercise" },
  { id: "light",       label: "Lightly Active",     desc: "Exercise 1–3 days/week" },
  { id: "moderate",    label: "Moderately Active",  desc: "Exercise 3–5 days/week" },
  { id: "very",        label: "Very Active",        desc: "Hard exercise 6–7 days/week" },
];

const inputStyle = {
  background: "#0A0A12",
  border: "1px solid #1A1A2E",
  color: "#E8E8F0",
  width: "100%",
  padding: "12px 16px",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: 700,
  outline: "none",
};

const STEPS = ["Stats", "Goal", "Level", "Ready"];

function ProgressBar({ step }) {
  return (
    <div className="flex gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col gap-1.5">
          <div
            className="h-1 rounded-full"
            style={{ background: i <= step ? "#FF6B35" : "#1A1A2E" }}
          />
          <span
            className="text-[10px] font-black text-center"
            style={{ color: i === step ? "#FF6B35" : "#555" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    activity: "moderate",
    goal: "recomp",
    level: "intermediate",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const canContinue = () => {
    if (step === 0) return form.name.trim() && form.weight && form.height && form.age;
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onComplete(form);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0A12" }}
    >
      <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col px-5 pt-10 pb-32">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Dumbbell size={22} style={{ color: "#FF6B35" }} />
          <span className="text-base font-black text-white tracking-widest uppercase">FitTrack</span>
        </div>

        <ProgressBar step={step} />

        {/* Step 0 — Stats */}
        {step === 0 && (
          <div className="space-y-6 flex-1">
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Your Stats</h1>
              <p className="text-sm mt-1" style={{ color: "#555" }}>
                FitTrack uses this to tailor every workout and calorie target to you.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider block mb-1.5" style={{ color: "#888" }}>Your Name</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Alex"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider block mb-1.5" style={{ color: "#888" }}>Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    style={inputStyle}
                    placeholder="yrs"
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider block mb-1.5" style={{ color: "#888" }}>Weight</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    style={inputStyle}
                    placeholder="kg"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider block mb-1.5" style={{ color: "#888" }}>Height</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    style={inputStyle}
                    placeholder="cm"
                    value={form.height}
                    onChange={(e) => set("height", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider block mb-1.5" style={{ color: "#888" }}>Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY.map((a) => {
                    const active = form.activity === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => set("activity", a.id)}
                        className="w-full rounded-2xl p-3.5 text-left transition-all"
                        style={{
                          background: active ? "rgba(255,107,53,0.1)" : "#0F0F1E",
                          border: `1px solid ${active ? "#FF6B35" : "#1A1A2E"}`,
                        }}
                      >
                        <span className="text-sm font-black" style={{ color: active ? "#FF6B35" : "#aaa" }}>{a.label}</span>
                        <span className="text-xs block mt-0.5" style={{ color: "#555" }}>{a.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Goal */}
        {step === 1 && (
          <div className="space-y-6 flex-1">
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Your Goal</h1>
              <p className="text-sm mt-1" style={{ color: "#555" }}>
                FitTrack adapts your workouts, rest days, and nutrition targets to your goal.
              </p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => {
                const active = form.goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => set("goal", g.id)}
                    className="w-full rounded-2xl p-4 text-left transition-all flex items-center gap-4"
                    style={{
                      background: active ? `${g.color}15` : "#0F0F1E",
                      border: `1px solid ${active ? g.color : "#1A1A2E"}`,
                    }}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <span className="text-sm font-black block" style={{ color: active ? g.color : "#E8E8F0" }}>{g.label}</span>
                      <span className="text-xs" style={{ color: "#555" }}>{g.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Level */}
        {step === 2 && (
          <div className="space-y-6 flex-1">
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Your Level</h1>
              <p className="text-sm mt-1" style={{ color: "#555" }}>
                This sets how aggressively FitTrack programs your progressive overload.
              </p>
            </div>
            <div className="space-y-3">
              {LEVELS.map((l) => {
                const active = form.level === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => set("level", l.id)}
                    className="w-full rounded-2xl p-5 text-left transition-all"
                    style={{
                      background: active ? "rgba(168,85,247,0.12)" : "#0F0F1E",
                      border: `1px solid ${active ? "#A855F7" : "#1A1A2E"}`,
                    }}
                  >
                    <span className="text-base font-black block" style={{ color: active ? "#A855F7" : "#E8E8F0" }}>{l.label}</span>
                    <span className="text-xs" style={{ color: "#555" }}>{l.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Ready */}
        {step === 3 && (
          <div className="space-y-6 flex-1">
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">
                You're all set,{" "}
                <span style={{ color: "#FF6B35" }}>{form.name.split(" ")[0]}</span>.
              </h1>
              <p className="text-sm mt-1" style={{ color: "#555" }}>
                Here's your personalised plan. Everything adapts as you log workouts.
              </p>
            </div>

            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
            >
              {[
                { label: "Goal",     value: GOALS.find((g) => g.id === form.goal)?.label },
                { label: "Level",    value: LEVELS.find((l) => l.id === form.level)?.label },
                { label: "Weight",   value: `${form.weight} kg` },
                { label: "Height",   value: `${form.height} cm` },
                { label: "Activity", value: ACTIVITY.find((a) => a.id === form.activity)?.label },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#555" }}>{label}</span>
                  <span className="text-sm font-black text-white">{value}</span>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)" }}
            >
              <p className="text-xs font-bold" style={{ color: "#FF6B35" }}>
                This is a demo — all data stays local in your browser. Hit Reset any time to start fresh.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: "#0A0A12", borderTop: "1px solid #1A1A2E" }}
      >
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={next}
            disabled={!canContinue()}
            className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: canContinue()
                ? "linear-gradient(135deg, #FF6B35, #F59E0B)"
                : "#1A1A2E",
              color: canContinue() ? "#fff" : "#555",
            }}
          >
            {step === STEPS.length - 1 ? "Launch FitTrack" : "Continue"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
