export function secureRandomIndex(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * 重みの配列から1つのインデックスを公平に選ぶ（重みに比例した確率）。
 * crypto.getRandomValues() による [0, 1) の一様乱数を使用。
 */
export function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) return secureRandomIndex(weights.length);

  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // [0, 1) の一様乱数（2^32 で割る）
  const r = (array[0] / 2 ** 32) * total;

  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += Math.max(0, weights[i]);
    if (r < acc) return i;
  }
  return weights.length - 1;
}
