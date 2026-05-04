---
description: リサーチ、計画、実行、最適化、レビューを含むフルマルチモデル開発ワークフローを実行します。
---

# ワークフロー - マルチモデル協力的開発

マルチモデル協力的開発ワークフロー（リサーチ → アイデアション → プラン → 実行 → 最適化 → レビュー）、インテリジェントルーティング付き：フロントエンド → Gemini、バックエンド → Codex。

品質ゲート、MCPサービス、マルチモデル協力を備えた構造化開発ワークフロー。

## 使用方法

```bash
/workflow <タスク説明>
```

## コンテキスト

- 開発するタスク: $ARGUMENTS
- 品質ゲート付き構造化6フェーズワークフロー
- マルチモデル協力: Codex（バックエンド）+ Gemini（フロントエンド）+ Claude（オーケストレーション）
- MCPサービス統合（ace-tool、オプション）で強化された機能

## あなたの役割

あなたは**オーケストレーター**であり、マルチモデル協力システム（リサーチ → アイデアション → プラン → 実行 → 最適化 → レビュー）を調整します。経験豊富な開発者向けに簡潔かつプロフェッショナルに通信してください。

**協力的なモデル**:
- **ace-tool MCP**（オプション）– コード検索 + プロンプト強化
- **Codex** – バックエンドロジック、アルゴリズム、デバッグ（**バックエンド権威、信頼できる**）
- **Gemini** – フロントエンドUI/UX、ビジュアルデザイン（**フロントエンドエキスパート、バックエンド意見は参照のみ**）
- **Claude（自己）** – オーケストレーション、計画、実行、配信

---

## マルチモデル呼び出し仕様

**呼び出し構文**（並列: `run_in_background: true`、順序的: `false`）:

```
# 新規セッション呼び出し
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <強化された要件（または $ARGUMENTS が強化されていない場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待される出力形式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡潔な説明"
})

# セッション再開呼び出し
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <強化された要件（または $ARGUMENTS が強化されていない場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待される出力形式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡潔な説明"
})
```

**モデルパラメータ注釈**:
- `{{GEMINI_MODEL_FLAG}}`: `--backend gemini` を使用する場合、`--gemini-model gemini-3-pro-preview` で置き換える（末尾スペース付き）; codexの場合は空文字列を使用

**ロールプロンプト**:

| フェーズ | Codex | Gemini |
|--------|-------|--------|
| 分析 | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 計画 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| レビュー | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**セッション再利用**: 各呼び出しは `SESSION_ID: xxx` を返します。後のフェーズで `resume xxx` を使用してください（`--resume` ではなく `resume` に注意）。

**並列呼び出し**: `run_in_background: true` を使用して開始し、`TaskOutput` で結果を待機します。**次のフェーズに進む前に、すべてのモデルの戻り値を待つ必須**。

**バックグラウンドタスクを待機**（最大タイムアウト 600000ms = 10分）:

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**:
- `timeout: 600000` を指定する必須、そうでなければデフォルト30秒がタイムアウトを引き起こします。
- 10分後も不完全な場合、`TaskOutput` での引き続きのポーリングを続ける、**決してプロセスを強制終了しないでください**。
- 待機がタイムアウトによってスキップされた場合、**ユーザーに待機を続けるか、タスクを強制終了するかを尋ねるために `AskUserQuestion` を呼び出す必須**。

---

## コミュニケーションガイドライン

1. モードラベル `[Mode: X]` で応答を開始します。最初は `[Mode: Research]`。
2. 厳密な順序に従う: `Research → Ideation → Plan → Execute → Optimize → Review`。
3. 各フェーズ完了後、ユーザー確認をリクエストする。
4. スコア < 7 またはユーザーが承認しない場合、強制的に停止する。
5. 必要に応じて `AskUserQuestion` ツールを使用（確認/選択/承認など）。

## 外部オーケストレーション使用時

並列ワーカー間で作業を分割する必要がある場合、独立したgitの状態、独立したターミナル、または別々のビルド/テスト実行が必要な場合は、外部tmux/worktreeオーケストレーションを使用してください。メインセッションが唯一の書き込み手であるような、軽量の分析、計画、またはレビューの場合はインプロセスサブエージェントを使用してください。

