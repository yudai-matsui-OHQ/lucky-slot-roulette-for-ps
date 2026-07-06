import { useState, useCallback } from 'react';

/**
 * localStorage から取り出した生文字列を安全にパースする。
 * - null / 空文字（キー未設定）は initialValue にフォールバック。
 * - 不正な JSON が保存されていた場合も例外を握りつぶし initialValue を返す。
 * 元の `item ? JSON.parse(item) : initialValue` を try/catch で包んだ挙動と等価。
 */
export function readStorageValue<T>(raw: string | null, initialValue: T): T {
  if (!raw) return initialValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      return readStorageValue(localStorage.getItem(key), initialValue);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
