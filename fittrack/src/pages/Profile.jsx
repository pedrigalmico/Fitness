import { useState } from "react";
import { User, Target, Dumbbell, Apple, Save, Check, ChevronRight } from "lucide-react";
import { useStorage } from "../hooks/useStorage";
import { EQUIPMENT_LIST } from "../data/programs";
import { useNavigate } from "react-router-dom";

const GOALS = [
  { id: "recomp",  label: "Body Recomp",  desc: "Lose fat + build muscle simultaneously", color: "#FF6B35" },
  { id: "cut",     label: "Cut",          desc: "Lose fat, preserve muscle",               color: "#4ECDC4" },
  { id: "bulk",    label: "Lean Bulk",    desc: "Build muscle, minimal fat gain",           color: "#A855F7" },
  { id: "maintain",label: "Maintain",    desc: "Keep current body composition",            color: "#F59E0B" },
];

const LEVELS = [
  { id: "beginner",     label: "Beginner",     desc: "< 1 year training" },
  { id: "intermediate", label: "Intermediate", desc: "1–3 years training" },
  { id: "advanced",     label: "Advanced",     desc: "3+ years training" },
];

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#888" }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  background: "#0A0A12",
  border: "1px solid #1A1A2E",
  color: "#E8E8F0",
};

export default function Profile() {
  const [profile, setProfile] = useStorage("ft_profile", {});
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    goal:           profile.goal           ?? "recomp",
    level:          profile.level          ?? "intermediate",
    startWeight:    profile.startWeight    ?? "",
    targetWeight:   profile.targetWeight   ?? "",
    currentWeight:  profile.currentWeight  ?? "",
    height:         profile.height         ?? "",
    age:            profile.age            ?? "",
    weeklyTarget:   profile.weeklyTarget   ?? 4,
    proteinTarget:  profile.proteinTarget  ?? 148,
    calTarget:      profile.calTarget      ?? 2150,
    startDate:      profile.startDate      ?? new Date().toISOString().split("T")[0],
    targetDate:     profile.targetDate     ?? "",
    name:           profile.name           ?? "",
    equipment:      profile.equipment      ?? ["dumbbells", "barbell", "treadmill", "bodyweight"],
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    setProfile({ ...form, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-2xl font-black text-white">Profile & Goals</h1>

      {/* Identity */}
      <section
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2">
          <User size={16} style={{ color: "#FF6B35" }} />
          <span className="text-sm font-black text-white">About You</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.name}
              placeholder="e.g. Mico"
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Age">
            <input
              type="number"
              inputMode="numeric"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.age}
              placeholder="yrs"
              onChange={(e) => set("age", e.target.value)}
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              inputMode="decimal"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.height}
              placeholder="cm"
              onChange={(e) => set("height", e.target.value)}
            />
          </Field>
          <Field label="Current Weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.currentWeight}
              placeholder="kg"
              onChange={(e) => set("currentWeight", e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Goal */}
      <section
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: "#4ECDC4" }} />
          <span className="text-sm font-black text-white">Training Goal</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => {
            const active = form.goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => set("goal", g.id)}
                className="rounded-xl p-3 text-left transition-all"
                style={{
                  background: active ? `${g.color}20` : "#0A0A12",
                  border: `1px solid ${active ? g.color : "#1A1A2E"}`,
                }}
              >
                <p className="text-xs font-black" style={{ color: active ? g.color : "#aaa" }}>{g.label}</p>
                <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#555" }}>{g.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.startWeight}
              placeholder="kg"
              onChange={(e) => set("startWeight", e.target.value)}
            />
          </Field>
          <Field label="Target Weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.targetWeight}
              placeholder="kg"
              onChange={(e) => set("targetWeight", e.target.value)}
            />
          </Field>
          <Field label="Start Date">
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field label="Target Date">
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Experience Level */}
      <section
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2">
          <Dumbbell size={16} style={{ color: "#A855F7" }} />
          <span className="text-sm font-black text-white">Training Level</span>
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => {
            const active = form.level === l.id;
            return (
              <button
                key={l.id}
                onClick={() => set("level", l.id)}
                className="flex-1 rounded-xl p-2.5 text-center transition-all"
                style={{
                  background: active ? "rgba(168,85,247,0.15)" : "#0A0A12",
                  border: `1px solid ${active ? "#A855F7" : "#1A1A2E"}`,
                }}
              >
                <p className="text-[11px] font-black" style={{ color: active ? "#A855F7" : "#aaa" }}>{l.label}</p>
                <p className="text-[9px] mt-0.5" style={{ color: "#555" }}>{l.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Nutrition Targets */}
      <section
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2">
          <Apple size={16} style={{ color: "#F59E0B" }} />
          <span className="text-sm font-black text-white">Nutrition Targets</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Daily Calories">
            <input
              type="number"
              inputMode="numeric"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.calTarget}
              placeholder="kcal"
              onChange={(e) => set("calTarget", e.target.value)}
            />
          </Field>
          <Field label="Protein (g)">
            <input
              type="number"
              inputMode="numeric"
              className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={inputStyle}
              value={form.proteinTarget}
              placeholder="g"
              onChange={(e) => set("proteinTarget", e.target.value)}
            />
          </Field>
          <Field label="Weekly Workouts">
            <div className="flex gap-1">
              {[3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => set("weeklyTarget", n)}
                  className="flex-1 py-2 rounded-lg text-sm font-black transition-all"
                  style={{
                    background: form.weeklyTarget === n ? "#FF6B35" : "#0A0A12",
                    color: form.weeklyTarget === n ? "#fff" : "#555",
                    border: `1px solid ${form.weeklyTarget === n ? "#FF6B35" : "#1A1A2E"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </section>

      {/* Programs shortcut */}
      <button
        onClick={() => navigate("/programs")}
        className="w-full rounded-2xl p-4 flex items-center justify-between"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏋️</span>
          <div className="text-left">
            <p className="text-sm font-black text-white">Training Programs</p>
            <p className="text-xs" style={{ color: "#555" }}>
              {profile.activeProgram
                ? `Active: ${profile.activeProgram.charAt(0).toUpperCase() + profile.activeProgram.slice(1)}`
                : "Choose a program"}
            </p>
          </div>
        </div>
        <ChevronRight size={18} style={{ color: "#555" }} />
      </button>

      {/* Equipment */}
      <section
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
      >
        <div className="flex items-center gap-2">
          <Dumbbell size={16} style={{ color: "#4ECDC4" }} />
          <span className="text-sm font-black text-white">Equipment Available</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_LIST.map((eq) => {
            const selected = (form.equipment ?? []).includes(eq.id);
            const toggleEquipment = () => {
              const cur = form.equipment ?? [];
              set("equipment", selected ? cur.filter((e) => e !== eq.id) : [...cur, eq.id]);
            };
            return (
              <button
                key={eq.id}
                onClick={toggleEquipment}
                className="rounded-xl p-3 flex items-center gap-2.5 text-left transition-all"
                style={{
                  background: selected ? "rgba(255,107,53,0.12)" : "#0A0A12",
                  border: `1px solid ${selected ? "#FF6B35" : "#1A1A2E"}`,
                }}
              >
                <span className="text-xl">{eq.emoji}</span>
                <span
                  className="text-xs font-black"
                  style={{ color: selected ? "#E8E8F0" : "#555" }}
                >
                  {eq.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={save}
        className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
        style={{
          background: saved ? "#22C55E" : "linear-gradient(135deg, #FF6B35, #F59E0B)",
        }}
      >
        {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Profile</>}
      </button>
    </div>
  );
}
