import { useSyncExternalStore } from 'react';
import type { Toast, ToastTone } from '../types';

const TOAST_MS = 5000;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function showToast(tone: ToastTone, text: string) {
  const id = nextId++;
  toasts = [...toasts, { id, tone, text }];
  emit();
  setTimeout(() => dismissToast(id), TOAST_MS);
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, () => toasts);
}
