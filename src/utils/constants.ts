export const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
];

/**
 * 直近の当選者の選出確率を下げる重み係数。
 * index 0 = 前回当選者 ... index 4 = 5週前の当選者。
 * 通常メンバーの重みを 1 とした相対値（小さいほど当たりにくい）。
 * クールダウン明けに一気に重み1へ戻ると当選確率が急上昇して
 * 「元当選者がすぐ戻ってくる」印象につながるため、
 * 5週間かけて段階的に 1 へ復帰させる。
 */
export const RECENT_WINNER_WEIGHTS = [0.2, 0.35, 0.5, 0.7, 0.85] as const;

/**
 * eligible 各メンバーの抽選重みを算出する（重み付き抽選の入力）。
 * - recentWinnerIds に含まれるメンバーは、その直近度 (index 0 = 前回) に応じて
 *   RECENT_WINNER_WEIGHTS の値を重みにする（当たりにくくする）。
 * - 同一メンバーが複数回含まれる場合は最初の一致（＝最も直近）を採用し、最も強く減衰させる。
 * - RECENT_WINNER_WEIGHTS の範囲外（5週より前）や未当選のメンバーは通常重み 1。
 * 返す配列は eligibleIds と同じ順序・同じ長さ。
 */
export function recentWinnerWeights(
  eligibleIds: string[],
  recentWinnerIds: string[],
): number[] {
  return eligibleIds.map((id) => {
    const recency = recentWinnerIds.indexOf(id);
    return recency === -1 ? 1 : RECENT_WINNER_WEIGHTS[recency] ?? 1;
  });
}

export const STORAGE_KEYS = {
  members: 'facilitator-members',
  history: 'facilitator-history',
  lastWinner: 'facilitator-lastWinner',
} as const;

export function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  return nextMonday.toISOString().split('T')[0];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}
