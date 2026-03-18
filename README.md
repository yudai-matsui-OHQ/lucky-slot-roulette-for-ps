# Lucky Slot Roulette

会議のファシリテーターやタスクの担当者をランダムに選出するスロット＆ルーレットアプリです。メンバーを登録し、ボタンひとつで公平に抽選できます。

## 主な機能

- **スロット / ルーレット抽選** — 登録メンバーからランダムに 1 名を選出
- **メンバー管理** — メンバーの追加・編集・削除
- **前回当選者の除外** — 連続で同じ人が選ばれないようにするオプション
- **抽選履歴** — 過去の抽選結果を一覧で確認
- **紙吹雪演出** — 当選時に canvas-confetti によるアニメーション
- **ローカル保存** — データはブラウザの LocalStorage に保存

## 技術スタック

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion（アニメーション）
- canvas-confetti（紙吹雪エフェクト）

## 必要な環境

- Node.js 18 以上
- npm 9 以上

## インストール

```bash
git clone <リポジトリURL>
cd Lucky-Slot-Roulette
npm install
```

## 実行方法

### 開発サーバー

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開くとアプリが表示されます。

### 本番ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### ビルドプレビュー

```bash
npm run preview
```

ビルド済みファイルをローカルで確認できます。

### Lint

```bash
npm run lint
```
