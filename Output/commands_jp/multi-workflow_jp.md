---
description: 研究、計画、実行、最適化、レビューを備えた完全なマルチモデル開発ワークフローを実行します。
---

# Workflow - マルチモデルコラボレーション開発

マルチモデルコラボレーション開発ワークフロー（Research → Ideation → Plan → Execute → Optimize → Review）、インテリジェントルーティング: Frontend → Gemini、Backend → Codex。

構造化開発ワークフロー、品質ゲート、MCPサービス、マルチモデルコラボレーション。

## 使用方法

```bash
/workflow <タスク説明>
```

## コンテキスト

- 開発するタスク: $ARGUMENTS
- 品質ゲート付き構造化6フェーズワークフロー
- マルチモデルコラボレーション: Codex（バックエンド）+ Gemini（フロントエンド）+ Claude（オーケストレーション）
- MCPサービス統合（ace-tool、オプション）で強化された機能

## 担当ロール

あなたは**オーケストレーター**であり、マルチモデルコラボレーションシステム（Research → Ideation → Plan → Execute → Optimize → Review）を調整します。経験者向けに簡潔でプロフェッショナルに通信してください。

**協調モデル**:
- **ace-tool MCP**（オプション）– コード検索 + プロンプト拡張
- **Codex** – バックエンドロジック、アルゴリズム、デバッグ（**バックエンド権威、信頼できる**）
- **Gemini** – フロントエンドUI/UX、ビジュアルデザイン（**フロントエンド専門家、バックエンド意見は参考程度**）
- **Claude（自己）** – オーケストレーション、計画、実行、配信

---

## マルチモデル呼び出し仕様

**呼び出し構文**（並列: `run_in_background: true`、順序: `false`）:

```
# 新規セッション呼び出し
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <拡張要件（または$ARGUMENTS未拡張の場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待出力フォーマット
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
Requirement: <拡張要件（または$ARGUMENTS未拡張の場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待出力フォーマット
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡潔な説明"
})
```

**モデルパラメータ注記**:
- `{{GEMINI_MODEL_FLAG}}`: `--backend gemini`を使用する場合、`--gemini-model gemini-3-pro-preview`に置き換え（末尾のスペース注意）；codexの場合は空文字列を使用

**ロールプロンプト**:

| フェーズ | Codex | Gemini |
|---------|-------|--------|
| Analysis | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**セッション再利用**: 各呼び出しは`SESSION_ID: xxx`を返します。その後のフェーズで`resume xxx`サブコマンドを使用（`--resume`ではなく`resume`に注意）。

**並列呼び出し**: `run_in_background: true`で開始し、`TaskOutput`で結果を待機。**次のフェーズに進む前に、すべてのモデルが返答するまで待つ必須**。

**バックグラウンドタスク待機**（最大タイムアウト600000ms = 10分を使用）:

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**:
- `timeout: 600000`を指定する必須。そうしないとデフォルト30秒でタイムアウト。
- 10分後も未完了の場合は、`TaskOutput`で続行ポーリング。**決してプロセスを停止しない**。
- タイムアウトのため待機をスキップした場合は、**`AskUserQuestion`を呼び出して、ユーザーに待機を継続するかタスクを停止するかを尋ねてください。決して直接停止しないでください。**

---

## コミュニケーションガイドライン

1. レスポンスをモードラベル`[Mode: X]`で開始。初期は`[Mode: Research]`。
2. 厳密な順序に従う: `Research → Ideation → Plan → Execute → Optimize → Review`。
3. 各フェーズ完了後、ユーザー確認をリクエスト。
4. スコア < 7 またはユーザーが承認しない場合は強制停止。
5. 必要に応じて`AskUserQuestion`ツールを使用（確認/選択/承認等）。

## 外部オーケストレーションを使用する時期

ワークが並列ワーカー全体で分割され、分離されたgit状態、独立したターミナル、または別ビルド/テスト実行が必要な場合は、外部tmux/worktreeオーケストレーションを使用。メインセッションが唯一の書き込みである軽量分析、計画、またはレビューについては、プロセス内サブエージェントを使用。

