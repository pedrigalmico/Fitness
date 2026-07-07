import { useContext, useCallback, useRef } from "react";
import { StorageContext, readLocal } from "../storage/context";

/**
 * useStorage — per-user key/value state, live-synced via StorageProvider.
 *
 * Returns [value, setValue, loaded].
 */
export function useStorage(key, initialValue) {
  const { uid, data, setValue: setProviderValue, loaded } = useContext(StorageContext);

  const initialRef = useRef(initialValue);

  let value;
  if (key in data) {
    value = data[key];
  } else {
    const local = readLocal(uid ? `${uid}_${key}` : key);
    value = local === undefined ? initialValue : local;
  }

  const setValue = useCallback(
    (update) => setProviderValue(key, update, initialRef.current),
    [setProviderValue, key]
  );

  return [value, setValue, loaded];
}
