import { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw } from "lucide-react";

function parseRestSeconds(rest) {
  if (!rest) return 0;
  const str = String(rest).toLowerCase().trim();
  // "2-3min" → take the first number, convert to seconds
  const minMatch = str.match(/(\d+)(?:\s*-\s*\d+)?\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  // "75s" or "90s"
  const secMatch = str.match(/(\d+)\s*s/);
  if (secMatch) return parseInt(secMatch[1]);
  // "60s after pair"
  const pairMatch = str.match(/(\d+)\s*s?\s*after/);
  if (pairMatch) return parseInt(pairMatch[1]);
  // plain number
  const num = parseInt(str);
  return isNaN(num) ? 60 : num;
}

export default function RestTimer({ restTime, color, onDismiss }) {
  const totalSeconds = parseRestSeconds(restTime);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef(null);

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  useEffect(() => {
    setRemaining(totalSeconds);
    setIsFinished(false);
  }, [totalSeconds, restTime]);

  useEffect(() => {
    if (remaining <= 0) {
      setIsFinished(true);
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [restTime]);

  const handleRestart = useCallback(() => {
    setRemaining(totalSeconds);
    setIsFinished(false);
  }, [totalSeconds]);

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}:${String(sec).padStart(2, "0")}` : `${sec}s`;
  };

  // SVG ring
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2 transition-all"
      style={{
        background: isFinished ? "rgba(34,197,94,0.1)" : `${color}08`,
        border: `1px solid ${isFinished ? "rgba(34,197,94,0.3)" : `${color}20`}`,
      }}
    >
      {/* Timer Ring */}
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1A1A2E"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isFinished ? "#22C55E" : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-black text-xs ${isFinished ? "animate-pulse" : ""}`}
            style={{ color: isFinished ? "#22C55E" : "#E8E8F0" }}
          >
            {isFinished ? "GO!" : formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase" style={{ color: isFinished ? "#22C55E" : "#555" }}>
          {isFinished ? "Rest complete — next set!" : "Resting..."}
        </p>
        <p className="text-[10px]" style={{ color: "#444" }}>
          {restTime} rest
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={handleRestart}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "#1A1A2E" }}
          title="Restart"
        >
          <RotateCcw size={12} style={{ color: "#555" }} />
        </button>
        <button
          onClick={onDismiss}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "#1A1A2E" }}
          title="Skip"
        >
          <X size={12} style={{ color: "#555" }} />
        </button>
      </div>
    </div>
  );
}

export { parseRestSeconds };
