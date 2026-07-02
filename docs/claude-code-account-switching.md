# 特定ディレクトリだけ別のAnthropicアカウントで作業する手順（Claude Code / macOS）

## 概要

案件先などから貰ったAnthropicアカウントを、個人アカウントと切り替えて使いたい場合の設定手順です。
`direnv` を使い、特定ディレクトリに入ったときだけ自動でアカウントが切り替わるようにします。

macOSではClaude CodeがOAuthの認証情報をmacOS Keychainに保存する仕様のため、`CLAUDE_CONFIG_DIR` だけでは案件用ディレクトリでもログインセッションが個人アカウントのまま共有されてしまいます。これを避けるため、長期間有効なトークン（`CLAUDE_CODE_OAUTH_TOKEN`）を使う方式にします。

## 前提条件

- macOS
- `direnv` 導入済み（未導入の場合は `brew install direnv`）
- シェルに direnv のフックを追加済み（`~/.zshrc` に `eval "$(direnv hook zsh)"` などが入っていること）

## 手順

### 1. 案件用のClaude設定ディレクトリを作る

```bash
mkdir -p ~/.claude-config/<プロジェクト名>
```

`<プロジェクト名>` は案件やプロジェクトごとに変える（他のディレクトリと被らない名前にする）。

### 2. 案件アカウントの長期トークンを発行する

案件アカウントとしてブラウザ等で認証できる状態で、以下を実行する。

```bash
claude setup-token
```

表示された1年間有効なトークンをコピーし、ファイルに保存する。

```bash
echo "<発行されたトークン>" > ~/.claude-config/<プロジェクト名>/token
chmod 600 ~/.claude-config/<プロジェクト名>/token
```

> **なぜ `/login` ではなくトークン方式にするか**
> macOSのClaude Codeは認証情報を固定のKeychainエントリ（`Claude Code-credentials`）に保存するため、`CLAUDE_CONFIG_DIR` を切り替えても`/login`によるログインセッション自体はMac全体で共有されてしまいます。`CLAUDE_CODE_OAUTH_TOKEN` を環境変数で渡すとKeychainより優先されるため、ディレクトリごとに確実にアカウントを分離できます。

### 3. 対象ディレクトリに `.envrc` を置く

案件のリポジトリのルートに `.envrc` を作成する。

```bash
# /path/to/project/.envrc
export CLAUDE_CONFIG_DIR="$HOME/.claude-config/<プロジェクト名>"
export CLAUDE_CODE_OAUTH_TOKEN="$(cat "$HOME/.claude-config/<プロジェクト名>/token")"
```

### 4. direnvに許可する

```bash
cd /path/to/project
direnv allow
```

`.envrc` を編集するたびに `direnv allow` の再実行が必要（direnvのセキュリティ仕様）。

### 5. 動作確認

**一度ターミナルを閉じて開き直す**（direnvは `cd` 時にしか読み込まれないため、既存タブでは反映されない）。

```bash
cd /path/to/project
direnv status              # allowed: true になっているか確認
echo $CLAUDE_CONFIG_DIR     # 期待したパスが表示されるか確認
claude doctor
claude                      # 起動して案件アカウントになっていることを確認
```

```bash
cd ~
claude                      # 個人アカウント（通常のログインセッション）に戻ることを確認
```

## うまく切り替わらないときのチェックリスト

| 症状 | 確認すること |
|---|---|
| `echo $CLAUDE_CONFIG_DIR` が空/期待と違う | direnvのシェルフックが入っているか、`direnv allow` を実行したか、ターミナルを開き直したか |
| VS Code上で反映されない | VS Code拡張機能は`CLAUDE_CONFIG_DIR`を無視する既知の問題あり。素のターミナル（Terminal.app/iTerm）から起動する |
| パスは合っているのにアカウントが切り替わらない | Keychain経由の`/login`セッションを使っている可能性。手順2〜3のトークン方式に切り替える |
| `security find-generic-password -s "Claude Code-credentials" -a "$USER" -w` の内容を確認したい | 現在Keychainに入っているセッションのトークンをJSONで確認できる（デバッグ用） |

## アカウントごとの設定ファイルについて

`CLAUDE_CONFIG_DIR` を分けている時点で、`settings.json` / `skills` / `commands` / 履歴などは**デフォルトで完全に独立**しています。何もしなければ `~/.claude-config/<プロジェクト名>/settings.json` は個人アカウント側（`~/.claude/settings.json`）とは別ファイルとして自動生成され、権限設定やMCPサーバー設定などをアカウントごとに個別管理できます。

なお、プロジェクトディレクトリ内の `.claude/settings.json`（Gitで共有）・`.claude/settings.local.json`（個人用、`.gitignore`対象）はさらに別階層で、こちらはアカウントに関係なくプロジェクトごとに独立しています。アカウント単位で設定を分けたいなら `CLAUDE_CONFIG_DIR` 配下の設定、プロジェクト単位で分けたいなら `.claude/settings*.json` を使います。

### （任意）settings.json / skills / commands を共有したい場合

逆に、認証だけ分けて他の設定は個人アカウント側と共通化したい場合はシンボリックリンクを使う。

```bash
rm -f ~/.claude-config/<プロジェクト名>/settings.json
ln -s ~/.claude/settings.json ~/.claude-config/<プロジェクト名>/settings.json
ln -s ~/.claude/skills        ~/.claude-config/<プロジェクト名>/skills
ln -s ~/.claude/commands      ~/.claude-config/<プロジェクト名>/commands
```

初回ログイン時に `settings.json` が自動生成されるため、シンボリックリンクを張る前に一旦削除する必要がある。

## 参考

- https://zenn.dev/yodaka/articles/1d433c34004290
- https://code.claude.com/docs/en/authentication
