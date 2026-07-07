// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

// jsdom は localStorage を提供する。テスト間の汚染を防ぐため毎回クリアする。
beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('useLocalStorage (フック本体の統合テスト)', () => {
  it('キー未設定なら initialValue を返す', () => {
    const { result } = renderHook(() => useLocalStorage('k-empty', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('マウント時に既存の localStorage 値を復元する', () => {
    localStorage.setItem('k-existing', JSON.stringify({ n: 7 }));
    const { result } = renderHook(() => useLocalStorage('k-existing', { n: 0 }));
    expect(result.current[0]).toEqual({ n: 7 });
  });

  it('setValue で state を更新し localStorage に JSON で永続化する', () => {
    const { result } = renderHook(() => useLocalStorage('k-write', 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem('k-write')).toBe('42');
  });

  it('setValue に関数を渡すと前の値を受け取って更新する', () => {
    const { result } = renderHook(() => useLocalStorage('k-fn', 1));
    act(() => result.current[1]((prev) => prev + 1));
    act(() => result.current[1]((prev) => prev + 10));
    expect(result.current[0]).toBe(12);
    expect(localStorage.getItem('k-fn')).toBe('12');
  });

  it('書き込み→再マウントで永続化された値を読み戻せる（読み書き往復）', () => {
    const first = renderHook(() => useLocalStorage('k-roundtrip', 'a'));
    act(() => first.result.current[1]('b'));
    first.unmount();
    const second = renderHook(() => useLocalStorage('k-roundtrip', 'a'));
    expect(second.result.current[0]).toBe('b');
  });

  it('不正な JSON が保存済みでも initialValue にフォールバックする', () => {
    localStorage.setItem('k-broken', '{壊れた');
    const { result } = renderHook(() => useLocalStorage('k-broken', 'safe'));
    expect(result.current[0]).toBe('safe');
  });

  // 仕様: このフックは key 変更時に storedValue を再読込しない（意図的な設計）。
  // 読み込みは useState の初期化子（初回マウント時のみ実行）で行われ、key を監視する
  // useEffect は持たない。全呼び出し側が STORAGE_KEYS の定数キーを渡すため
  // （2026-07-08 に App.tsx / useMembers.ts を確認、動的キーのユースケースは無い）、
  // フックを単純に保つ判断。詳細は useLocalStorage.ts の JSDoc を参照。
  // このテストはその不変条件（key を切り替えても前キーの値のまま）を回帰として固定する。
  it('rerender で key を変えても storedValue は再読込されない（stable-key 不変条件を固定）', () => {
    localStorage.setItem('k-A', JSON.stringify('valA'));
    localStorage.setItem('k-B', JSON.stringify('valB'));
    const { result, rerender } = renderHook(
      ({ k }) => useLocalStorage(k, 'init'),
      { initialProps: { k: 'k-A' } },
    );
    expect(result.current[0]).toBe('valA');
    rerender({ k: 'k-B' });
    // 再読込されないため k-A の値のまま（k-B の 'valB' にはならない）
    expect(result.current[0]).toBe('valA');
  });
});
