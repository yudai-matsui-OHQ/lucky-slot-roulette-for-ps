import { useEffect } from 'react';

/**
 * active の間、ページを閉じる・再読み込みする・別ページへ移動する操作に対して
 * ブラウザの「このサイトを離れますか？」確認ダイアログを表示する。
 *
 * 抽選後に「確定」を押さずにページを閉じて結果が失われるのを防ぐために使う。
 * ※ ダイアログの文言はブラウザ固定で、独自メッセージは表示できない (beforeunload の仕様)。
 */
export function useLeaveConfirmation(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 古いブラウザ (Chrome < 119 など) は returnValue の設定が必要
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}
