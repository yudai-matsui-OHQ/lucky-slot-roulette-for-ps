// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSharedStore } from './sharedStore';

beforeEach(() => localStorage.clear());

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** GET には snapshot を返し、PUT は記録して 204 を返す fetch モック */
function mockServer(snapshot: Record<string, { v: unknown } | null>) {
  const puts: { key: string; value: unknown }[] = [];
  const fetchFn = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      puts.push(JSON.parse(init.body as string));
      return new Response(null, { status: 204 });
    }
    return jsonResponse(snapshot);
  });
  return { fetchFn: fetchFn as unknown as typeof fetch, puts };
}

describe('createSharedStore', () => {
  it('未ロード時は localStorage キャッシュ、無ければ initialValue を返す', () => {
    localStorage.setItem('k-cached', JSON.stringify(['a']));
    const store = createSharedStore(mockServer({}));
    expect(store.get('k-cached', [])).toEqual(['a']);
    expect(store.get('k-empty', 'init')).toBe('init');
  });

  it('refresh でサーバーの値を反映し、localStorage にもキャッシュする', async () => {
    const store = createSharedStore(mockServer({ k: { v: [1, 2] } }));
    const listener = vi.fn();
    store.subscribe(listener);
    await store.refresh();
    expect(store.get('k', [])).toEqual([1, 2]);
    expect(localStorage.getItem('k')).toBe('[1,2]');
    expect(store.getStatus()).toBe('synced');
    expect(listener).toHaveBeenCalled();
  });

  it('サーバーに null が保存済みなら null を反映する (未保存と区別する)', async () => {
    localStorage.setItem('k', JSON.stringify('stale'));
    const { fetchFn, puts } = mockServer({ k: { v: null } });
    const store = createSharedStore({ fetchFn });
    await store.refresh();
    expect(store.get('k', 'x')).toBeNull();
    expect(puts).toEqual([]);
  });

  it('サーバー未保存のキーは localStorage の既存データをアップロードする (初回移行)', async () => {
    localStorage.setItem('k', JSON.stringify([{ id: 'm1' }]));
    const { fetchFn, puts } = mockServer({ k: null, other: null });
    const store = createSharedStore({ fetchFn });
    await store.refresh();
    expect(puts).toEqual([{ key: 'k', value: [{ id: 'm1' }] }]);
  });

  it('set は即座に反映し、サーバーへ PUT する (関数による更新にも対応)', async () => {
    const { fetchFn, puts } = mockServer({});
    const store = createSharedStore({ fetchFn });
    store.get('k', 1);
    store.set<number>('k', (prev) => prev + 1);
    expect(store.get('k', 0)).toBe(2);
    expect(localStorage.getItem('k')).toBe('2');
    await vi.waitFor(() => expect(puts).toEqual([{ key: 'k', value: 2 }]));
  });

  it('取得中に書き込まれたキーは、古いサーバー値で上書きしない', async () => {
    let resolveGet!: (r: Response) => void;
    const fetchFn = vi.fn((_url: RequestInfo | URL, init?: RequestInit) =>
      init?.method === 'PUT'
        ? Promise.resolve(new Response(null, { status: 204 }))
        : new Promise<Response>((r) => (resolveGet = r)),
    ) as unknown as typeof fetch;
    const store = createSharedStore({ fetchFn });
    const pending = store.refresh();
    store.set('k', 'new');
    resolveGet(jsonResponse({ k: { v: 'old' } }));
    await pending;
    expect(store.get('k', '')).toBe('new');
  });

  it('API が JSON を返さない環境 (vite dev) では local モードになり PUT しない', async () => {
    const fetchFn = vi.fn(
      async () => new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } }),
    ) as unknown as typeof fetch;
    const store = createSharedStore({ fetchFn });
    await store.refresh();
    expect(store.getStatus()).toBe('local');
    store.set('k', 1);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('k')).toBe('1');
  });

  it('保存に失敗したら error 状態になる', async () => {
    const fetchFn = vi.fn(async () => new Response('boom', { status: 500 })) as unknown as typeof fetch;
    const store = createSharedStore({ fetchFn });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    store.set('k', 1);
    await vi.waitFor(() => expect(store.getStatus()).toBe('error'));
  });
});
