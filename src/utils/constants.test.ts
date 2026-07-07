import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AVATAR_COLORS,
  RECENT_WINNER_WEIGHTS,
  STORAGE_KEYS,
  formatDate,
  getNextMonday,
  recentWinnerWeights,
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

  it('STORAGE_KEYS のリテラルは既存ユーザーデータとの互換のため固定(変更=マイグレーション課題)', () => {
    expect(STORAGE_KEYS).toEqual({
      members: 'facilitator-members',
      history: 'facilitator-history',
      lastWinner: 'facilitator-lastWinner',
      excludeLast: 'facilitator-excludeLast',
    });
  });

  it('直近当選者の重みは1未満で単調増加(古いほど当たりやすい)', () => {
    for (const w of RECENT_WINNER_WEIGHTS) expect(w).toBeLessThan(1);
    const sorted = [...RECENT_WINNER_WEIGHTS].sort((a, b) => a - b);
    expect(sorted).toEqual([...RECENT_WINNER_WEIGHTS]);
  });
});

describe('recentWinnerWeights', () => {
  it('直近当選のないメンバーは通常重み1', () => {
    expect(recentWinnerWeights(['a', 'b', 'c'], [])).toEqual([1, 1, 1]);
    expect(recentWinnerWeights(['a', 'b'], ['x', 'y'])).toEqual([1, 1]);
  });

  it('直近度(index)に応じて RECENT_WINNER_WEIGHTS の値を適用する', () => {
    // recentWinnerIds[0]=前回 ... [4]=5週前。eligible の各IDの重みが対応する係数になる。
    const eligible = ['w0', 'w1', 'w2', 'w3', 'w4'];
    const recent = ['w0', 'w1', 'w2', 'w3', 'w4'];
    expect(recentWinnerWeights(eligible, recent)).toEqual([
      ...RECENT_WINNER_WEIGHTS,
    ]);
  });

  it('前回当選者は最も強く減衰する(RECENT_WINNER_WEIGHTS[0])', () => {
    expect(recentWinnerWeights(['prev', 'other'], ['prev'])).toEqual([
      RECENT_WINNER_WEIGHTS[0],
      1,
    ]);
  });

  it('返す重みは eligible と同じ順序・長さ', () => {
    // recent 側の順序ではなく eligible 側の順序に従う
    const weights = recentWinnerWeights(['c', 'a', 'b'], ['a', 'b']);
    expect(weights).toEqual([1, RECENT_WINNER_WEIGHTS[0], RECENT_WINNER_WEIGHTS[1]]);
  });

  it('5週より前(範囲外)の当選者は通常重み1に戻る', () => {
    const recent = ['r0', 'r1', 'r2', 'r3', 'r4', 'old'];
    // index 5 は RECENT_WINNER_WEIGHTS の範囲外 → 1
    expect(recentWinnerWeights(['old'], recent)).toEqual([1]);
  });

  it('同一メンバーが複数回含まれる場合は最も直近(最初の一致)の重みを使う', () => {
    // 直近1週前(index1)と3週前(index3)に当選 → より強い index1 の減衰を採用
    const recent = ['someone', 'dup', 'other', 'dup', 'more'];
    expect(recentWinnerWeights(['dup'], recent)).toEqual([
      RECENT_WINNER_WEIGHTS[1],
    ]);
  });

  it('eligible が空なら空配列', () => {
    expect(recentWinnerWeights([], ['a', 'b'])).toEqual([]);
  });
});
