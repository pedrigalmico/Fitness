import { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { Dumbbell, UserPlus, LogIn } from "lucide-react";

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !pin.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    const result = isRegister ? register(username.trim(), pin) : login(username.trim(), pin);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0A0A12" }}>
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #FF6B35, #F59E0B)" }}
          >
            <Dumbbell size={40} color="#fff" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase font-heading">FitTrack</h1>
          <p style={{ color: "#555" }} className="mt-1 text-sm">
            Your personal fitness companion
          </p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "#0F0F1E", border: "1px solid #1A1A2E" }}>
          <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: "#0A0A12" }}>
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className="flex-1 py-2.5 text-sm font-bold transition-colors"
              style={{
                background: !isRegister ? "#FF6B35" : "transparent",
                color: !isRegister ? "#fff" : "#555",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className="flex-1 py-2.5 text-sm font-bold transition-colors"
              style={{
                background: isRegister ? "#FF6B35" : "transparent",
                color: isRegister ? "#fff" : "#555",
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "#555" }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Mico"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-colors"
                style={{
                  background: "#0A0A12",
                  border: "1px solid #1A1A2E",
                  color: "#E8E8F0",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "#555" }}>
                PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4-digit PIN"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-colors"
                style={{
                  background: "#0A0A12",
                  border: "1px solid #1A1A2E",
                  color: "#E8E8F0",
                }}
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FF6B35, #F59E0B)" }}
            >
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "#555" }}>
          Data stored locally on this device
        </p>
      </div>
    </div>
  );
}
