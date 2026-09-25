# Lucky Slot Roulette

会議のファシリテーターやタスクの担当者をランダムに選出するスロット＆ルーレットアプリです。メンバーを登録し、ボタンひとつで公平に抽選できます。

## 主な機能

- **スロット / ルーレット抽選** — 登録メンバーからランダムに 1 名を選出
- **メンバー管理** — メンバーの追加・編集・削除
- **前回当選者の除外** — 連続で同じ人が選ばれないようにするオプション
- **抽選履歴** — 過去の抽選結果を一覧で確認
- **紙吹雪演出** — 当選時に canvas-confetti によるアニメーション
- **チーム共有** — メンバー・抽選履歴・除外設定をサーバー (Upstash Redis) に保存し、全員で同じデータを共有（Basic 認証で保護）

## 技術スタック

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion（アニメーション）
- canvas-confetti（紙吹雪エフェクト）

## Vercel へのデプロイ設定（チーム共有）

1. **Upstash Redis を接続**: Vercel のプロジェクト → Storage → Marketplace から **Upstash (Redis)** を追加し、このプロジェクトに接続する（無料プランで可）。`KV_REST_API_URL` / `KV_REST_API_TOKEN` が自動で設定される。
2. **Basic 認証の環境変数を追加**: Settings → Environment Variables に `BASIC_AUTH_USER` と `BASIC_AUTH_PASSWORD` を設定する。未設定の場合はすべてのアクセスが拒否される。
3. **再デプロイ**する。

- 共有されるのは `facilitator-members` / `facilitator-history` / `facilitator-lastWinner` / `facilitator-excludeLast`。抽選画面のモード（ドラム/スロット）は各自のブラウザに保存される。
- サーバーにまだデータがない状態で最初にアクセスしたブラウザの LocalStorage のデータが、初期データとしてアップロードされる。
- 自分の変更（メンバー追加・削除、抽選結果）は即座に画面へ反映され、サーバーに保存される。他の人の変更はブラウザを再読み込みすると反映される。同時に編集した場合は後から保存した内容が優先される。
- `npm run dev` では API が動かないため、従来どおり LocalStorage のみで動作する（画面下部に「このブラウザにのみ保存しています」と表示）。

## 必要な環境

- Node.js 18 以上
- npm 9 以上

## インストール

```bash
git clone <リポジトリURL>
cd lucky-slot-roulette-for-ps
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
