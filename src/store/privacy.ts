import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'aprov.dataHidden';

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function applyToPage(hidden: boolean) {
  if (hidden) document.documentElement.dataset.private = '';
  else delete document.documentElement.dataset.private;
}

let hidden = readStored();
applyToPage(hidden);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeStored(value: boolean): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
    return true;
  } catch {
    return false;
  }
}

export function toggleDataHidden() {
  hidden = !hidden;
  applyToPage(hidden);
  writeStored(hidden);
  listeners.forEach((listener) => listener());
}

export function useDataHidden(): boolean {
  return useSyncExternalStore(subscribe, () => hidden);
}
