import { afterEach, describe, expect, it, vi } from 'vitest';
import { secureRandomIndex, weightedRandomIndex, selectWinnerIndex } from './random';

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

describe('selectWinnerIndex', () => {
  it('eligible が1件なら常に 0 を返す', () => {
    for (let i = 0; i < 100; i++) {
      expect(selectWinnerIndex(['a'], [])).toBe(0);
    }
  });

  it('直近当選者(index 0=前回)の重みが下がっても、通常メンバーが1人なら決定的にその1人を選ぶ', () => {
    // 'a','b' の2人。'a' は前回当選者なので重み0.2、'b' は通常重み1。
    // 乱数を最大付近に固定すると累積重みの後方=通常メンバー 'b'(index 1)へ落ちる。
    stubRandom(2 ** 32 - 1);
    expect(selectWinnerIndex(['a', 'b'], ['a'])).toBe(1);
  });

  it('乱数が最小のとき先頭(重み>0)のインデックスを選ぶ', () => {
    stubRandom(0);
    expect(selectWinnerIndex(['a', 'b', 'c'], [])).toBe(0);
  });
});
