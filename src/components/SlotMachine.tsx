import { useMemo } from 'react';
import type { Member, RoulettePhase } from '../types';
import { CARD_HEIGHT } from '../hooks/useRoulette';

interface Props {
  members: Member[];
  phase: RoulettePhase;
  offset: number;
}

const VIEWPORT_HEIGHT = CARD_HEIGHT * 1.5;
const CENTER_PAD = (VIEWPORT_HEIGHT - CARD_HEIGHT) / 2;
const REPEAT_COUNT = 20;

export function SlotMachine({ members, phase, offset }: Props) {
  const repeatedMembers = useMemo(
    () => Array.from({ length: REPEAT_COUNT }, () => members).flat(),
    [members],
  );

  return (
    <div className="relative mx-auto w-72 overflow-hidden rounded-xl border-4 border-slate-500/50 bg-slate-900 shadow-[0_0_30px_rgba(59,130,246,0.15),inset_0_2px_20px_rgba(0,0,0,0.5)]">
      {/* Top gradient fade */}
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-10 bg-gradient-to-b from-slate-900 to-transparent" />

      {/* Viewport */}
      <div style={{ height: VIEWPORT_HEIGHT }} className="relative overflow-hidden">
        <div
          className={phase === 'spinning' ? 'will-change-transform' : ''}
          style={{
            transform: `translateY(${CENTER_PAD - offset}px)`,
          }}
        >
          {repeatedMembers.map((member, i) => (
            <div
              key={`${member.id}-${i}`}
              style={{ height: CARD_HEIGHT }}
              className="flex items-center justify-center gap-3 px-6"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0)}
              </div>
              <span className="min-w-0 flex-1 truncate text-xl font-bold text-white">
                {member.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-10 bg-gradient-to-t from-slate-900 to-transparent" />

      {/* Glow during spin */}
      {phase === 'spinning' && (
        <div className="pointer-events-none absolute inset-0 z-20 animate-pulse rounded-xl shadow-[inset_0_0_40px_rgba(59,130,246,0.2)]" />
      )}
    </div>
  );
}
