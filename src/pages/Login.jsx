import { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { Dumbbell, UserPlus, LogIn } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const { login, register, loginWithGoogle, resetPassword } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    setNotice("");
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.success && result.error) setError(result.error);
  };

  const handleForgotPassword = async () => {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email above first, then tap Forgot password");
      return;
    }
    const result = await resetPassword(email.trim());
    if (result.success) setNotice("Password reset email sent. Check your inbox.");
    else setError(result.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (isRegister && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = isRegister
      ? await register(email.trim(), password, name.trim())
      : await login(email.trim(), password);
    setLoading(false);

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
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 disabled:opacity-50 mb-4"
            style={{ background: "#fff", color: "#1a1a1a" }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#1a1a1a", borderTopColor: "transparent" }} />
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "#1A1A2E" }} />
            <span className="text-[10px] font-bold uppercase" style={{ color: "#555" }}>or use email</span>
            <div className="flex-1 h-px" style={{ background: "#1A1A2E" }} />
          </div>

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
            {isRegister && (
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#555" }}>
                  NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mico"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                  style={{ background: "#0A0A12", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "#555" }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                style={{ background: "#0A0A12", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "#555" }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                style={{ background: "#0A0A12", border: "1px solid #1A1A2E", color: "#E8E8F0" }}
              />
            </div>

            {!isRegister && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-bold hover:underline"
                style={{ color: "#555" }}
              >
                Forgot password?
              </button>
            )}

            {error && (
              <p className="text-xs font-bold text-red-400 text-center">{error}</p>
            )}
            {notice && (
              <p className="text-xs font-bold text-center" style={{ color: "#22C55E" }}>{notice}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF6B35, #F59E0B)" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                  {isRegister ? "Create Account" : "Sign In"}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "#555" }}>
          Synced securely via cloud
        </p>
      </div>
    </div>
  );
}
