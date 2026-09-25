import { Redis } from '@upstash/redis';

/**
 * チーム共有データの読み書き API (Vercel Function)。
 *
 * - GET /api/state            → { [key]: { v: value } | null } を返す (null = 未保存)
 * - PUT /api/state {key, value} → 1キー分を丸ごと上書き保存する (last-write-wins)
 *
 * 値は `{ v: value }` で包んで保存する。これにより「未保存」と「null を保存済み」
 * (例: lastWinner をクリアした状態) を区別できる。
 *
 * 保存先は Upstash Redis。Vercel Marketplace から連携すると
 * KV_REST_API_URL / KV_REST_API_TOKEN が自動で設定され、Redis.fromEnv() が読み取る。
 * アクセス制御はルートの middleware.ts (Basic 認証) が担う。
 */

// クライアント側 SHARED_STORAGE_KEYS (src/utils/constants.ts) と一致させること。
// api/ は src/ と別にバンドルされるため、import せずに複製している。
const SHARED_KEYS = [
  'facilitator-members',
  'facilitator-history',
  'facilitator-lastWinner',
  'facilitator-excludeLast',
] as const;
type SharedKey = (typeof SHARED_KEYS)[number];

const REDIS_PREFIX = 'lucky-slot:';
const MAX_BODY_BYTES = 256 * 1024;

const redis = Redis.fromEnv();

function isSharedKey(key: unknown): key is SharedKey {
  return typeof key === 'string' && (SHARED_KEYS as readonly string[]).includes(key);
}

export async function GET(): Promise<Response> {
  const stored = await redis.mget<({ v: unknown } | null)[]>(
    ...SHARED_KEYS.map((k) => REDIS_PREFIX + k),
  );
  const body = Object.fromEntries(SHARED_KEYS.map((k, i) => [k, stored[i] ?? null]));
  return Response.json(body, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request): Promise<Response> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return new Response('Payload too large.', { status: 413 });
  }

  let body: { key?: unknown; value?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return new Response('Invalid JSON.', { status: 400 });
  }
  if (!isSharedKey(body.key) || !('value' in body)) {
    return new Response('Invalid key or missing value.', { status: 400 });
  }

  await redis.set(REDIS_PREFIX + body.key, { v: body.value });
  return new Response(null, { status: 204 });
}
