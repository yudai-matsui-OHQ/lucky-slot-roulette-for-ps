# STATE — ループの実行ログ

新しい記録を先頭に追記する。
書式: `- YYYY-MM-DD | タスク名 | 結果(done/blocked) | 次にやること・メモ`

## ログ

- 2026-07-06 | 重み付け抽選ロジックにユニットテスト追加 | done | 重み算出は useMembers になく useRoulette.spin にインラインだったため、純粋関数 recentWinnerWeights を constants.ts に抽出（useRoulette は挙動不変でリファクタ）。7ケース追加し npm run check green（13→20テスト）。次: useLocalStorage のテスト（不正JSONフォールバック含む）
- 2026-07-02 | CLAUDE.mdデータモデル表を実装に同期 | done | タスク前提は誤り（excludeLastは現存）。実装通りに表へ「定義場所」列を追加し、excludeLastがApp.tsxハードコードである点・重み減衰が履歴算出で専用キーなしである点を明記。npm install後に npm run check green（13テスト通過）
- 2026-07-02 | ループ基盤セットアップ(フェーズ0+1) | done(要ローカル作業) | npm run check・テスト・loop-runner スキル・メモリファイル作成。サンドボックスから npm レジストリに接続できず vitest は package.json 追記のみ。次: ①`npm install` ②`npm run check` が green か確認 ③スキルを `$CLAUDE_CONFIG_DIR/skills/` に symlink ④バックログ先頭タスクで最小ループを1周