```bash
node scripts/orchestrate-worktrees.js .claude/plan/workflow-e2e-test.json --execute
```

---

## 実行ワークフロー

**タスク説明**: $ARGUMENTS

### フェーズ1: Research & Analysis

`[Mode: Research]` - 要件を理解してコンテキストを収集:

1. **プロンプト拡張**（ace-tool MCP利用可能な場合）: `mcp__ace-tool__enhance_prompt`を呼び出し、**元の$ARGUMENTSを拡張結果に置き換えて、すべての後続Codex/Gemini呼び出しで使用**。利用不可の場合は、`$ARGUMENTS`をそのまま使用。
2. **コンテキスト検索**（ace-tool MCP利用可能な場合）: `mcp__ace-tool__search_context`を呼び出す。利用不可の場合は、内蔵ツール使用: `Glob`でファイル検索、`Grep`でシンボル検索、`Read`でコンテキスト収集、`Task`（Explore agent）でより深い探索。
3. **要件完成度スコア**（0-10）:
   - 目標明確性（0-3）、期待結果（0-3）、スコープ境界（0-2）、制約（0-2）
   - >=7: 続行 | <7: 停止、補足質問を尋ねる

### フェーズ2: Solution Ideation

`[Mode: Ideation]` - マルチモデル並列分析:

**並列呼び出し**（`run_in_background: true`）:
- Codex: アナライザープロンプト使用、技術実現可能性、ソリューション、リスク出力
- Gemini: アナライザープロンプト使用、UI実現可能性、ソリューション、UX評価出力

`TaskOutput`で結果を待機。**SESSION_ID**（`CODEX_SESSION`と`GEMINI_SESSION`）を保存。

**マルチモデル呼び出し仕様**の`重要`な指示に従う**

両方の分析を統合し、ソリューション比較を出力（最低2つのオプション）。ユーザー選択を待機。

### フェーズ3: Detailed Planning

`[Mode: Plan]` - マルチモデルコラボレーション計画:

**並列呼び出し**（セッション再開で`resume <SESSION_ID>`を使用）:
- Codex: アーキテクトプロンプト + `resume $CODEX_SESSION`使用、バックエンドアーキテクチャ出力
- Gemini: アーキテクトプロンプト + `resume $GEMINI_SESSION`使用、フロントエンドアーキテクチャ出力

`TaskOutput`で結果を待機。

**マルチモデル呼び出し仕様**の`重要`な指示に従う**

**Claude統合**: Codexバックエンド計画 + Geminiフロントエンド計画を採用し、ユーザー承認後に`.claude/plan/task-name.md`に保存。

### フェーズ4: Implementation

`[Mode: Execute]` - コード開発:

- 承認された計画に厳密に従う
- 既存プロジェクトコード標準に従う
- 主要マイルストーンで反応をリクエスト

### フェーズ5: Code Optimization

`[Mode: Optimize]` - マルチモデル並列レビュー:

**並列呼び出し**:
- Codex: レビュアープロンプト使用、セキュリティ、パフォーマンス、エラーハンドリングにフォーカス
- Gemini: レビュアープロンプト使用、アクセシビリティ、デザイン一貫性にフォーカス

`TaskOutput`で結果を待機。レビューフィードバックを統合し、ユーザー確認後に最適化を実行。

**マルチモデル呼び出し仕様**の`重要`な指示に従う**

### フェーズ6: Quality Review

`[Mode: Review]` - 最終評価:

- 計画に対する完了状況を確認
- テストを実行して機能を検証
- 問題と推奨事項を報告
- 最終ユーザー確認をリクエスト

---

## 主要ルール

1. フェーズ順序はスキップできない（ユーザーが明示的に指示しない限り）
2. 外部モデルは**ゼロのファイルシステム書き込みアクセス権**を持ちます。すべての修正はClaudeが行う
3. **強制停止** - スコア < 7 またはユーザーが承認しない場合
