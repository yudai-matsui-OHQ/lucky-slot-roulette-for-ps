import { useState, useCallback, useRef } from 'react';
import type { Member, RoulettePhase } from '../types';
import { secureRandomIndex } from '../utils/random';

export const CARD_HEIGHT = 80;

/* ── Tuning knobs ────────────────────────────────── */
const CYCLES = 15;
const SPIN_DURATION = 7.0;
const CLICK_MIN = 0.06;
const CLICK_MAX = 0.40;

/* ── Hook ────────────────────────────────────────── */
export function useRoulette() {
  const [phase, setPhase] = useState<RoulettePhase>('idle');
  const [winner, setWinner] = useState<Member | null>(null);
  const [offset, setOffset] = useState(0);
  const [spinMembers, setSpinMembers] = useState<Member[] | null>(null);
  const rafRef = useRef(0);
  const timerRef = useRef(0);
  const settledRef = useRef(0); // last settled offset (for resume)

  const cancel = () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
  };

  /* ── spin() ──────────────────────────────────── */
  const spin = useCallback((eligible: Member[]) => {
    if (eligible.length < 2) return;

    const winnerIdx = secureRandomIndex(eligible.length);
    const selected = eligible[winnerIdx];

    // Normalise starting position to prevent overflow on repeat spins
    const cycleSize = eligible.length * CARD_HEIGHT;
    const startOffset =
      cycleSize > 0 ? settledRef.current % cycleSize : 0;

    // How many cards to advance from current position to land on winner
    const startIdx = Math.round(startOffset / CARD_HEIGHT) % eligible.length;
    const stepsToWinner =
      (winnerIdx - startIdx + eligible.length) % eligible.length;
    const distance =
      CYCLES * eligible.length * CARD_HEIGHT + stepsToWinner * CARD_HEIGHT;
    const targetOffset = startOffset + distance;

    setWinner(selected);
    setSpinMembers(eligible);
    setPhase('spinning');
    setOffset(startOffset); // normalise (same visual, smaller number)
    cancel();

    const t0 = performance.now();

    const loop = (now: number) => {
      const t = Math.min((now - t0) / (SPIN_DURATION * 1000), 1);

      // Base position via easing curve
      const easedT = spinCurve(t);
      const basePos = startOffset + distance * easedT;

      // Click-modulation depth (stronger when slower)
      const nSpeed = spinCurveDeriv(t);
      const depth =
        CLICK_MIN +
        (CLICK_MAX - CLICK_MIN) *
          Math.pow(Math.max(0, 1 - nSpeed / 1.8), 1.5);

      // Sin offset: zero at card boundaries, creates snap-past / linger effect
      const maxAmp = (CARD_HEIGHT / (2 * Math.PI)) * 0.85;
      const amp = maxAmp * depth;
      const clickOff =
        amp * Math.sin((basePos / CARD_HEIGHT) * 2 * Math.PI);

      setOffset(Math.max(0, basePos + clickOff));

      if (t >= 1) {
        // Settle exactly on the winner card
        setOffset(targetOffset);
        settledRef.current = targetOffset;
        setPhase('landed');
        timerRef.current = window.setTimeout(
          () => setPhase('celebrating'),
          300,
        );
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  /* ── reset() ─────────────────────────────────── */
  const reset = useCallback((clearPosition = false) => {
    cancel();
    setPhase('idle');
    setWinner(null);
    setSpinMembers(null);
    if (clearPosition) {
      setOffset(0);
      settledRef.current = 0;
    }
  }, []);

  return { phase, winner, offset, spinMembers, spin, reset };
}

/* ── Easing helpers ──────────────────────────────── */

function spinCurve(t: number): number {
  // シンプルなeaseOutQuint: 最初は速く、徐々に減速
  return 1 - Math.pow(1 - t, 5);
}

function spinCurveDeriv(t: number): number {
  const dt = 0.002;
  return (
    (spinCurve(Math.min(t + dt, 1)) - spinCurve(Math.max(t - dt, 0))) /
    (2 * dt)
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}
