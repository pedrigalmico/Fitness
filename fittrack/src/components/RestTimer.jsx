import { useEffect, useRef, useState } from "react";
import { X, Plus, Minus, Timer } from "lucide-react";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function RestTimer({ active, onDismiss }) {
  // active: { duration: number, label: string, startedAt: number } | null
  const [now, setNow] = useState(() => Date.now());
  const [extraSec, setExtraSec] = useState(0);
  const beepedRef = useRef(false);

  useEffect(() => {
    setExtraSec(0);
    beepedRef.current = false;
  }, [active?.startedAt]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const elapsed = Math.floor((now - active.startedAt) / 1000);
  const totalDuration = active.duration + extraSec;
  const remaining = Math.max(0, totalDuration - elapsed);
  const overdue = elapsed > totalDuration;
  const pct = Math.min(100, (elapsed / totalDuration) * 100);

  // Beep + vibrate once when we cross zero
  if (remaining === 0 && !beepedRef.current) {
    beepedRef.current = true;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate([120, 80, 120]); } catch {}
    }
    try {
      const Ctx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (Ctx) {
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        o.start();
        o.stop(ctx.currentTime + 0.45);
      }
    } catch {}
  }

  const color = overdue ? "#22C55E" : remaining <= 10 ? "#F59E0B" : "#FF6B35";

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-[464px]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0) + 76px)" }}
    >
      <div
        className="rounded-2xl px-3 py-2.5 shadow-2xl"
        style={{ background: "#0F0F1E", border: `1px solid ${color}55` }}
      >
        <div className="flex items-center gap-2">
          <Timer size={16} style={{ color }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: "#888" }}>
              Rest · {active.label}
            </p>
            <p className="text-lg font-black leading-none mt-0.5" style={{ color }}>
              {overdue ? "+" : ""}{fmt(overdue ? elapsed - totalDuration : remaining)}
            </p>
          </div>
          <button
            onClick={() => setExtraSec((s) => Math.max(-active.duration + 5, s - 15))}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#1A1A2E", color: "#aaa" }}
            aria-label="Subtract 15 seconds"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => setExtraSec((s) => s + 15)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#1A1A2E", color: "#aaa" }}
            aria-label="Add 15 seconds"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#1A1A2E", color: "#aaa" }}
            aria-label="Skip rest"
          >
            <X size={14} />
          </button>
        </div>
        <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: "#1A1A2E" }}>
          <div
            className="h-full transition-all"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}
