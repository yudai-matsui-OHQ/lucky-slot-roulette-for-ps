import { next } from '@vercel/functions/middleware';

/**
 * Vercel Routing Middleware による Basic 認証。
 * 静的ファイル (index.html / assets) と /api/* の両方を保護する。
 *
 * 認証情報は Vercel の環境変数 BASIC_AUTH_USER / BASIC_AUTH_PASSWORD で設定する。
 * 未設定のまま公開されるのを防ぐため、未設定時は 500 を返して全リクエストを拒否する (fail closed)。
 *
 * ※ `npm run dev` (Vite) ではこのファイルは実行されない。Vercel 上でのみ有効。
 */
export default function middleware(request: Request): Response {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !password) {
    return new Response('Basic auth is not configured.', { status: 500 });
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const decoded = atob(encoded);
      const sep = decoded.indexOf(':');
      if (decoded.slice(0, sep) === user && decoded.slice(sep + 1) === password) {
        return next();
      }
    } catch {
      // 不正な Base64 は未認証として扱う
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Lucky Slot Roulette", charset="UTF-8"' },
  });
}
