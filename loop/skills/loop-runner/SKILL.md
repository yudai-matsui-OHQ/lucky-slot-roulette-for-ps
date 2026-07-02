---
name: loop-runner
description: バックログ駆動の開発ループを1サイクル実行する。「バックログを進めて」「ループを回して」「loop-runner」と言われたら使う。loop/BACKLOG.md からタスクを1件取り、npm run check が green になるまで実装・修正を反復し、loop/STATE.md に結果を記録する。
---

# Loop Runner — 最小開発ループ

このスキルは「1タスク = 1サイクル」の開発ループを定義する。停止条件は機械検証(`npm run check`)であり、自己申告ではない。

## 手順

1. **状態読込**: `loop/STATE.md` を読み、前回の続きや保留がないか確認する。
2. **タスク取得**: `loop/BACKLOG.md` の未着手(`[ ]`)の最上位1件を選ぶ。着手時に `[>]` に変える。バックログが空なら何もせず「バックログが空」と報告して終了。
3. **実装**: CLAUDE.md の規約に従って実装する。1サイクルで扱うのは1タスクのみ。スコープ外の問題を見つけたら直さず BACKLOG に追記する。
4. **検証ループ**: `npm run check` を実行し、green になるまで修正を繰り返す。
   - 3回試行しても green にならない場合は中断し、試したことを STATE に記録して人間にエスカレーションする。
5. **記録**: 完了したら BACKLOG の該当行を `[x]` にして「完了」セクションへ移し、`loop/STATE.md` のログ先頭に1行追記する。
   形式: `- YYYY-MM-DD | タスク名 | 結果(done/blocked) | 次にやること・メモ`
6. **報告**: 変更ファイル一覧と差分の要点を人間に報告する。**マージ・コミットの判断は人間が行う。**

## 制約

- `npm run check` = 型チェック + ESLint + Vitest。これが唯一の「green」の定義。
- `~/.claude/` 配下は絶対に触らない。ユーザーレベル設定は `$CLAUDE_CONFIG_DIR` 配下(CLAUDE.md 参照)。
- localStorage のキー名・データ構造を変える場合は必ず BACKLOG に移行タスクを追加する。
- 依存パッケージの追加はタスクに明記されている場合のみ。

## インストール(初回のみ、人間が実行)

```bash
mkdir -p "$CLAUDE_CONFIG_DIR/skills"
ln -s "$(git rev-parse --show-toplevel)/loop/skills/loop-runner" "$CLAUDE_CONFIG_DIR/skills/loop-runner"
```
