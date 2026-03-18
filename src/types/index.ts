export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface SelectionRecord {
  id: string;
  memberId: string;
  memberName: string;
  weekOf: string;
  selectedAt: string;
}

export type View = 'roulette' | 'members' | 'history';

export type RoulettePhase =
  | 'idle'
  | 'spinning'
  | 'landed'
  | 'celebrating';
