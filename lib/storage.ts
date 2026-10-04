"use client";

import { useCallback, useSyncExternalStore } from "react";

// Small localStorage-backed lists (wishlist, recently viewed), kept in sync
// across components and tabs. Swap for an account-backed API later.

const EVENT = "hs-storage";
const EMPTY: string[] = [];
const cache = new Map<string, { raw: string | null; value: string[] }>();

function read(key: string): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  let value = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : EMPTY;
    if (Array.isArray(parsed)) value = parsed;
  } catch {}
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStoredList(key: string) {
  const list = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
  const toggle = useCallback(
    (id: string) => {
      const cur = read(key);
      write(key, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    },
    [key],
  );
  const pushFront = useCallback(
    (id: string, max = 6) => {
      const cur = read(key);
      if (cur[0] === id) return;
      write(key, [id, ...cur.filter((x) => x !== id)].slice(0, max));
    },
    [key],
  );
  return { list, toggle, pushFront };
}

export const WISHLIST_KEY = "hs-wishlist";
export const RECENT_KEY = "hs-recent";
