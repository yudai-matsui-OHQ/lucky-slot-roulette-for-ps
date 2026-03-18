# Lucky Slot Roulette - プロジェクトガイド

## 概要
スロットルーレットでラッキーパーソンをランダムに選出するWebアプリ。
元々は毎週木曜のStandUpミーティングでファシリテーターを抽選する用途で作成。
汎用的な「ラッキーパーソン決め」として使えるよう文言を調整済み。

## 技術スタック
- **React 19.2 + TypeScript 5.9 + Vite 7.3**
- **Tailwind CSS v4.2** (`@tailwindcss/vite` プラグイン)
- **Framer Motion 12.35** - 当選者リビールアニメーション
- **canvas-confetti 1.9** - 紙吹雪演出
- **html-to-image 1.11** - 結果画面のスクリーンショット保存
- **データ永続化**: localStorage（バックエンド不要）

## コマンド
- `npm run dev` - 開発サーバー起動 (port 5173)
- `npm run build` - プロダクションビルド (`tsc -b && vite build`)
- `npm run preview` - ビルド結果のプレビュー
- `npm run lint` - ESLintによるコード検証

## プロジェクト構成
```
src/
├── components/
│   ├── App.tsx              # ルート。ビュー切替 (roulette / members / history)
│   ├── Header.tsx           # タイトル「Lucky Slot Roulette」+ ナビタブ + 除外トグル
│   ├── RouletteView.tsx     # メイン抽選画面。SPIN → 結果表示 → 確定/保存/やり直し
│   ├── SlotMachine.tsx      # CSSトランジションによるスロット縦スクロールアニメーション
│   ├── WinnerReveal.tsx     # 当選者発表 + 紙吹雪 (Framer Motion + canvas-confetti)
│   ├── MemberManager.tsx    # メンバー追加/一覧画面
│   ├── MemberCard.tsx       # 個別メンバーカード (編集/削除)
│   └── HistoryPanel.tsx     # 過去の抽選履歴一覧
├── hooks/
│   ├── useLocalStorage.ts   # localStorage汎用フック
│   ├── useMembers.ts        # メンバーCRUD + 前回当選者除外ロジック
│   └── useRoulette.ts       # アニメーション状態管理 (idle → spinning → celebrating)
├── types/index.ts           # Member, SelectionRecord, View 型定義
├── utils/
│   ├── constants.ts         # localStorageキー, メンバーカラー, getNextMonday()
│   └── random.ts            # crypto.getRandomValues() による公平な乱数
├── main.tsx                 # エントリーポイント
└── index.css                # Tailwind CSS import
```

## データモデル (localStorage)
| キー | 型 | 説明 |
|------|------|------|
| `facilitator-members` | `Member[]` | 登録メンバー一覧 |
| `facilitator-history` | `SelectionRecord[]` | 抽選履歴 |
| `facilitator-lastWinner` | `string \| null` | 前回当選者のmemberId (除外対象) |
| `facilitator-excludeLast` | `boolean` | 前回当選者除外のON/OFF (デフォルト: true) |

## 主要な仕様
- **除外ルール**: 前回当選した1人を除外可能 (UIトグルでON/OFF切替)
- **最低人数**: メンバー2人以上で抽選可能
- **スロットアニメーション**: CSS transition 4秒 + cubic-bezier(0.15, 0.85, 0.25, 1) で自然な減速
- **結果保存**: html-to-image でスクリーンショットをPNGダウンロード
- **テーマ**: ダークネイビー背景、ゴールド + ブルーのアクセント

## 開発サーバーとビルド
- 開発サーバー: `npm run dev` でポート5173で起動
- ビルド: `npm run build` でdist/ディレクトリに出力
- プレビュー: `npm run preview` でビルド済みファイルを確認可能

## 注意事項
- `navigator.clipboard.writeText` はセキュリティ制約で動作しない環境があるため、スクリーンショット保存方式を採用
- localStorageを使用しているため、ブラウザ/ドメインが変わるとデータはリセットされる
- プロダクション環境へのデプロイ時は、IP制限などのアクセス制御を推奨
