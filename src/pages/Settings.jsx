import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { EQUIPMENT_LIST } from "../data/equipment";
import { useStorage } from "../hooks/useStorage";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly Active" },
  { value: "moderate", label: "Moderately Active" },
  { value: "active", label: "Very Active" },
];

export default function Settings({ onBack }) {
  const [stats, setStats] = useStorage("ft_stats", {});
  const [equipment, setEquipment] = useStorage("ft_equipment", []);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    age: stats.age || "",
    weightKg: stats.weightKg || "",
    heightCm: stats.heightCm || "",
    activityLevel: stats.activityLevel || "moderate",
  });

  const toggleEquipment = (id) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setStats({
      age: Number(form.age),
      weightKg: Number(form.weightKg),
      heightCm: Number(form.heightCm),
      activityLevel: form.activityLevel,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl" style={{ background: "#1A1A2E" }}>
            <ArrowLeft size={18} style={{ color: "#888" }} />
          </button>
        )}
        <h1 className="font-heading font-bold text-white text-xl uppercase tracking-wide">Settings</h1>
      </div>

      {/* Body Stats */}
      <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
        <h3 className="text-xs font-bold uppercase mb-3" style={{ color: "#555" }}>Body Stats</h3>
        <div className="space-y-3">
          {[
            { key: "age", label: "Age", unit: "years" },
            { key: "weightKg", label: "Weight", unit: "kg" },
            { key: "heightCm", label: "Height", unit: "cm" },
          ].map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="text-xs font-bold w-14" style={{ color: "#555" }}>{f.label}</span>
              <input
                type="number"
                value={form[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none"
                style={{ background: "#0A0A12", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
              />
              <span className="text-xs" style={{ color: "#555" }}>{f.unit}</span>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold w-14" style={{ color: "#555" }}>Activity</span>
            <select
              value={form.activityLevel}
              onChange={(e) => setForm((p) => ({ ...p, activityLevel: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none appearance-none"
              style={{ background: "#0A0A12", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1"
          style={{ background: saved ? "#22C55E" : "#FF6B35" }}
        >
          {saved ? <><Check size={14} /> Saved</> : "Save Stats"}
        </button>
      </div>

      {/* Equipment */}
      <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
        <h3 className="text-xs font-bold uppercase mb-3" style={{ color: "#555" }}>Equipment</h3>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_LIST.map((eq) => {
            const selected = equipment.includes(eq.id);
            return (
              <button
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className="rounded-xl p-3 text-left transition-all flex items-center gap-2"
                style={{
                  background: selected ? "rgba(255,107,53,0.08)" : "#0A0A12",
                  border: `1px solid ${selected ? "#FF6B35" : "#1A1A2E"}`,
                }}
              >
                <span className="text-lg">{eq.icon}</span>
                <span className="text-[10px] font-bold" style={{ color: selected ? "#E8E8F0" : "#555" }}>
                  {eq.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
