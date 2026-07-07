import { createContext } from "react";

export const StorageContext = createContext(null);

export const readLocal = (localKey) => {
  try {
    const item = localStorage.getItem(localKey);
    return item === null ? undefined : JSON.parse(item);
  } catch {
    return undefined;
  }
};

export const writeLocal = (localKey, value) => {
  try {
    localStorage.setItem(localKey, JSON.stringify(value));
  } catch { /* storage full or unavailable */ }
};
