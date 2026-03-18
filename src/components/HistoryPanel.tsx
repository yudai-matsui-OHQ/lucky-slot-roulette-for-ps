import type { SelectionRecord } from '../types';
import { formatDate } from '../utils/constants';

interface Props {
  history: SelectionRecord[];
}

export function HistoryPanel({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-slate-400">まだ抽選履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-white">抽選履歴</h2>

      <div className="space-y-2">
        {[...history].reverse().map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3"
          >
            <div>
              <p className="font-bold text-white">{record.memberName}</p>
              <p className="text-xs text-slate-500">
                対象週: {record.weekOf}〜
              </p>
            </div>
            <p className="text-sm text-slate-500">
              {formatDate(record.selectedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
