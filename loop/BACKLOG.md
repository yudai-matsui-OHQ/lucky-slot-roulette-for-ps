# BACKLOG — ループの入力

書式: `- [ ] タスク名 — 補足(完了条件が分かるように)`
状態: `[ ]` 未着手 / `[>]` 着手中 / `[x]` 完了

## タスク

- [ ] useLocalStorage が key 変更時に storedValue を再読込しない問題の要否を判断する — `useState(() => ...)` 初期化子が初回マウント時のみ読むため、key を変えても前キーの値が据え置かれる（現状挙動は `useLocalStorage.hook.test.ts` で pin 済み）。意図的ならコメントで明示、バグなら key を監視する useEffect で再読込する修正 + テスト期待値の更新。まず「再読込が必要な呼び出し側が存在するか」を grep で確認してから着手
- [ ] Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/6acd0133-3ef6-44a5-b0a1-b62cf7c59dee?file=Lucky+Slot+Arcade.dc.html
Implement: Lucky Slot Arcade.dc.html 承認済み


## 完了

- [x] useLocalStorage の「フック本体」の統合テストを追加する — jsdom + @testing-library/react は既に devDependency 追加・インストール済み（ユーザー承認済み）。`src/hooks/useLocalStorage.hook.test.ts` を新規作成し、per-file の `// @vitest-environment jsdom` で環境切替（vite.config.ts は変更せずスコープ最小化）。renderHook で初期値/既存値復元/setValue更新+永続化/関数updater/再マウント往復/不正JSONフォールバックの7ケースを検証。「キー変更時の再読込」はタスクが求めていたが実装が再読込しないため、実挙動を pin して follow-up タスク化（テストは歪めず）。npm run check green（26→33テスト）。verifier APPROVE
- [x] excludeLast の localStorage キーを STORAGE_KEYS に登録し App.tsx のハードコードを解消する — フェーズ2演習を兼ねて実施。キー値は既存と完全一致('facilitator-excludeLast')で後方互換維持、CLAUDE.md 表更新、STORAGE_KEYS リテラル固定テスト追加

- [x] useLocalStorage フックにテストを追加する — 不正な JSON が保存されていた場合のフォールバック動作を含む。DOM 環境(jsdom)が無く no-new-deps 制約のため、読取/パース/フォールバックの中核を純粋関数 `readStorageValue(raw, initialValue)` に抽出し useLocalStorage をリファクタ（挙動不変）。有効JSON・null/空文字・不正JSONフォールバックを検証する5ケース追加。フック本体の統合テストは別タスクへ（jsdom必要）
- [x] useMembers の重み付け抽選ロジックにユニットテストを追加する — 重み算出ロジックは useMembers ではなく useRoulette.spin にインラインだったため、純粋関数 `recentWinnerWeights(eligibleIds, recentWinnerIds)` を constants.ts に抽出し useRoulette をリファクタ（挙動不変）。直近度→RECENT_WINNER_WEIGHTS 適用・範囲外/未当選は1・重複は最直近採用・順序保持を検証する7ケース追加
- [x] CLAUDE.md のデータモデル表を実装に同期する — 表に「定義場所」列を追加。excludeLast は現存するがApp.tsxにハードコード（STORAGE_KEYS未登録）である旨、重み減衰は履歴から算出し専用キーを持たない旨を明記
