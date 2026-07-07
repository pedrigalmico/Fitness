import { createContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Athlete",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Try again later."
          : err.message;
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        username: displayName,
      });
      return { success: true };
    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "Email already registered"
          : err.code === "auth/weak-password"
          ? "Password must be at least 6 characters"
          : err.code === "auth/invalid-email"
          ? "Invalid email address"
          : err.message;
      return { success: false, error: msg };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        return { success: false, error: "" };
      }
      if (err.code === "auth/popup-blocked") {
        // Popups are blocked in some installed-PWA contexts; full-page redirect works there
        await signInWithRedirect(auth, googleProvider);
        return { success: true };
      }
      const msg =
        err.code === "auth/operation-not-allowed"
          ? "Google sign-in isn't enabled yet. Enable it in Firebase Console → Authentication → Sign-in method."
          : err.code === "auth/network-request-failed"
          ? "Network error. Check your connection and try again."
          : err.message;
      return { success: false, error: msg };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      const msg =
        err.code === "auth/invalid-email"
          ? "Invalid email address"
          : err.code === "auth/user-not-found"
          ? "No account found with that email"
          : err.message;
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A12" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "#FF6B35", borderTopColor: "transparent" }} />
          <p className="text-xs font-bold" style={{ color: "#555" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
