import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import type { Member, SelectionRecord } from '../types';
import { SlotMachine } from './SlotMachine';
import { WinnerReveal } from './WinnerReveal';
import { useRoulette } from '../hooks/useRoulette';
import { getNextMonday } from '../utils/constants';

interface Props {
  members: Member[];
  lastWinner: Member | null;
  excludeLast: boolean;
  getEligibleMembers: (excludeLast: boolean) => Member[];
  onWin: (member: Member) => void;
  onAddHistory: (record: SelectionRecord) => void;
}

export function RouletteView({
  members,
  lastWinner,
  excludeLast,
  getEligibleMembers,
  onWin,
  onAddHistory,
}: Props) {
  const { phase, winner, offset, spinMembers, spin, reset } = useRoulette();
  const [saved, setSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const eligible = getEligibleMembers(excludeLast);

  const handleSpin = () => {
    if (eligible.length < 2) return;
    spin(eligible);
  };

  const handleConfirm = () => {
    if (!winner) return;
    onWin(winner);
    onAddHistory({
      id: crypto.randomUUID(),
      memberId: winner.id,
      memberName: winner.name,
      weekOf: getNextMonday(),
      selectedAt: new Date().toISOString(),
    });
    reset(true);
    setSaved(false);
  };

  const handleScreenshot = async () => {
    if (!resultRef.current) return;
    try {
      const dataUrl = await toPng(resultRef.current, {
        backgroundColor: '#0f172a',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `lucky-person-${winner?.name ?? 'result'}.png`;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  const handleReset = () => {
    reset();
    setSaved(false);
    spin(eligible);
  };

  if (members.length < 2) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-slate-400">
          メンバーを2人以上登録してください
        </p>
        <p className="mt-2 text-sm text-slate-600">
          「メンバー」タブから追加できます
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Last winner info */}
      {lastWinner && excludeLast && (
        <div className="mb-4 rounded-lg bg-slate-800/50 px-4 py-2 text-sm text-slate-400">
          前回: <span className="text-amber-400">{lastWinner.name}</span> さん（除外中）
        </div>
      )}

      {/* Slot machine */}
      <SlotMachine members={spinMembers ?? eligible} phase={phase} offset={offset} />

      {/* Controls */}
      {phase === 'idle' && (
        <button
          onClick={handleSpin}
          disabled={eligible.length < 2}
          className="mt-8 animate-pulse rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-12 py-4 text-2xl font-black text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] active:scale-95 disabled:animate-none disabled:opacity-40"
        >
          SPIN!
        </button>
      )}

      {phase === 'spinning' && (
        <div className="mt-8 text-lg text-blue-400 animate-pulse">
          抽選中...
        </div>
      )}

      {/* Winner reveal */}
      {phase === 'celebrating' && winner && (
        <>
          <div ref={resultRef} className="px-4 pb-4">
            <WinnerReveal winner={winner} />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleConfirm}
              className="rounded-lg bg-green-600 px-6 py-2 font-bold text-white transition hover:bg-green-500"
            >
              確定
            </button>
            <button
              onClick={handleScreenshot}
              className="rounded-lg bg-slate-700 px-6 py-2 font-bold text-white transition hover:bg-slate-600"
            >
              {saved ? '保存しました!' : '結果を保存'}
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg bg-slate-700 px-6 py-2 font-bold text-white transition hover:bg-slate-600"
            >
              やり直す
            </button>
          </div>
        </>
      )}
    </div>
  );
}
