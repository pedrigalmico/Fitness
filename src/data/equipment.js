export const EQUIPMENT_LIST = [
  { id: "dumbbells",  label: "Dumbbells",          icon: "\u{1F3CB}\uFE0F" },
  { id: "barbell",    label: "Barbell / Connector", icon: "\u26A1" },
  { id: "treadmill",  label: "Treadmill",          icon: "\u{1F3C3}" },
  { id: "pullup_bar", label: "Pull-up Bar",        icon: "\u{1F51D}" },
  { id: "bench",      label: "Flat Bench",         icon: "\u{1FA91}" },
  { id: "bands",      label: "Resistance Bands",   icon: "\u{1F517}" },
  { id: "bodyweight", label: "Bodyweight Only",     icon: "\u{1F938}" },
];

export const getAvailableTemplates = (templates, equipment) =>
  templates.filter((t) => t.requiredEquipment.every((e) => equipment.includes(e)));

export const getMissingEquipment = (template, equipment) =>
  template.requiredEquipment.filter((e) => !equipment.includes(e));
