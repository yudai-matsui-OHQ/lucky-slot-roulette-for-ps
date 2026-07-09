import { useState } from 'react';
import type { View, SelectionRecord, DrawMode } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';
import { Header } from './Header';
import { RouletteView } from './RouletteView';
import { SlotArcadeView } from './SlotArcadeView';
import { MemberManager } from './MemberManager';
import { HistoryPanel } from './HistoryPanel';

export default function App() {
  const [view, setView] = useState<View>('roulette');
  const [excludeLast, setExcludeLast] = useLocalStorage(STORAGE_KEYS.excludeLast, true);
  const [drawMode, setDrawMode] = useLocalStorage<DrawMode>(
    STORAGE_KEYS.drawMode,
    'drum',
  );
  const {
    members,
    lastWinner,
    lastWinnerId,
    setLastWinnerId,
    addMember,
    removeMember,
    updateMember,
    getEligibleMembers,
  } = useMembers();

  const [history, setHistory] = useLocalStorage<SelectionRecord[]>(
    STORAGE_KEYS.history,
    [],
  );

  const handleAddHistory = (record: SelectionRecord) => {
    setHistory((prev) => [...prev, record]);
  };

  // 直近の当選者ID（index 0 = 前回 ... 4 = 5週前）。重み付き抽選で確率を下げるために使用。
  // RECENT_WINNER_WEIGHTS の長さ（5週分）に合わせて直近5件を参照する。
  const recentWinnerIds = history
    .slice(-5)
    .reverse()
    .map((r) => r.memberId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Header
          currentView={view}
          onViewChange={setView}
          excludeLast={excludeLast}
          onToggleExclude={() => setExcludeLast((v) => !v)}
        />

        <div className={view === 'roulette' ? '' : 'hidden'}>
          {/* 抽選モードトグル: ドラム ⇄ スロット */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg bg-slate-800/60 p-1">
              <button
                onClick={() => setDrawMode('drum')}
                className={`rounded-md px-5 py-1.5 text-sm font-bold transition ${
                  drawMode === 'drum'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ドラム
              </button>
              <button
                onClick={() => setDrawMode('slot')}
                className={`rounded-md px-5 py-1.5 text-sm font-bold transition ${
                  drawMode === 'slot'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                スロット
              </button>
            </div>
          </div>

          {drawMode === 'drum' ? (
            <RouletteView
              members={members}
              lastWinner={lastWinner}
              excludeLast={excludeLast}
              recentWinnerIds={recentWinnerIds}
              getEligibleMembers={getEligibleMembers}
              onWin={(member) => setLastWinnerId(member.id)}
              onAddHistory={handleAddHistory}
            />
          ) : (
            <SlotArcadeView
              members={members}
              lastWinner={lastWinner}
              excludeLast={excludeLast}
              recentWinnerIds={recentWinnerIds}
              getEligibleMembers={getEligibleMembers}
              onWin={(member) => setLastWinnerId(member.id)}
              onAddHistory={handleAddHistory}
            />
          )}
        </div>

        <div className={view === 'members' ? '' : 'hidden'}>
          <MemberManager
            members={members}
            lastWinnerId={lastWinnerId}
            onAdd={addMember}
            onUpdate={updateMember}
            onRemove={removeMember}
          />
        </div>

        <div className={view === 'history' ? '' : 'hidden'}>
          <HistoryPanel history={history} />
        </div>
      </div>
    </div>
  );
}
