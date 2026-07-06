# BACKLOG — ループの入力

書式: `- [ ] タスク名 — 補足(完了条件が分かるように)`
状態: `[ ]` 未着手 / `[>]` 着手中 / `[x]` 完了

## タスク

- [ ] useLocalStorage の「フック本体」の統合テストを追加する — jsdom(または happy-dom)+ @testing-library/react の devDependency 追加が前提。renderHook で読み書きの往復・キー変更時の再読込を検証する。依存追加が必要なので本タスクで明示的に承認すること
- [ ] Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/6acd0133-3ef6-44a5-b0a1-b62cf7c59dee?file=Lucky+Slot+Arcade.dc.html
Implement: Lucky Slot Arcade.dc.html


## 完了

- [x] useLocalStorage フックにテストを追加する — 不正な JSON が保存されていた場合のフォールバック動作を含む。DOM 環境(jsdom)が無く no-new-deps 制約のため、読取/パース/フォールバックの中核を純粋関数 `readStorageValue(raw, initialValue)` に抽出し useLocalStorage をリファクタ（挙動不変）。有効JSON・null/空文字・不正JSONフォールバックを検証する5ケース追加。フック本体の統合テストは別タスクへ（jsdom必要）
- [x] useMembers の重み付け抽選ロジックにユニットテストを追加する — 重み算出ロジックは useMembers ではなく useRoulette.spin にインラインだったため、純粋関数 `recentWinnerWeights(eligibleIds, recentWinnerIds)` を constants.ts に抽出し useRoulette をリファクタ（挙動不変）。直近度→RECENT_WINNER_WEIGHTS 適用・範囲外/未当選は1・重複は最直近採用・順序保持を検証する7ケース追加
- [x] CLAUDE.md のデータモデル表を実装に同期する — 表に「定義場所」列を追加。excludeLast は現存するがApp.tsxにハードコード（STORAGE_KEYS未登録）である旨、重み減衰は履歴から算出し専用キーを持たない旨を明記
