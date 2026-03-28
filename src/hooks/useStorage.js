import { useState, useCallback, useContext, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../AuthContext";

/**
 * useStorage — reads/writes to Firestore per user.
 *
 * Firestore structure: users/{uid}/data/{key} → { value: ... }
 *
 * Falls back to localStorage for immediate responsiveness,
 * then syncs with Firestore in the background.
 */
export function useStorage(key, initialValue) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  // Local fallback key
  const localKey = uid ? `${uid}_${key}` : key;

  // Initialize from localStorage first (fast)
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(localKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const hasLoadedFirestore = useRef(false);

  // Load from Firestore on mount (overwrites localStorage if exists)
  useEffect(() => {
    if (!uid) return;
    hasLoadedFirestore.current = false;

    const docRef = doc(db, "users", uid, "data", key);
    getDoc(docRef)
      .then((snap) => {
        if (snap.exists()) {
          const val = snap.data().value;
          setStoredValue(val);
          localStorage.setItem(localKey, JSON.stringify(val));
        }
        hasLoadedFirestore.current = true;
      })
      .catch(() => {
        hasLoadedFirestore.current = true;
      });
  }, [uid, key, localKey]);

  // Write to both localStorage and Firestore
  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? value(prev) : value;

        // Save to localStorage immediately
        localStorage.setItem(localKey, JSON.stringify(next));

        // Save to Firestore in background
        if (uid) {
          const docRef = doc(db, "users", uid, "data", key);
          setDoc(docRef, { value: next, updatedAt: new Date().toISOString() }).catch(() => {});
        }

        return next;
      });
    },
    [uid, key, localKey]
  );

  return [storedValue, setValue];
}
