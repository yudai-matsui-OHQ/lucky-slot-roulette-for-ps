import type { CSSProperties } from 'react';
import type { Member, SelectionRecord } from '../types';
import { useSlotMachine, winRows, ITEM_H, LAND } from '../hooks/useSlotMachine';
import { getNextMonday } from '../utils/constants';

interface Props {
  members: Member[];
  lastWinner: Member | null;
  excludeLast: boolean;
  recentWinnerIds: string[];
  getEligibleMembers: (excludeLast: boolean) => Member[];
  onWin: (member: Member) => void;
  onAddHistory: (record: SelectionRecord) => void;
}

const PIXEL = "'Press Start 2P', monospace";

function SlotStyles() {
  return (
    <style>{`
@keyframes slot-glowpulse{0%,100%{box-shadow:5px 5px 0 #ff40a0,0 0 22px rgba(255,225,77,.4)}50%{box-shadow:5px 5px 0 #ff40a0,0 0 34px rgba(255,225,77,.9)}}
@keyframes slot-winflash{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes slot-cellwin{0%,100%{box-shadow:inset 0 0 0 3px #ffe14d,0 0 18px rgba(255,225,77,.7)}50%{box-shadow:inset 0 0 0 3px #fff,0 0 30px rgba(255,225,77,1)}}
`}</style>
  );
}

