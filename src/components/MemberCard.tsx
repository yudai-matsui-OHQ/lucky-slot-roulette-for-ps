import { useState } from 'react';
import type { Member } from '../types';

interface Props {
  member: Member;
  isLastWinner?: boolean;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

export function MemberCard({ member, isLastWinner, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onUpdate(member.id, name.trim());
      setEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-4 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: member.color }}
      >
        {member.name.charAt(0)}
      </div>

      {editing ? (
        <input
          className="flex-1 rounded bg-slate-700 px-2 py-1 text-white outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setName(member.name);
              setEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <span className="flex-1 text-white">{member.name}</span>
      )}

      {isLastWinner && (
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
          前回当選
        </span>
      )}

      <div className="flex gap-1">
        {editing ? (
          <button
            onClick={handleSave}
            className="rounded p-1.5 text-green-400 hover:bg-slate-700"
          >
            &#10003;
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
            title="編集"
          >
            &#9998;
          </button>
        )}

        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => onRemove(member.id)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-900/40"
            >
              削除
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-700"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400"
            title="削除"
          >
            &#128465;
          </button>
        )}
      </div>
    </div>
  );
}
