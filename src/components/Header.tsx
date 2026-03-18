import type { View } from '../types';

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
  excludeLast: boolean;
  onToggleExclude: () => void;
}

const TABS: { view: View; label: string }[] = [
  { view: 'roulette', label: 'ルーレット' },
  { view: 'members', label: 'メンバー' },
  { view: 'history', label: '履歴' },
];

export function Header({ currentView, onViewChange, excludeLast, onToggleExclude }: Props) {
  return (
    <header className="mb-8 text-center">
      <h1 className="bg-gradient-to-r from-blue-400 via-amber-400 to-blue-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
        Lucky Slot Roulette
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        スロットルーレットでラッキーパーソンを決めよう!
      </p>

      <nav className="mt-6 flex items-center justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.view}
            onClick={() => onViewChange(tab.view)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              currentView === tab.view
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-4 border-l border-slate-700 pl-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={excludeLast}
              onChange={onToggleExclude}
              className="accent-amber-500"
            />
            前回当選者を除外
          </label>
        </div>
      </nav>
    </header>
  );
}