export function SlotArcadeView({
  members,
  lastWinner,
  excludeLast,
  recentWinnerIds,
  getEligibleMembers,
  onWin,
  onAddHistory,
}: Props) {
  const { state, spin, reset } = useSlotMachine();

  const eligible = getEligibleMembers(excludeLast);
  const { phase, stopped, offs, trans, winner, lineType, strips } = state;
  const won = phase === 'win';

  const handleSpin = () => {
    if (eligible.length < 2) return;
    spin(eligible, recentWinnerIds);
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
    reset();
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

  const rows = winRows(lineType);
  const isDiag = lineType === 'diagD' || lineType === 'diagU';
  const banner =
    phase === 'idle' ? 'PULL TO START' : phase === 'spinning' ? 'SPINNING...' : 'LINE UP!';

  const lineColor = (idx: number): string => {
    if (!won) return 'rgba(255,255,255,.06)';
    if (
      (lineType === 'row0' && idx === 0) ||
      (lineType === 'row1' && idx === 1) ||
      (lineType === 'row2' && idx === 2)
    )
      return '#ffe14d';
    return 'rgba(255,255,255,.06)';
  };

  const lamps: string[] = ['#2a2340', '#2a2340', '#2a2340'];
  const glows: string[] = ['none', 'none', 'none'];
  stopped.forEach((st, i) => {
    if (st) {
      lamps[i] = '#42ff9e';
      glows[i] = '0 0 12px #42ff9e';
    }
  });

  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ fontFamily: "'DotGothic16', sans-serif", color: '#fff' }}
    >
      <SlotStyles />

      {/* Last winner info (Header の excludeLast と連動) */}
      {lastWinner && excludeLast && (
        <div
          style={{
            marginTop: 8,
            fontFamily: PIXEL,
            fontSize: 9,
            color: '#8b7fb0',
            letterSpacing: 1,
          }}
        >
          LAST: <span style={{ color: '#ffe14d' }}>{lastWinner.name}</span> (EXCLUDED)
        </div>
      )}

      {/* banner */}
      <div
        style={{
          height: 40,
          marginTop: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: PIXEL,
            fontSize: 16,
            color: '#ffe14d',
            textShadow: '0 0 14px rgba(255,225,77,.7)',
            letterSpacing: 2,
          }}
        >
          {banner}
        </div>
      </div>

      {/* 3x3 machine */}
      <div
        style={{
          position: 'relative',
          padding: 20,
          background: '#12101c',
          border: '4px solid #ff40a0',
          borderRadius: 8,
          boxShadow: '0 0 30px rgba(255,64,160,.35), inset 0 0 40px rgba(0,0,0,.7)',
        }}
      >
        {/* paylines: 横3本 */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            bottom: 52,
            left: 14,
            right: 14,
            pointerEvents: 'none',
            zIndex: 6,
          }}
        >
          <div style={{ position: 'absolute', left: 0, right: 0, top: '16.66%', height: 2, background: lineColor(0) }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: lineColor(1) }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '83.33%', height: 2, background: lineColor(2) }} />
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {[0, 1, 2].map((re) => {
            const cells = strips[re] ?? [];
            const reelStyle: CSSProperties = {
              transform: `translateY(${offs[re]}px)`,
              transition: trans[re],
            };
            return (
              <div key={re} style={{ position: 'relative', width: 172 }}>
                <div
                  style={{
                    height: 3 * ITEM_H,
                    overflow: 'hidden',
                    background: '#050409',
                    border: '3px solid #33294d',
                    position: 'relative',
                  }}
                >
                  <div style={reelStyle}>
                    {cells.map((m, j) => {
                      const gridRow = j - LAND;
                      const isWinCell = won && gridRow === rows[re];
                      const isLoser =
                        won && gridRow >= 0 && gridRow <= 2 && !isWinCell;
                      return (
                        <div
                          key={j}
                          style={{
                            height: ITEM_H,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid rgba(255,255,255,.05)',
                            opacity: isLoser ? 0.28 : 1,
                            background: isWinCell ? 'rgba(255,225,77,.16)' : 'transparent',
                            animation: isWinCell ? 'slot-cellwin 0.7s infinite' : 'none',
                            transition: 'opacity .35s',
                          }}
                        >
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 2,
                              background: m.color,
                              display: 'inline-block',
                              marginRight: 9,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 23,
                              color: isWinCell ? '#ffe14d' : '#eae4ff',
                            }}
                          >
                            {m.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* lamp */}
                <div
                  style={{
                    height: 14,
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: lamps[re],
                      boxShadow: glows[re],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* controls */}
      <div
        style={{
          marginTop: 30,
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {phase === 'idle' && (
          <button
            onClick={handleSpin}
            disabled={eligible.length < 2}
            style={{
              cursor: eligible.length < 2 ? 'not-allowed' : 'pointer',
              fontFamily: PIXEL,
              fontSize: 22,
              color: '#0a0910',
              background: '#ffe14d',
              padding: '20px 54px',
              border: 'none',
              boxShadow: '5px 5px 0 #ff40a0, 0 0 22px rgba(255,225,77,.4)',
              animation: eligible.length < 2 ? 'none' : 'slot-glowpulse 1.4s infinite',
              opacity: eligible.length < 2 ? 0.4 : 1,
            }}
          >
            SPIN !
          </button>
        )}

        {phase === 'spinning' && (
          <div
            style={{
              fontFamily: PIXEL,
              fontSize: 14,
              color: '#00e0ff',
              letterSpacing: 2,
              animation: 'slot-winflash .7s infinite',
            }}
          >
            SPINNING...
          </div>
        )}

        {won && winner && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div style={{ fontFamily: PIXEL, fontSize: 11, color: '#8de3ff', letterSpacing: 2 }}>
              {isDiag ? '斜めラインで的中!' : '横ラインで的中!'}
            </div>
            <div
              style={{
                fontFamily: PIXEL,
                fontSize: 13,
                color: '#ffe14d',
                letterSpacing: 2,
                animation: 'slot-winflash .6s infinite',
              }}
            >
              ★ WINNER ★
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 30px',
                background: '#12101c',
                border: '3px solid #ffe14d',
                boxShadow: '0 0 26px rgba(255,225,77,.5)',
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: winner.color,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 38, color: '#fff' }}>{winner.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, fontFamily: PIXEL, fontSize: 11 }}>
              <button
                onClick={handleConfirm}
                style={{
                  cursor: 'pointer',
                  padding: '14px 22px',
                  background: '#00e0ff',
                  color: '#0a0910',
                  border: 'none',
                  fontFamily: PIXEL,
                  fontSize: 11,
                  boxShadow: '3px 3px 0 #0a6e80',
                }}
              >
                CONFIRM
              </button>
              <button
                onClick={handleSpin}
                style={{
                  cursor: 'pointer',
                  padding: '14px 22px',
                  background: '#181428',
                  color: '#8de3ff',
                  border: '2px solid #33294d',
                  fontFamily: PIXEL,
                  fontSize: 11,
                }}
              >
                RETRY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
