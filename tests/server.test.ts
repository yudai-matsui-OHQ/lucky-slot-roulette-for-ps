import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHARED_STORAGE_KEYS } from '../src/utils/constants';

// Upstash Redis をメモリ上の Map で置き換える
const redisData = new Map<string, unknown>();
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      mget: async (...keys: string[]) => keys.map((k) => redisData.get(k) ?? null),
      set: async (key: string, value: unknown) => {
        redisData.set(key, value);
        return 'OK';
      },
    }),
  },
}));

const { default: middleware } = await import('../middleware');
const { GET, PUT } = await import('../api/state');

const basic = (cred: string) => ({ authorization: `Basic ${btoa(cred)}` });

describe('middleware (Basic 認証)', () => {
  beforeEach(() => {
    vi.stubEnv('BASIC_AUTH_USER', 'team');
    vi.stubEnv('BASIC_AUTH_PASSWORD', 'p:ss');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('正しい認証情報なら通過させる', () => {
    const res = middleware(new Request('https://x/', { headers: basic('team:p:ss') }));
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it.each([
    ['ヘッダーなし', {}],
    ['パスワード違い', basic('team:wrong')],
    ['不正な Base64', { authorization: 'Basic !!!' }],
  ])('%s は 401 と WWW-Authenticate を返す', (_label, headers) => {
    const res = middleware(new Request('https://x/api/state', { headers }));
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toContain('Basic');
  });

  it('環境変数が未設定なら全て拒否する (fail closed)', () => {
    vi.stubEnv('BASIC_AUTH_PASSWORD', '');
    const res = middleware(new Request('https://x/', { headers: basic('team:') }));
    expect(res.status).toBe(500);
  });
});

describe('/api/state', () => {
  beforeEach(() => redisData.clear());

  const put = (body: unknown) =>
    PUT(new Request('https://x/api/state', { method: 'PUT', body: JSON.stringify(body) }));

  it('GET は共有キー全てを返し、未保存は null', async () => {
    const body = (await (await GET()).json()) as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual([...SHARED_STORAGE_KEYS].sort());
    expect(Object.values(body).every((v) => v === null)).toBe(true);
  });

  it('PUT した値 (null を含む) を GET で { v } として読み戻せる', async () => {
    expect((await put({ key: 'facilitator-members', value: [{ id: 'm1' }] })).status).toBe(204);
    expect((await put({ key: 'facilitator-lastWinner', value: null })).status).toBe(204);
    const body = (await (await GET()).json()) as Record<string, unknown>;
    expect(body['facilitator-members']).toEqual({ v: [{ id: 'm1' }] });
    expect(body['facilitator-lastWinner']).toEqual({ v: null });
  });

  it('許可されていないキーや value 欠落は 400', async () => {
    expect((await put({ key: 'facilitator-drawMode', value: 'slot' })).status).toBe(400);
    expect((await put({ key: 'facilitator-members' })).status).toBe(400);
    expect(redisData.size).toBe(0);
  });
});
