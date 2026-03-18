import { useState } from 'react';
import type { View, SelectionRecord } from '../types';
import { useMembers } from '../hooks/useMembers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';
import { Header } from './Header';
import { RouletteView } from './RouletteView';
import { MemberManager } from './MemberManager';
import { HistoryPanel } from './HistoryPanel';

export default function App() {
  const [view, setView] = useState<View>('roulette');
  const [excludeLast, setExcludeLast] = useLocalStorage('facilitator-excludeLast', true);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Header
          currentView={view}
          onViewChange={setView}
          excludeLast={excludeLast}
          onToggleExclude={() => setExcludeLast((v) => !v)}
        />

        {view === 'roulette' && (
          <RouletteView
            members={members}
            lastWinner={lastWinner}
            excludeLast={excludeLast}
            getEligibleMembers={getEligibleMembers}
            onWin={(member) => setLastWinnerId(member.id)}
            onAddHistory={handleAddHistory}
          />
        )}

        {view === 'members' && (
          <MemberManager
            members={members}
            lastWinnerId={lastWinnerId}
            onAdd={addMember}
            onUpdate={updateMember}
            onRemove={removeMember}
          />
        )}

        {view === 'history' && <HistoryPanel history={history} />}
      </div>
    </div>
  );
}
