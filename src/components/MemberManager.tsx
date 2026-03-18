import { useState } from 'react';
import type { Member } from '../types';
import { MemberCard } from './MemberCard';

interface Props {
  members: Member[];
  lastWinnerId: string | null;
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

export function MemberManager({ members, lastWinnerId, onAdd, onUpdate, onRemove }: Props) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-white">メンバー管理</h2>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg bg-slate-800 px-4 py-2 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="名前を入力..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          追加
        </button>
      </div>

      {members.length === 0 ? (
        <p className="py-8 text-center text-slate-500">
          メンバーを追加してください
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              isLastWinner={m.id === lastWinnerId}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      <p className="text-sm text-slate-500">
        {members.length} 人のメンバー
      </p>
    </div>
  );
}
