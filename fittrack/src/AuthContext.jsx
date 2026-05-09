import { createContext } from "react";

export const AuthContext = createContext(null);

const DEMO_USER = { uid: "demo", email: "demo@fittrack.app", username: "Demo User" };

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ user: DEMO_USER, login: async () => {}, register: async () => {}, logout: async () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}
