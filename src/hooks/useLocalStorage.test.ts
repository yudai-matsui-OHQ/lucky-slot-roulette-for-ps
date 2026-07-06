import { describe, expect, it } from 'vitest';
import { readStorageValue } from './useLocalStorage';

describe('readStorageValue', () => {
  it('有効な JSON はパースして返す', () => {
    expect(readStorageValue('{"a":1}', {})).toEqual({ a: 1 });
    expect(readStorageValue('[1,2,3]', [])).toEqual([1, 2, 3]);
    expect(readStorageValue('42', 0)).toBe(42);
    expect(readStorageValue('"hi"', '')).toBe('hi');
    expect(readStorageValue('true', false)).toBe(true);
    expect(readStorageValue('null', 'fallback')).toBeNull();
  });

  it('キー未設定(null)は initialValue にフォールバックする', () => {
    expect(readStorageValue(null, 'default')).toBe('default');
    const init = { members: [] as string[] };
    expect(readStorageValue(null, init)).toBe(init);
  });

  it('空文字も initialValue にフォールバックする(元の truthy 判定と等価)', () => {
    expect(readStorageValue('', 'default')).toBe('default');
  });

  it('不正な JSON が保存されていた場合は initialValue にフォールバックする', () => {
    expect(readStorageValue('{壊れた', 'default')).toBe('default');
    expect(readStorageValue('[1,2,', [])).toEqual([]);
    expect(readStorageValue('undefined', null)).toBeNull();
    expect(readStorageValue('{"a":}', { a: 0 })).toEqual({ a: 0 });
  });

  it('パース失敗時は渡した initialValue の参照をそのまま返す', () => {
    const init = { fallback: true };
    expect(readStorageValue('not-json', init)).toBe(init);
  });
});
