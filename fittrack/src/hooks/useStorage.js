import { useState, useCallback } from "react";

const DEMO_PREFIX = "demo_";

export function useStorage(key, initialValue) {
  const localKey = `${DEMO_PREFIX}${key}`;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(localKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        localStorage.setItem(localKey, JSON.stringify(next));
        return next;
      });
    },
    [localKey]
  );

  return [storedValue, setValue];
}
