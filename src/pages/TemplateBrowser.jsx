import { useState } from "react";
import { ArrowLeft, Check, Lock, ChevronRight, X } from "lucide-react";
import { TEMPLATES } from "../data/templates";
import { useStorage } from "../hooks/useStorage";
import { getAvailableTemplates, getMissingEquipment } from "../data/equipment";
import ConfirmModal from "../components/ConfirmModal";

function TemplatePreview({ template, equipment, onSelect, onClose }) {
  const missing = getMissingEquipment(template, equipment);
  const isAvailable = missing.length === 0;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "#0A0A12" }}>
      <div className="max-w-[480px] mx-auto px-4 py-6 pb-28">
        <button onClick={onClose} className="p-2 rounded-xl mb-4" style={{ background: "#1A1A2E" }}>
          <X size={18} style={{ color: "#888" }} />
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">{template.emoji}</span>
          <h2 className="font-heading font-bold text-white text-xl uppercase tracking-wide mt-2">{template.label}</h2>
          <p className="text-xs mt-1" style={{ color: "#888" }}>{template.tagline}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((d) => (
                <div key={d} className="w-2 h-2 rounded-full" style={{ background: d <= template.difficulty ? template.color : "#1A1A2E" }} />
              ))}
            </div>
            <span className="text-[10px] font-bold" style={{ color: "#555" }}>{template.sessionDuration}</span>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
          <h3 className="text-xs font-bold uppercase mb-3" style={{ color: "#555" }}>Weekly Schedule</h3>
          <div className="space-y-2">
            {template.schedule.map((day) => (
              <div key={day.key} className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: template.color }}>{day.day}</span>
                <span className="text-xs font-bold text-white">{day.label}</span>
              </div>
            ))}
            {template.cardio.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: "#ef4444" }}>{c.day}</span>
                <span className="text-xs font-bold" style={{ color: "#888" }}>{c.type} {c.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Day */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
          <h3 className="text-xs font-bold uppercase mb-3" style={{ color: "#555" }}>
            Sample: {template.schedule[0]?.label}
          </h3>
          <div className="space-y-1.5">
            {template.schedule[0]?.exercises.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between">
                <span className="text-xs text-white font-bold">{ex.name}</span>
                <span className="text-[10px]" style={{ color: "#555" }}>
                  {ex.sets ? `${ex.sets}x${ex.reps}` : ex.work}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: "#555" }}>Nutrition Strategy</h3>
          <p className="text-xs" style={{ color: "#888" }}>
            Calories: TDEE {template.calorieAdjustment >= 0 ? "+" : ""}{template.calorieAdjustment} | Protein: {template.proteinMultiplier}x bodyweight
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(transparent, #0A0A12 30%)" }}>
        <div className="max-w-[480px] mx-auto">
          {isAvailable ? (
            <button
              onClick={() => onSelect(template.id)}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${template.color}, ${template.color}cc)` }}
            >
              Start This Program <ChevronRight size={16} />
            </button>
          ) : (
            <div className="text-center py-3">
              <p className="text-xs font-bold" style={{ color: "#555" }}>
                <Lock size={12} className="inline mr-1" />
                Requires: {missing.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TemplateBrowser({ onBack }) {
  const [equipment] = useStorage("ft_equipment", []);
  const [currentTemplate] = useStorage("ft_template", "recomp");
  const [, setTemplate] = useStorage("ft_template", "recomp");
  const [, setTemplateStart] = useStorage("ft_template_start", null);
  const [preview, setPreview] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const available = getAvailableTemplates(TEMPLATES, equipment);

  const handleSelect = (id) => {
    if (id === currentTemplate) {
      setPreview(null);
      onBack?.();
      return;
    }
    setConfirmId(id);
  };

  const confirmSwitch = () => {
    setTemplate(confirmId);
    setTemplateStart(new Date().toISOString().split("T")[0]);
    setConfirmId(null);
    setPreview(null);
    onBack?.();
  };

  const confirmTemplate = confirmId ? TEMPLATES.find((t) => t.id === confirmId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl" style={{ background: "#1A1A2E" }}>
            <ArrowLeft size={18} style={{ color: "#888" }} />
          </button>
        )}
        <h1 className="font-heading font-bold text-white text-xl uppercase tracking-wide">Programs</h1>
      </div>

      <div className="space-y-3">
        {TEMPLATES.map((t) => {
          const isAvail = available.some((a) => a.id === t.id);
          const isCurrent = t.id === currentTemplate;
          const missing = getMissingEquipment(t, equipment);

          return (
            <button
              key={t.id}
              onClick={() => setPreview(t)}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={{
                background: isCurrent ? `${t.color}12` : "#0F0F1E",
                border: `1px solid ${isCurrent ? t.color : "#1A1A2E"}`,
                opacity: isAvail ? 1 : 0.45,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-white text-sm uppercase">{t.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: t.color, color: "#fff" }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "#555" }}>{t.tagline}</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "#555" }} />
              </div>
              {!isAvail && (
                <div className="mt-2 flex items-center gap-1">
                  <Lock size={10} style={{ color: "#555" }} />
                  <span className="text-[10px]" style={{ color: "#555" }}>Needs: {missing.join(", ")}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {preview && (
        <TemplatePreview
          template={preview}
          equipment={equipment}
          onSelect={handleSelect}
          onClose={() => setPreview(null)}
        />
      )}

      <ConfirmModal
        open={!!confirmId}
        title={`Switch to ${confirmTemplate?.label}?`}
        message="Your workout plan, cardio schedule, and nutrition targets will update. Your logs, streak, and weight history are safe."
        confirmLabel="Switch Program"
        confirmColor={confirmTemplate?.color || "#FF6B35"}
        onConfirm={confirmSwitch}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
