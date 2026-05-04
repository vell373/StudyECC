---
name: plankton-code-quality
description: "Planktonを使用した書き込み時コード品質強制 — フックによる全ファイル編集での自動フォーマット、リント、Claudeによる修正。"
origin: community
---

# Planktonコード品質スキル

Claude Codeの書き込み時コード品質強制システムであるPlankton（クレジット: @alxfazio）の統合リファレンス。PlanktonはPostToolUseフックを介してすべてのファイル編集でフォーマッターとリンターを実行し、その後エージェントが見逃した違反を修正するためにClaudeサブプロセスをスポーンする。

## 使うタイミング

- すべてのファイル編集で自動フォーマットとリントが欲しい場合（コミット時だけでなく）
- コードを修正する代わりにリンター設定を変更するエージェントに対する防御が必要な場合
- 修正のための段階的なモデルルーティングが必要な場合（シンプルなスタイルにはHaiku、ロジックにはSonnet、型にはOpus）
- 複数の言語で作業する場合（Python、TypeScript、Shell、YAML、JSON、TOML、Markdown、Dockerfile）

## 動作の仕組み

### 3フェーズアーキテクチャ

Claude Codeがファイルを編集または書き込むたびに、Planktonの `multi_linter.sh` PostToolUseフックが実行される:

```
フェーズ1: 自動フォーマット (サイレント)
├─ フォーマッターを実行 (ruff format, biome, shfmt, taplo, markdownlint)
├─ 問題の40-50%をサイレントに修正
└─ メインエージェントへの出力なし

フェーズ2: 違反の収集 (JSON)
├─ リンターを実行し、修正できない違反を収集
├─ 構造化JSONを返す: {line, column, code, message, linter}
└─ まだメインエージェントへの出力なし

フェーズ3: 委譲 + 確認
├─ 違反JSONを持つclaude -pサブプロセスをスポーン
├─ 違反の複雑さに基づいてモデル階層にルーティング:
│   ├─ Haiku: フォーマット、インポート、スタイル (E/W/Fコード) — 120sタイムアウト
│   ├─ Sonnet: 複雑さ、リファクタリング (C901, PLRコード) — 300sタイムアウト
│   └─ Opus: 型システム、深い推論 (unresolved-attribute) — 600sタイムアウト
├─ フェーズ1+2を再実行して修正を確認
└─ クリーンなら終了0、違反が残れば終了2 (メインエージェントに報告)
```

### メインエージェントが見るもの

| シナリオ | エージェントが見るもの | フック終了 |
|----------|-----------|-----------|
| 違反なし | 何もなし | 0 |
| すべてサブプロセスで修正済み | 何もなし | 0 |
| サブプロセス後も違反が残る | `[hook] N violation(s) remain` | 2 |
| アドバイザリー (重複、古いツール) | `[hook:advisory] ...` | 0 |

メインエージェントはサブプロセスが修正できなかった問題だけを見る。ほとんどの品質問題は透過的に解決される。

### 設定保護 (ルール回避に対する防御)

LLMはコードを修正するのではなく、ルールを無効にするために `.ruff.toml` や `biome.json` を変更しようとする。Planktonはこれを3層でブロックする:

1. **PreToolUseフック** — `protect_linter_configs.sh` がすべてのリンター設定への編集を実行前にブロック
2. **Stopフック** — `stop_config_guardian.sh` がセッション終了時に `git diff` 経由で設定変更を検出
3. **保護ファイルリスト** — `.ruff.toml`、`biome.json`、`.shellcheckrc`、`.yamllint`、`.hadolint.yaml` など

### パッケージマネージャー強制

Bashへのプリツールユースフックが旧来のパッケージマネージャーをブロックする:
- `pip`、`pip3`、`poetry`、`pipenv` → ブロック（`uv` を使用）
- `npm`、`yarn`、`pnpm` → ブロック（`bun` を使用）
- 許可される例外: `npm audit`、`npm view`、`npm publish`

## セットアップ

### クイックスタート

> **注意:** Planktonはそのリポジトリから手動でインストールする必要がある。インストール前にコードを確認すること。

```bash
# コア依存関係のインストール
brew install jaq ruff uv

# Pythonリンターのインストール
uv sync --all-extras

# Claude Codeを起動 — フックが自動的にアクティブになる
claude
```

インストールコマンドなし、プラグイン設定なし。`.claude/settings.json` のフックはPlanktonディレクトリでClaude Codeを実行すると自動的に認識される。

### プロジェクトごとの統合

自分のプロジェクトでPlanktonフックを使用するには:

1. `.claude/hooks/` ディレクトリをプロジェクトにコピー
2. `.claude/settings.json` フック設定をコピー
3. リンター設定ファイルをコピー (`.ruff.toml`、`biome.json` など)
4. 言語に合わせてリンターをインストール

### 言語固有の依存関係

