"use client";

import { useSyncExternalStore } from "react";

/**
 * Lightweight, client-only notification store for CoatLab.
 *
 * Notifications are produced by real user actions (e.g. a completed
 * prediction). Read state persists locally so unread markers survive
 * refreshes. No external notification service is used.
 */

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  /** Epoch milliseconds. */
  createdAt: number;
  read: boolean;
  kind: "success" | "info" | "warning";
}

const STORAGE_KEY = "coatlab.notifications.v1";

let state: NotificationItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NotificationItem[];
      if (Array.isArray(parsed)) state = parsed;
    }
  } catch {
    // Corrupt or unavailable storage — start empty.
    state = [];
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode); notifications still work in-memory.
  }
}

export function getNotifications(): NotificationItem[] {
  ensureHydrated();
  return state;
}

export function getUnreadCount(): number {
  ensureHydrated();
  return state.filter((n) => !n.read).length;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Prepend a real notification triggered by a user action. */
export function notify({
  title,
  message,
  kind = "info",
}: {
  title: string;
  message: string;
  kind?: NotificationItem["kind"];
}) {
  ensureHydrated();
  const item: NotificationItem = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    createdAt: Date.now(),
    read: false,
    kind,
  };
  state = [item, ...state].slice(0, 50);
  persist();
  emit();
}

export function markNotificationRead(id: string) {
  ensureHydrated();
  const next = state.map((n) => (n.id === id ? { ...n, read: true } : n));
  if (next.some((n, i) => n.read !== state[i]?.read)) {
    state = next;
    persist();
    emit();
  }
}

export function markAllNotificationsRead() {
  ensureHydrated();
  if (state.every((n) => n.read)) return;
  state = state.map((n) => ({ ...n, read: true }));
  persist();
  emit();
}

export function useNotifications() {
  const items = useSyncExternalStore(subscribe, getNotifications, getNotifications);
  const unreadCount = useSyncExternalStore(subscribe, getUnreadCount, getUnreadCount);
  return { items, unreadCount };
}