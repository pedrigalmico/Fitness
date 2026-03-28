import { useStorage } from "../hooks/useStorage";
import { getTemplateById } from "../data/planEngine";

export default function GoalBadge({ onTap }) {
  const [templateId] = useStorage("ft_template", "recomp");
  const [startDate] = useStorage("ft_template_start", null);

  const template = getTemplateById(templateId);
  const daysIn = startDate
    ? Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1)
    : 1;

  return (
    <button
      onClick={onTap}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-80"
      style={{ background: `${template.color}15`, border: `1px solid ${template.color}30` }}
    >
      <span>{template.emoji}</span>
      <span style={{ color: template.color }}>{template.label}</span>
      <span style={{ color: "#555" }}>Day {daysIn}</span>
    </button>
  );
}
