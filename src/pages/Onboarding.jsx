import { useState } from "react";
import { ChevronRight, ChevronLeft, Dumbbell, Check } from "lucide-react";
import { EQUIPMENT_LIST, getAvailableTemplates } from "../data/equipment";
import { TEMPLATES } from "../data/templates";

const STEPS = ["Stats", "Equipment", "Template", "Ready"];
const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
  { value: "light", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
  { value: "active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [stats, setStats] = useState({ age: "", weightKg: "", heightCm: "", activityLevel: "moderate" });
  const [equipment, setEquipment] = useState(["dumbbells", "bodyweight"]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const available = getAvailableTemplates(TEMPLATES, equipment);

  const toggleEquipment = (id) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return stats.age && stats.weightKg && stats.heightCm;
    if (step === 1) return equipment.length > 0;
    if (step === 2) return selectedTemplate;
    return true;
  };

  const handleFinish = () => {
    onComplete({
      stats: {
        age: Number(stats.age),
        weightKg: Number(stats.weightKg),
        heightCm: Number(stats.heightCm),
        activityLevel: stats.activityLevel,
      },
      equipment,
      templateId: selectedTemplate,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A12" }}>
      {/* Header */}
      <div className="max-w-[480px] w-full mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Dumbbell size={24} style={{ color: "#FF6B35" }} />
          <span className="font-heading font-bold text-white text-lg uppercase tracking-widest">FitTrack</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-4 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="h-1 w-full rounded-full transition-colors"
                style={{ background: i <= step ? "#FF6B35" : "#1A1A2E" }}
              />
              <span className="text-[10px] font-bold" style={{ color: i <= step ? "#FF6B35" : "#555" }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[480px] w-full mx-auto px-4 overflow-y-auto pb-32">
        {/* Step 0: Body Stats */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-white text-xl uppercase tracking-wide">Your Stats</h2>
              <p className="text-xs mt-1" style={{ color: "#555" }}>Used to calculate your calorie targets</p>
            </div>

            {[
              { key: "age", label: "AGE", placeholder: "e.g. 28", unit: "years" },
              { key: "weightKg", label: "WEIGHT", placeholder: "e.g. 75", unit: "kg" },
              { key: "heightCm", label: "HEIGHT", placeholder: "e.g. 175", unit: "cm" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[10px] font-bold mb-1.5" style={{ color: "#555" }}>{f.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={stats[f.key]}
                    onChange={(e) => setStats((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{ background: "#0F0F1E", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
                  />
                  <span className="text-xs font-bold" style={{ color: "#555" }}>{f.unit}</span>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-[10px] font-bold mb-2" style={{ color: "#555" }}>ACTIVITY LEVEL</label>
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStats((p) => ({ ...p, activityLevel: opt.value }))}
                    className="w-full px-4 py-3 rounded-xl text-left transition-colors"
                    style={{
                      background: stats.activityLevel === opt.value ? "rgba(255,107,53,0.1)" : "#0F0F1E",
                      border: `1px solid ${stats.activityLevel === opt.value ? "#FF6B35" : "#1A1A2E"}`,
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: stats.activityLevel === opt.value ? "#FF6B35" : "#E8E8F0" }}>
                      {opt.label}
                    </span>
                    <span className="block text-[10px] mt-0.5" style={{ color: "#555" }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Equipment */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading font-bold text-white text-xl uppercase tracking-wide">Your Equipment</h2>
              <p className="text-xs mt-1" style={{ color: "#555" }}>Select everything you have access to</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_LIST.map((eq) => {
                const selected = equipment.includes(eq.id);
                return (
                  <button
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    className="rounded-2xl p-4 text-left transition-all"
                    style={{
                      background: selected ? "rgba(255,107,53,0.08)" : "#0F0F1E",
                      border: `1px solid ${selected ? "#FF6B35" : "#1A1A2E"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{eq.icon}</span>
                      {selected && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#FF6B35" }}>
                          <Check size={12} color="#fff" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold" style={{ color: selected ? "#E8E8F0" : "#555" }}>
                      {eq.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-center" style={{ color: "#555" }}>
              {available.length} of {TEMPLATES.length} programs available with your gear
            </p>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading font-bold text-white text-xl uppercase tracking-wide">Pick Your Program</h2>
              <p className="text-xs mt-1" style={{ color: "#555" }}>Choose based on your current goal</p>
            </div>

            <div className="space-y-3">
              {TEMPLATES.map((t) => {
                const isAvailable = available.some((a) => a.id === t.id);
                const isSelected = selectedTemplate === t.id;
                const missing = t.requiredEquipment.filter((e) => !equipment.includes(e));

                return (
                  <button
                    key={t.id}
                    onClick={() => isAvailable && setSelectedTemplate(t.id)}
                    disabled={!isAvailable}
                    className="w-full rounded-2xl p-4 text-left transition-all relative overflow-hidden"
                    style={{
                      background: isSelected ? `${t.color}12` : "#0F0F1E",
                      border: `1px solid ${isSelected ? t.color : "#1A1A2E"}`,
                      opacity: isAvailable ? 1 : 0.45,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{t.emoji}</span>
                          <span className="font-heading font-bold text-white text-sm uppercase">{t.label}</span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: "#888" }}>{t.tagline}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((d) => (
                              <div
                                key={d}
                                className="w-2 h-2 rounded-full"
                                style={{ background: d <= t.difficulty ? t.color : "#1A1A2E" }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: "#555" }}>{t.sessionDuration}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: t.color }}>
                          <Check size={14} color="#fff" />
                        </div>
                      )}
                    </div>

                    {!isAvailable && missing.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[10px]">🔒</span>
                        <span className="text-[10px] font-bold" style={{ color: "#555" }}>
                          Needs: {missing.join(", ")}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (() => {
          const t = TEMPLATES.find((t) => t.id === selectedTemplate);
          return (
            <div className="space-y-6 text-center py-8">
              <div className="text-5xl">{t?.emoji}</div>
              <div>
                <h2 className="font-heading font-bold text-white text-2xl uppercase tracking-wide">{t?.label}</h2>
                <p className="text-sm mt-1" style={{ color: "#888" }}>{t?.tagline}</p>
              </div>
              <div className="space-y-2">
                <div className="rounded-xl p-3 mx-auto max-w-[280px]" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
                  <p className="text-xs font-bold" style={{ color: "#555" }}>
                    {t?.schedule.length} training days/week
                  </p>
                </div>
                <div className="rounded-xl p-3 mx-auto max-w-[280px]" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
                  <p className="text-xs font-bold" style={{ color: "#555" }}>
                    {t?.sessionDuration} per session
                  </p>
                </div>
                <div className="rounded-xl p-3 mx-auto max-w-[280px]" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
                  <p className="text-xs font-bold" style={{ color: "#555" }}>
                    {t?.cardio.length} cardio sessions/week
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#555" }}>Your logs and weight history will be preserved if you switch programs later.</p>
            </div>
          );
        })()}
      </div>

      {/* Footer nav */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(transparent, #0A0A12 30%)" }}>
        <div className="max-w-[480px] mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: "#1A1A2E", color: "#888" }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={() => (step < 3 ? setStep((s) => s + 1) : handleFinish())}
            disabled={!canProceed()}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-30"
            style={{ background: step === 3 ? "linear-gradient(135deg, #FF6B35, #F59E0B)" : "#FF6B35" }}
          >
            {step === 3 ? "Get Started" : "Continue"}
            {step < 3 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
