export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, confirmColor = "#FF6B35" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-[360px] rounded-2xl p-6" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
        <h3 className="text-base font-heading font-bold text-white uppercase tracking-wide mb-2">{title}</h3>
        <p className="text-sm mb-6" style={{ color: "#888" }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{ background: "#1A1A2E", color: "#888" }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
