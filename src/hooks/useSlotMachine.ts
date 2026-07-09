import { useState, useCallback, useRef, useEffect } from 'react';
import type { Member } from '../types';
import { selectWinnerIndex, secureRandomIndex } from '../utils/random';

export const ITEM_H = 76; // セル高(px)
export const LAND = 20; // 勝利グリッド手前に積むダミーセル数
const REEL_DURATIONS = [1.3, 2.1, 2.9] as const; // 各リールの停止トランジション秒
const STOP_TIMES = [1400, 2200, 3000] as const; // 各リール停止タイミング(ms)

export type SlotPhase = 'idle' | 'spinning' | 'win';
export type LineType = 'row0' | 'row1' | 'row2' | 'diagD' | 'diagU';

export interface SlotState {
  phase: SlotPhase;
  stopped: [boolean, boolean, boolean];
  offs: [number, number, number];
  trans: [string, string, string];
  winner: Member | null;
  lineType: LineType;
  strips: Member[][];
}

/** ペイライン種別 -> 各リールで勝者が来る行 index */
export function winRows(t: LineType): [number, number, number] {
  if (t === 'row0') return [0, 0, 0];
  if (t === 'row1') return [1, 1, 1];
  if (t === 'row2') return [2, 2, 2];
  if (t === 'diagD') return [0, 1, 2];
  return [2, 1, 0]; // diagU
}

function pick(list: Member[]): Member {
  return list[secureRandomIndex(list.length)];
}

/**
 * 勝者が指定ペイライン上に揃うようリールストリップを構築する。
 * デザイン(Lucky Slot Arcade.dc.html)の buildGrid を移植しつつ、
 * 乱数は crypto ベースの secureRandomIndex を使用。勝者決定は呼び出し側で行う。
 */
function buildStrips(
  list: Member[],
  winner: Member,
  lineType: LineType,
): Member[][] {
  const rows = winRows(lineType);
  const grid: Member[][] = [0, 1, 2].map(() => [pick(list), pick(list), pick(list)]);
  grid.forEach((col, r) => {
    col[rows[r]] = winner;
  });

  // 意図しない別ペイラインの3連一致を崩す（勝利ライン以外で名前が3つ揃わないように）
  const lines: [number, number][][] = [
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];
  const winCells = rows.map((row, reel) => `${reel},${row}`);
  lines.forEach((ln) => {
    const ids = ln.map(([re, ro]) => `${re},${ro}`);
    if (ids.every((id) => winCells.includes(id))) return;
    const names = ln.map(([re, ro]) => grid[re][ro].name);
    if (names[0] === names[1] && names[1] === names[2]) {
      const found = ln.find(([r2, c2]) => !winCells.includes(`${r2},${c2}`));
      if (!found) return;
      let alt = pick(list);
      let guard = 0;
      while (alt.name === names[0] && list.length > 1 && guard++ < 20) {
        alt = pick(list);
      }
      grid[found[0]][found[1]] = alt;
    }
  });

  return [0, 1, 2].map((re) => {
    const arr: Member[] = [];
    for (let i = 0; i < LAND; i++) arr.push(pick(list));
    arr.push(grid[re][0], grid[re][1], grid[re][2]);
    for (let i = 0; i < 4; i++) arr.push(pick(list));
    return arr;
  });
}

const LINE_TYPES: LineType[] = ['row0', 'row1', 'row2', 'diagD', 'diagU'];

const restingOffs = (): [number, number, number] => [
  -(LAND * ITEM_H),
  -(LAND * ITEM_H),
  -(LAND * ITEM_H),
];

/**
 * スロット(3リール×3行)アニメーションの状態管理フック。
 * 勝者決定は既存の selectWinnerIndex（重み付き抽選）を使用する。
 */
export function useSlotMachine() {
  const [state, setState] = useState<SlotState>({
    phase: 'idle',
    stopped: [false, false, false],
    offs: restingOffs(),
    trans: ['none', 'none', 'none'],
    winner: null,
    lineType: 'row1',
    strips: [],
  });
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const spin = useCallback(
    (eligible: Member[], recentWinnerIds: string[] = []) => {
      if (eligible.length < 2) return;
      clearTimers();

      const winnerIdx = selectWinnerIndex(
        eligible.map((m) => m.id),
        recentWinnerIds,
      );
      const winner = eligible[winnerIdx];
      const lineType = LINE_TYPES[secureRandomIndex(LINE_TYPES.length)];
      const strips = buildStrips(eligible, winner, lineType);

      setState({
        phase: 'spinning',
        stopped: [false, false, false],
        offs: [0, 0, 0],
        trans: ['none', 'none', 'none'],
        winner,
        lineType,
        strips,
      });

      // 次フレームで停止位置へトランジション開始
      timers.current.push(
        window.setTimeout(() => {
          setState((s) => ({
            ...s,
            offs: restingOffs(),
            trans: REEL_DURATIONS.map(
              (d) => `transform ${d}s cubic-bezier(.12,.62,.16,1)`,
            ) as [string, string, string],
          }));
        }, 40),
      );

      timers.current.push(
        window.setTimeout(
          () => setState((s) => ({ ...s, stopped: [true, false, false] })),
          STOP_TIMES[0],
        ),
      );
      timers.current.push(
        window.setTimeout(
          () => setState((s) => ({ ...s, stopped: [true, true, false] })),
          STOP_TIMES[1],
        ),
      );
      timers.current.push(
        window.setTimeout(
          () =>
            setState((s) => ({
              ...s,
              stopped: [true, true, true],
              phase: 'win',
            })),
          STOP_TIMES[2],
        ),
      );
    },
    [clearTimers],
  );

  const reset = useCallback(() => {
    clearTimers();
    setState({
      phase: 'idle',
      stopped: [false, false, false],
      offs: restingOffs(),
      trans: ['none', 'none', 'none'],
      winner: null,
      lineType: 'row1',
      strips: [],
    });
  }, [clearTimers]);

  return { state, spin, reset };
}
