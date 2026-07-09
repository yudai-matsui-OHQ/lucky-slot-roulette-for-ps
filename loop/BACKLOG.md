# BACKLOG — ループの入力

書式: `- [ ] タスク名 — 補足(完了条件が分かるように)`
状態: `[ ]` 未着手 / `[>]` 着手中 / `[x]` 完了

## タスク

- [ ] スロット抽選画面: 斜めライン(diagD/diagU)勝利時にペイライン強調線を描画する — 現状 `lineColor` は横ライン(row0/1/2)のときのみ金色ペイライン線を出し、斜め勝利時は当選セルの `cellwin` アニメのみで対角線は未描画(verifier nit)。デザイン `Lucky Slot Arcade.dc.html` の対角ライン演出に寄せるか、現状仕様(セル強調のみ)で確定するかを判断し、必要なら対角の視覚線を追加する
- [ ] スロット抽選画面の実ブラウザ目視確認 — アニメーション(リール縦スクロール/停止タイミング/glow・flash 演出)とデザイン資料の視覚的一致、トグル切替時のタイマー解放、Google Fonts の実ロードは静的検証(npm run check)では確認不可。`npm run dev` で人間 or verify スキルにより目視確認する

## 完了

- [x] スロット抽選画面(Lucky Slot Arcade)を追加し、ドラム式⇄スロットをトグルで切替 — 人間の当セッション直接指示(ローカル `/Users/a030244710/Downloads/ui/project/` のデザイン資料使用、MCP/外部URL不使用)。抽選画面にドラム/スロットトグル追加(`STORAGE_KEYS.drawMode`='facilitator-drawMode', 既定'drum', useLocalStorage 永続化・既存キー不変)。新規 `SlotArcadeView`+`useSlotMachine` でデザインのネオンアーケード SPIN ビュー(3×3スロット/バナー/SPIN/SPINNING/★WINNER★/CONFIRM/RETRY)を再現。勝者選定は既存の `weightedRandomIndex(recentWinnerWeights(...))` を純粋関数 `selectWinnerIndex` に抽出して drum/slot 両方で共有(Math.random 不使用、excludeLast 反映)。CONFIRM は既存 onWin/onAddHistory 流用。drum モード・MEMBER/履歴は不変。npm run check green(33→36)。verifier APPROVE(blocker 0, nit 2: インラインstyle多用・対角ライン強調は follow-up 化)
- [x] useLocalStorage が key 変更時に storedValue を再読込しない問題の要否を判断する — 結論: **意図的仕様として明文化（fix しない）**。全4呼び出し側(App.tsx x2 / useMembers.ts x2)が静的な `STORAGE_KEYS.*` 定数キーを渡しており、props/state 由来の動的キーは皆無（grep + verifier 独立確認）。useEffect 再読込は仮想の将来ユースケースのためにフックを複雑化するだけなので追加せず、`useLocalStorage.ts` の JSDoc に stable-key 不変条件と将来の対処法(再マウント or key監視 useEffect)を明記、`useLocalStorage.hook.test.ts` の該当テストを「疑いの pin」から「仕様の回帰固定」に文言更新。コメント/ドキュメントのみの変更でロジック不変。npm run check green(33/33)。verifier APPROVE
- [x] useLocalStorage の「フック本体」の統合テストを追加する — jsdom + @testing-library/react は既に devDependency 追加・インストール済み（ユーザー承認済み）。`src/hooks/useLocalStorage.hook.test.ts` を新規作成し、per-file の `// @vitest-environment jsdom` で環境切替（vite.config.ts は変更せずスコープ最小化）。renderHook で初期値/既存値復元/setValue更新+永続化/関数updater/再マウント往復/不正JSONフォールバックの7ケースを検証。「キー変更時の再読込」はタスクが求めていたが実装が再読込しないため、実挙動を pin して follow-up タスク化（テストは歪めず）。npm run check green（26→33テスト）。verifier APPROVE
- [x] excludeLast の localStorage キーを STORAGE_KEYS に登録し App.tsx のハードコードを解消する — フェーズ2演習を兼ねて実施。キー値は既存と完全一致('facilitator-excludeLast')で後方互換維持、CLAUDE.md 表更新、STORAGE_KEYS リテラル固定テスト追加

- [x] useLocalStorage フックにテストを追加する — 不正な JSON が保存されていた場合のフォールバック動作を含む。DOM 環境(jsdom)が無く no-new-deps 制約のため、読取/パース/フォールバックの中核を純粋関数 `readStorageValue(raw, initialValue)` に抽出し useLocalStorage をリファクタ（挙動不変）。有効JSON・null/空文字・不正JSONフォールバックを検証する5ケース追加。フック本体の統合テストは別タスクへ（jsdom必要）
- [x] useMembers の重み付け抽選ロジックにユニットテストを追加する — 重み算出ロジックは useMembers ではなく useRoulette.spin にインラインだったため、純粋関数 `recentWinnerWeights(eligibleIds, recentWinnerIds)` を constants.ts に抽出し useRoulette をリファクタ（挙動不変）。直近度→RECENT_WINNER_WEIGHTS 適用・範囲外/未当選は1・重複は最直近採用・順序保持を検証する7ケース追加
- [x] CLAUDE.md のデータモデル表を実装に同期する — 表に「定義場所」列を追加。excludeLast は現存するがApp.tsxにハードコード（STORAGE_KEYS未登録）である旨、重み減衰は履歴から算出し専用キーを持たない旨を明記
