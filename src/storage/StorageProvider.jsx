import { useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../AuthContext";
import { StorageContext, readLocal, writeLocal } from "./context";

/**
 * StorageProvider — syncs all of a user's key/value data with Firestore.
 *
 * Firestore structure: users/{uid}/data/{key} → { value }
 *
 * One collection-level onSnapshot for the whole app: many short-lived
 * per-doc listeners (subscribed/unsubscribed on every page switch) trip a
 * firebase-js-sdk watch-stream bug ("INTERNAL ASSERTION FAILED ... ca9")
 * that permanently poisons the SDK's async queue.
 *
 * localStorage seeds the first render so the UI never flashes empty.
 * Writes made before the first server snapshot arrives are queued and
 * replayed on top of the server value — otherwise a fresh device with
 * empty local state could overwrite cloud data.
 */
export function StorageProvider({ children }) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(!uid);
  const dataRef = useRef(data);
  const loadedRef = useRef(!uid);
  const pendingRef = useRef({}); // key -> [update fns]

  useEffect(() => {
    if (!uid) {
      loadedRef.current = true;
      setLoaded(true);
      return;
    }
    loadedRef.current = false;
    pendingRef.current = {};
    setLoaded(false);
    dataRef.current = {};
    setData({});

    const colRef = collection(db, "users", uid, "data");
    let unsub = null;
    let offlineFallback = null;

    const finishLoad = (serverData) => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      const next = { ...serverData };
      // Replay writes queued before load on top of the server state
      for (const [key, updates] of Object.entries(pendingRef.current)) {
        let base = key in next ? next[key] : readLocal(`${uid}_${key}`);
        for (const update of updates) base = update(base);
        next[key] = base;
        setDoc(doc(db, "users", uid, "data", key), {
          value: base,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }
      pendingRef.current = {};
      for (const [key, value] of Object.entries(next)) writeLocal(`${uid}_${key}`, value);
      dataRef.current = next;
      setData(next);
      setLoaded(true);
    };

    // Deferred so StrictMode's throwaway dev mount never opens a watch
    // stream (instant subscribe/unsubscribe is what angers the SDK).
    const start = setTimeout(() => {
      // If the server can't be reached at all (fresh offline install),
      // fall back to localStorage so the app isn't stuck loading.
      offlineFallback = setTimeout(() => finishLoad({}), 4000);

      unsub = onSnapshot(
        colRef,
        (snap) => {
          if (!loadedRef.current) {
            if (snap.metadata.fromCache) return; // wait for server truth
            clearTimeout(offlineFallback);
            const serverData = {};
            snap.forEach((d) => { serverData[d.id] = d.data().value; });
            finishLoad(serverData);
            return;
          }
          // Live updates from other devices; skip our own write echoes
          const changes = {};
          snap.docChanges().forEach((ch) => {
            if (ch.type === "removed" || ch.doc.metadata.hasPendingWrites) return;
            changes[ch.doc.id] = ch.doc.data().value;
          });
          if (Object.keys(changes).length) {
            dataRef.current = { ...dataRef.current, ...changes };
            setData(dataRef.current);
            for (const [k, v] of Object.entries(changes)) writeLocal(`${uid}_${k}`, v);
          }
        },
        () => {
          // Permission/transport error — keep working from localStorage
          clearTimeout(offlineFallback);
          finishLoad({});
        }
      );
    }, 0);

    return () => {
      clearTimeout(start);
      clearTimeout(offlineFallback);
      try {
        unsub?.();
      } catch { /* SDK queue may already be failed; don't crash unmount */ }
    };
  }, [uid]);

  const setValue = useCallback(
    (key, update, initialValue) => {
      const localKey = uid ? `${uid}_${key}` : key;
      const stored = key in dataRef.current ? dataRef.current[key] : readLocal(localKey);
      const base = stored === undefined ? initialValue : stored;
      const next = typeof update === "function" ? update(base) : update;

      dataRef.current = { ...dataRef.current, [key]: next };
      setData(dataRef.current);
      writeLocal(localKey, next);

      if (!uid) return;
      if (loadedRef.current) {
        setDoc(doc(db, "users", uid, "data", key), {
          value: next,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      } else {
        const wrapped = (b) => {
          const resolved = b === undefined ? initialValue : b;
          return typeof update === "function" ? update(resolved) : update;
        };
        (pendingRef.current[key] ||= []).push(wrapped);
      }
    },
    [uid]
  );

  const ctx = useMemo(() => ({ uid, data, setValue, loaded }), [uid, data, setValue, loaded]);

  return <StorageContext.Provider value={ctx}>{children}</StorageContext.Provider>;
}
