# BACKLOG — ループの入力

書式: `- [ ] タスク名 — 補足(完了条件が分かるように)`
状態: `[ ]` 未着手 / `[>]` 着手中 / `[x]` 完了

## タスク

- [ ] CLAUDE.md のデータモデル表を実装に同期する — `facilitator-excludeLast` は現存せず、`RECENT_WINNER_WEIGHTS` による重み方式に変わっている。表と「除外ルール」の記述を現状に合わせる
- [ ] useMembers の重み付け抽選ロジックにユニットテストを追加する — 直近当選者の重みが RECENT_WINNER_WEIGHTS 通りに適用されることを検証
- [ ] useLocalStorage フックにテストを追加する — 不正な JSON が保存されていた場合のフォールバック動作を含む

## 完了

(loop-runner が完了時にここへ移動)
