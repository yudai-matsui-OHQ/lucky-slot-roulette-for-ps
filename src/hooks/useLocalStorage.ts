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

/**
 * localStorage と同期する useState。
 *
 * 【設計上の不変条件】`key` は「コンポーネントの生存中は不変」を前提とする。
 * localStorage の読み込みは useState の初期化子で **初回マウント時に一度だけ** 行い、
 * `key` を監視する useEffect を持たない。したがって同一マウント中に `key` を変えても
 * storedValue は再読込されず、前のキーの値が据え置かれる（`useLocalStorage.hook.test.ts`
 * で固定済み）。これは意図的な仕様: 全呼び出し側が `STORAGE_KEYS.*` の定数キーを渡しており
 * （App.tsx / useMembers.ts、2026-07-08 時点）、動的キーのユースケースが存在しないため、
 * フックを単純に保つことを優先している。
 *
 * もし将来「1つのコンポーネントで key を切り替えて別データを読む」必要が出たら、
 * 呼び出し側で React の `key` prop によりコンポーネントを再マウントするか、
 * このフックに key 監視の再読込 useEffect を追加すること（その際は上記テストの期待値も更新する）。
 */
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
