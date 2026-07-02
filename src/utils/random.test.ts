import { afterEach, describe, expect, it, vi } from 'vitest';
import { secureRandomIndex, weightedRandomIndex } from './random';

/** crypto.getRandomValues を固定値でスタブする */
function stubRandom(value: number) {
  return vi
    .spyOn(globalThis.crypto, 'getRandomValues')
    .mockImplementation(((array: Uint32Array) => {
      array[0] = value;
      return array;
    }) as typeof globalThis.crypto.getRandomValues);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('secureRandomIndex', () => {
  it('常に [0, max) の範囲を返す', () => {
    for (let i = 0; i < 200; i++) {
      const idx = secureRandomIndex(5);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
    }
  });

  it('乱数値の剰余でインデックスを決める', () => {
    stubRandom(7);
    expect(secureRandomIndex(5)).toBe(2); // 7 % 5
  });
});

describe('weightedRandomIndex', () => {
  it('重みが1箇所だけ正なら常にそのインデックスを返す', () => {
    for (let i = 0; i < 100; i++) {
      expect(weightedRandomIndex([0, 0, 1])).toBe(2);
      expect(weightedRandomIndex([1, 0, 0])).toBe(0);
    }
  });

  it('乱数が最小のとき最初の正の重みを選ぶ', () => {
    stubRandom(0);
    expect(weightedRandomIndex([0.25, 1, 1])).toBe(0);
  });

  it('乱数が最大付近のとき最後のインデックスを選ぶ', () => {
    stubRandom(2 ** 32 - 1);
    expect(weightedRandomIndex([1, 1, 1])).toBe(2);
  });

  it('負の重みは0として扱う', () => {
    for (let i = 0; i < 100; i++) {
      expect(weightedRandomIndex([-5, 0, 3])).toBe(2);
    }
  });

  it('重みの合計が0以下でも範囲内のインデックスを返す', () => {
    for (let i = 0; i < 100; i++) {
      const idx = weightedRandomIndex([0, 0, 0]);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(3);
    }
  });
});