```bash
node scripts/orchestrate-worktrees.js .claude/plan/workflow-e2e-test.json --execute
```

---

## 実行ワークフロー

**タスク説明**: $ARGUMENTS

### フェーズ1: リサーチと分析

`[Mode: Research]` - 要件を理解し、コンテキストを収集します:

1. **プロンプト強化**（ace-tool MCPが利用可能な場合）: `mcp__ace-tool__enhance_prompt` を呼び出す。**元の $ARGUMENTS をその後のすべてのCodex/Geminニ呼び出しの強化結果で置き換える**。利用不可の場合、$ARGUMENTS をそのまま使用してください。
2. **コンテキスト検索**（ace-tool MCPが利用可能な場合）: `mcp__ace-tool__search_context` を呼び出す。利用不可の場合、組み込みツールを使用: ファイル検出用 `Glob`、シンボル検索用 `Grep`、コンテキスト収集用 `Read`、深掘り探索用 `Task`（Explore agent）。
3. **要件完全性スコア**（0-10）:
   - ゴール明確性（0-3）、期待される成果物（0-3）、スコープ境界（0-2）、制約（0-2）
   - ≥7: 続行 | <7: 停止、明確化質問をする

### フェーズ2: ソリューションアイデアション

`[Mode: Ideation]` - マルチモデル並列分析:

**並列呼び出し**（`run_in_background: true`）:
- Codex: analyzer プロンプトを使用、技術的実行可能性、ソリューション、リスク出力
- Gemini: analyzer プロンプトを使用、UI実行可能性、ソリューション、UX評価出力

`TaskOutput` で結果を待機。**SESSION_ID** を保存（`CODEX_SESSION` と `GEMINI_SESSION`）。

**上記の`マルチモデル呼び出し仕様`の`重要`指示に従う**

両方の分析を合成し、ソリューション比較（最低2つオプション）を出力し、ユーザー選択を待機してください。

### フェーズ3: 詳細計画

`[Mode: Plan]` - マルチモデル協力的計画:

**並列呼び出し**（SESSION_IDで `resume` を使用）:
- Codex: architect プロンプト + `resume $CODEX_SESSION` を使用、バックエンドアーキテクチャ出力
- Gemini: architect プロンプト + `resume $GEMINI_SESSION` を使用、フロントエンドアーキテクチャ出力

`TaskOutput` で結果を待機。

**上記の`マルチモデル呼び出し仕様`の`重要`指示に従う**

**Claude合成**: Codexバックエンドプラン + Geminフロントエンドプランを採用、ユーザー承認後 `.claude/plan/task-name.md` に保存。

### フェーズ4: 実装

`[Mode: Execute]` - コード開発:

- 承認されたプランを厳密に従う
- 既存プロジェクトコード標準に従う
- 主要マイルストーンでフィードバックをリクエストする

### フェーズ5: コード最適化

`[Mode: Optimize]` - マルチモデル並列レビュー:

**並列呼び出し**:
- Codex: reviewer プロンプト使用、セキュリティ、パフォーマンス、エラーハンドリングに焦点
- Gemini: reviewer プロンプト使用、アクセシビリティ、設計一貫性に焦点

`TaskOutput` で結果を待機。レビューフィードバックを統合し、ユーザー確認後に最適化を実行してください。

**上記の`マルチモデル呼び出し仕様`の`重要`指示に従う**

### フェーズ6: 品質レビュー

`[Mode: Review]` - 最終評価:

- プランに対する完了を確認
- テストを実行して機能を検証
- 問題と推奨事項を報告
- 最終ユーザー確認をリクエストする

---

## 主要ルール

1. フェーズシーケンスはスキップできない（ユーザーが明示的に指示しない限り）
2. 外部モデルは**ファイルシステム書き込みアクセスなし**、すべての変更はClaude
3. スコア < 7 またはユーザーが承認しない場合、**強制的に停止**する
