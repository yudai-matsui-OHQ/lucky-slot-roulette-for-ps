import { useCallback, useSyncExternalStore } from 'react';
import { createSharedStore } from '../utils/sharedStore';
import type { SharedStorageKey } from '../utils/constants';

const sharedStore = createSharedStore();

/**
 * チーム全員で共有される useState。API は useLocalStorage と同じ。
 * 同期の仕組みは src/utils/sharedStore.ts を参照。
 */
export function useSharedState<T>(key: SharedStorageKey, initialValue: T) {
  const value = useSyncExternalStore(sharedStore.subscribe, () =>
    sharedStore.get(key, initialValue),
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => sharedStore.set(key, next),
    [key],
  );

  return [value, setValue] as const;
}

export function useSyncStatus() {
  return useSyncExternalStore(sharedStore.subscribe, sharedStore.getStatus);
}
