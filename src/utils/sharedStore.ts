/**
 * チーム共有データ (/api/state) と同期するクライアント側ストア。
 *
 * - 値は常に localStorage にもキャッシュし、初回描画はキャッシュから即座に行う。
 * - サーバーからの取得はページ読み込み時の1回のみ (ポーリングしない)。
 *   他の人の変更を見るにはブラウザを再読み込みする。自分の変更は即座に画面へ反映される。
 * - 書き込みは楽観的に反映し、裏でサーバーへ PUT する (キー単位の last-write-wins)。
 * - サーバーに未保存のキーは、このブラウザの localStorage にある既存データをアップロードする
 *   (localStorage 時代のデータの初回移行)。
 * - /api が存在しない環境 (`npm run dev`) では 'local' モードとなり、従来通り localStorage のみで動く。
 */

export type SyncStatus = 'connecting' | 'synced' | 'local' | 'error';

type Snapshot = Record<string, { v: unknown } | null>;

interface Options {
  endpoint?: string;
  fetchFn?: typeof fetch;
  storage?: Storage;
}

export function createSharedStore({
  endpoint = '/api/state',
  fetchFn = (...args) => fetch(...args),
  storage = globalThis.localStorage,
}: Options = {}) {
  const values = new Map<string, unknown>();
  const listeners = new Set<() => void>();
  // 書き込みの通し番号。取得中に書き込まれたキーを、古いサーバー値で上書きしないために使う。
  let writeSeq = 0;
  const lastWriteSeq = new Map<string, number>();
  let status: SyncStatus = 'connecting';
  let started = false;

  const notify = () => listeners.forEach((l) => l());

  function setStatus(next: SyncStatus) {
    if (status === next) return;
    status = next;
    notify();
  }

  function readCache(key: string): { v: unknown } | null {
    try {
      const raw = storage.getItem(key);
      return raw === null ? null : { v: JSON.parse(raw) };
    } catch {
      return null;
    }
  }

  function setLocal(key: string, value: unknown) {
    values.set(key, value);
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // ストレージが使えない環境でもメモリ上の値で動作を続ける
    }
    notify();
  }

  async function push(key: string, value: unknown) {
    try {
      const res = await fetchFn(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`);
      setStatus('synced');
    } catch (e) {
      console.warn(e);
      setStatus('error');
    }
  }

  async function refresh() {
    if (status === 'local') return;
    const startSeq = writeSeq;

    let data: Snapshot;
    try {
      const res = await fetchFn(endpoint, { cache: 'no-store' });
      // Vite の開発サーバーは未知のパスに index.html を返すため、JSON 以外 = API なしと判断する
      if (!res.headers.get('content-type')?.includes('application/json')) {
        setStatus('local');
        return;
      }
      if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
      data = await res.json();
    } catch (e) {
      console.warn(e);
      setStatus('error');
      return;
    }

    for (const [key, entry] of Object.entries(data)) {
      if ((lastWriteSeq.get(key) ?? 0) > startSeq) continue;
      if (entry) {
        if (JSON.stringify(entry.v) !== JSON.stringify(values.get(key))) setLocal(key, entry.v);
      } else {
        const cached = readCache(key);
        if (cached) void push(key, cached.v);
      }
    }
    setStatus('synced');
  }

  function start() {
    if (started || typeof window === 'undefined') return;
    started = true;
    void refresh();
  }

  return {
    /** 現在値。未ロードなら localStorage キャッシュ → initialValue の順で初期化する。 */
    get<T>(key: string, initialValue: T): T {
      if (!values.has(key)) {
        const cached = readCache(key);
        values.set(key, cached ? cached.v : initialValue);
      }
      return values.get(key) as T;
    },

    set<T>(key: string, value: T | ((prev: T) => T)) {
      const next = value instanceof Function ? value(values.get(key) as T) : value;
      lastWriteSeq.set(key, ++writeSeq);
      setLocal(key, next);
      if (status !== 'local') void push(key, next);
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      start();
      return () => {
        listeners.delete(listener);
      };
    },

    getStatus: () => status,
    refresh,
  };
}

export type SharedStore = ReturnType<typeof createSharedStore>;
