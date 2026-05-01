export default function StatCard({ icon, label, value, color = "#FF6B35" }) {
  return (
    <div
      className="rounded-2xl p-4 flex-1 min-w-0"
      style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-bold uppercase" style={{ color: "#555" }}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
