'use client';

import { useSyncExternalStore } from 'react';
import { JPY_TO_THB_RATE as FALLBACK_RATE } from '@/data/mockData';

const REFRESH_MS = 5 * 60 * 1000;

let currentRate = FALLBACK_RATE;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

async function refresh() {
  try {
    const res = await fetch('/api/live-data', { cache: 'no-store' });
    const data = await res.json();
    const rate = Number(data?.forex?.rate);
    if (data?.success && Number.isFinite(rate) && rate > 0 && rate !== currentRate) {
      currentRate = rate;
      listeners.forEach((l) => l());
    }
  } catch {
    // keep last known rate
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    refresh();
    timer = setInterval(refresh, REFRESH_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Live JPY→THB rate (shared, auto-refreshed every 5 min). Falls back to static rate. */
export function useJpyThbRate(): number {
  return useSyncExternalStore(
    subscribe,
    () => currentRate,
    () => FALLBACK_RATE
  );
}
