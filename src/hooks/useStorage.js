import { useState, useCallback, useContext } from "react";
import { AuthContext } from "../AuthContext";

export function useStorage(key, initialValue) {
  const { user } = useContext(AuthContext);
  const prefixedKey = user ? `${user.id}_${key}` : key;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(prefixedKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        localStorage.setItem(prefixedKey, JSON.stringify(next));
        return next;
      });
    },
    [prefixedKey]
  );

  return [storedValue, setValue];
}
