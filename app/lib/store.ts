'use client';

import { useSyncExternalStore } from 'react';
import type { RawPanel } from './panel';

export type Entry = {
  id: string;
  title: string;
  version: number;
  createdAt: number;
  pitch: string;
  raw: RawPanel;
  inputTokens: number;
  cost: number;
};

const KEY = 'pitchpanel.entries.v1';
const MAX_ENTRIES = 40;
const EMPTY: Entry[] = [];

let entries: Entry[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    entries = Array.isArray(parsed) ? parsed.filter((e) => e && e.raw?.judges?.length === 5) : EMPTY;
  } catch {
    entries = EMPTY;
  }
  loaded = true;
}

function snapshot() {
  if (!loaded) load();
  return entries;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    load();
    cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function commit(next: Entry[]) {
  entries = next.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Private mode or a full quota: the list still works for this tab, it just will not persist.
  }
  listeners.forEach((l) => l());
}

export const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function addEntry(input: Omit<Entry, 'id' | 'version' | 'createdAt'>) {
  const current = snapshot();
  const version = current.filter((e) => sameTitle(e.title, input.title)).reduce((m, e) => Math.max(m, e.version), 0) + 1;
  const entry: Entry = { ...input, id: crypto.randomUUID(), version, createdAt: Date.now() };
  commit([entry, ...current]);
  return entry;
}

export function removeEntry(id: string) {
  commit(snapshot().filter((e) => e.id !== id));
}

export function useEntries() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function versionsOf(all: Entry[], title: string) {
  return all.filter((e) => sameTitle(e.title, title)).sort((a, b) => a.version - b.version);
}

export function previousOf(all: Entry[], entry: Entry) {
  return versionsOf(all, entry.title)
    .filter((e) => e.version < entry.version)
    .at(-1);
}
