import { createContext, useState, useCallback } from "react";

const USERS_KEY = "ft_users";

export const AuthContext = createContext(null);

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ft_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username, pin) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.pin === pin
    );
    if (found) {
      setUser(found);
      localStorage.setItem("ft_current_user", JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: "Invalid username or PIN" };
  }, []);

  const register = useCallback((username, pin) => {
    const users = getUsers();
    if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: "Username already exists" };
    }
    const newUser = {
      id: username.toLowerCase().replace(/\s+/g, "_"),
      username,
      pin,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    setUser(newUser);
    localStorage.setItem("ft_current_user", JSON.stringify(newUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ft_current_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