| 言語 | 必須 | オプション |
|----------|----------|----------|
| Python | `ruff`、`uv` | `ty` (型)、`vulture` (デッドコード)、`bandit` (セキュリティ) |
| TypeScript/JS | `biome` | `oxlint`、`semgrep`、`knip` (デッドエクスポート) |
| Shell | `shellcheck`、`shfmt` | — |
| YAML | `yamllint` | — |
| Markdown | `markdownlint-cli2` | — |
| Dockerfile | `hadolint` (>= 2.12.0) | — |
| TOML | `taplo` | — |
| JSON | `jaq` | — |

## ECCとのペアリング

### 補完的、重複なし

| 関心事 | ECC | Plankton |
|---------|-----|----------|
| コード品質強制 | PostToolUseフック (Prettier, tsc) | PostToolUseフック (20以上のリンター + サブプロセス修正) |
| セキュリティスキャン | AgentShield, security-reviewerエージェント | Bandit (Python), Semgrep (TypeScript) |
| 設定保護 | — | PreToolUseブロック + Stopフック検出 |
| パッケージマネージャー | 検出 + セットアップ | 強制 (レガシーPMをブロック) |
| CI統合 | — | gitのプリコミットフック |
| モデルルーティング | 手動 (`/model opus`) | 自動 (違反の複雑さ → 階層) |

### 推奨の組み合わせ

1. ECCをプラグインとしてインストール (agents, skills, commands, rules)
2. 書き込み時品質強制のためにPlanktonフックを追加
3. セキュリティ監査にAgentShieldを使用
4. PRの最終ゲートとしてECCの verification-loop を使用

### フックの競合回避

ECCとPlanktonの両方のフックを実行する場合:
- ECCのPrettierフックとPlanktonのbiomeフォーマッターがJS/TSファイルで競合する可能性がある
- 解決策: Planktonを使用する場合はECCのPrettier PostToolUseフックを無効にする（PlanktonのbiomeはよりComprehensive）
- 両方が異なるファイルタイプで共存できる（ECCはPlanktonがカバーしないものを処理）

## 設定リファレンス

Planktonの `.claude/hooks/config.json` はすべての動作を制御する:

```json
{
  "languages": {
    "python": true,
    "shell": true,
    "yaml": true,
    "json": true,
    "toml": true,
    "dockerfile": true,
    "markdown": true,
    "typescript": {
      "enabled": true,
      "js_runtime": "auto",
      "biome_nursery": "warn",
      "semgrep": true
    }
  },
  "phases": {
    "auto_format": true,
    "subprocess_delegation": true
  },
  "subprocess": {
    "tiers": {
      "haiku":  { "timeout": 120, "max_turns": 10 },
      "sonnet": { "timeout": 300, "max_turns": 10 },
      "opus":   { "timeout": 600, "max_turns": 15 }
    },
    "volume_threshold": 5
  }
}
```

**主要な設定:**
- 使わない言語を無効にしてフックを速くする
- `volume_threshold` — この数を超える違反は自動的に上位のモデル階層にエスカレート
- `subprocess_delegation: false` — フェーズ3を完全にスキップ（違反を直接報告）

## 環境変数によるオーバーライド

| 変数 | 目的 |
|----------|---------|
| `HOOK_SKIP_SUBPROCESS=1` | フェーズ3をスキップし、違反を直接報告 |
| `HOOK_SUBPROCESS_TIMEOUT=N` | 階層タイムアウトをオーバーライド |
| `HOOK_DEBUG_MODEL=1` | モデル選択の決定をログに記録 |
| `HOOK_SKIP_PM=1` | パッケージマネージャー強制を回避 |

## リファレンス

- Plankton (クレジット: @alxfazio)
- Plankton REFERENCE.md — 完全なアーキテクチャドキュメント (クレジット: @alxfazio)
- Plankton SETUP.md — 詳細なインストールガイド (クレジット: @alxfazio)

## ECC v1.8 追加機能

### コピー可能なフックプロファイル

厳格な品質動作を設定する:

```bash
export ECC_HOOK_PROFILE=strict
export ECC_QUALITY_GATE_FIX=true
export ECC_QUALITY_GATE_STRICT=true
```

### 言語ゲートテーブル

- TypeScript/JavaScript: Biome優先、Prettierフォールバック
- Python: Ruff format/check
- Go: gofmt

### 設定改ざんガード

品質強制中に、同じイテレーションでの設定ファイルへの変更をフラグを立てる:

- `biome.json`、`.eslintrc*`、`prettier.config*`、`tsconfig.json`、`pyproject.toml`

違反を抑制するために設定が変更された場合、マージ前に明示的なレビューが必要。

### CI統合パターン

ローカルフックと同じコマンドをCIで使用する:

1. フォーマッターチェックを実行
2. リント/型チェックを実行
3. 厳格モードでフェールファスト
4. 修復サマリーを公開

### ヘルスメトリクス

以下をトラッキングする:
- ゲートによってフラグされた編集
- 平均修復時間
- カテゴリ別の繰り返し違反
- ゲート失敗によるマージブロック
