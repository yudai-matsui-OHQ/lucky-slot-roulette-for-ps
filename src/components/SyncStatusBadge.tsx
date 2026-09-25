import { useSyncStatus } from '../hooks/useSharedState';
import type { SyncStatus } from '../utils/sharedStore';

const LABELS: Record<SyncStatus, { text: string; className: string }> = {
  connecting: { text: '同期中…', className: 'text-slate-500' },
  synced: { text: '● チームで共有中', className: 'text-emerald-500/80' },
  local: { text: 'このブラウザにのみ保存しています', className: 'text-slate-500' },
  error: {
    text: '⚠ サーバーと同期できません（変更はこのブラウザにのみ保存されています）',
    className: 'text-amber-400',
  },
};

export function SyncStatusBadge() {
  const { text, className } = LABELS[useSyncStatus()];
  return <p className={`mt-10 text-center text-xs ${className}`}>{text}</p>;
}
