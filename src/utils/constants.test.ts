import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AVATAR_COLORS,
  RECENT_WINNER_WEIGHTS,
  formatDate,
  getNextMonday,
} from './constants';

afterEach(() => {
  vi.useRealTimers();
});

describe('getNextMonday', () => {
  // タイムゾーン差異の影響を受けにくいよう正午(UTC)を基準にする
  const cases: Array<{ label: string; now: string; expected: string }> = [
    { label: '水曜日', now: '2026-07-01T12:00:00Z', expected: '2026-07-06' },
    { label: '日曜日', now: '2026-07-05T12:00:00Z', expected: '2026-07-06' },
    { label: '月曜日は翌週の月曜を返す', now: '2026-07-06T12:00:00Z', expected: '2026-07-13' },
  ];

  for (const { label, now, expected } of cases) {
    it(`${label} (${now}) -> ${expected}`, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(now));
      expect(getNextMonday()).toBe(expected);
    });
  }
});

describe('formatDate', () => {
  it('ローカル時刻で YYYY/M/D H:mm 形式にする', () => {
    const iso = new Date(2026, 0, 5, 9, 5).toISOString();
    expect(formatDate(iso)).toBe('2026/1/5 9:05');
  });
});

describe('定数', () => {
  it('アバターカラーは重複しない', () => {
    expect(new Set(AVATAR_COLORS).size).toBe(AVATAR_COLORS.length);
  });

  it('直近当選者の重みは1未満で単調増加(古いほど当たりやすい)', () => {
    for (const w of RECENT_WINNER_WEIGHTS) expect(w).toBeLessThan(1);
    const sorted = [...RECENT_WINNER_WEIGHTS].sort((a, b) => a - b);
    expect(sorted).toEqual([...RECENT_WINNER_WEIGHTS]);
  });
});
