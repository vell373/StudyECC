---
description: バックエンド集約マルチモデルワークフローを実行します（API、アルゴリズム、データ、ビジネスロジック）。
---

# Backend - バックエンド集約開発

バックエンド集約ワークフロー（Research → Ideation → Plan → Execute → Optimize → Review）、Codex主導。

## 使用方法

```bash
/backend <バックエンドタスクの説明>
```

## コンテキスト

- バックエンドタスク: $ARGUMENTS
- Codex主導、参考用にGemini
- 適用対象: API設計、アルゴリズム実装、データベース最適化、ビジネスロジック

## 担当ロール

あなたは**バックエンドオーケストレーター**であり、サーバーサイドタスク（Research → Ideation → Plan → Execute → Optimize → Review）のマルチモデルコラボレーションを調整します。

**協調モデル**:
- **Codex** – バックエンドロジック、アルゴリズム（**バックエンド権威、信頼できる**）
- **Gemini** – フロントエンド視点（**バックエンド意見は参考程度**）
- **Claude（自己）** – オーケストレーション、計画、実行、配信

---

## マルチモデル呼び出し仕様

**呼び出し構文**:

```
# 新規セッション呼び出し
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend codex - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <拡張要件（または$ARGUMENTS未拡張の場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待出力フォーマット
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "簡潔な説明"
})

# セッション再開呼び出し
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend codex resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <拡張要件（または$ARGUMENTS未拡張の場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待出力フォーマット
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "簡潔な説明"
})
```

**ロールプロンプト**:

| フェーズ | Codex |
|---------|-------|
| Analysis | `~/.claude/.ccg/prompts/codex/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/codex/architect.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` |

**セッション再利用**: 各呼び出しは`SESSION_ID: xxx`を返します。以降のフェーズで`resume xxx`を使用してください。Phase 2で`CODEX_SESSION`を保存し、Phase 3と5で`resume`を使用してください。

---

## コミュニケーションガイドライン

1. レスポンスをモードラベル`[Mode: X]`で開始（初期は`[Mode: Research]`）
2. 厳密な順序に従う: `Research → Ideation → Plan → Execute → Optimize → Review`
3. 必要に応じて`AskUserQuestion`ツールを使用（確認/選択/承認等）

---

## コアワークフロー

### フェーズ0: プロンプト拡張（オプション）

`[Mode: Prepare]` - ace-tool MCPが利用可能な場合、`mcp__ace-tool__enhance_prompt`を呼び出し、**元の$ARGUMENTSを拡張結果に置き換えてその後のCodex呼び出しで使用**してください。利用不可の場合は、$ARGUMENTSをそのまま使用してください。

### フェーズ1: Research

`[Mode: Research]` - 要件を理解してコンテキストを収集

1. **コード検索**（ace-tool MCP利用可能な場合）: `mcp__ace-tool__search_context`を呼び出して既存API、データモデル、サービスアーキテクチャを取得。利用不可の場合は、内蔵ツール使用: `Glob`でファイル検索、`Grep`でシンボル/API検索、`Read`でコンテキスト収集、`Task`（Explore agent）でより深い探索。
2. 要件完成度スコア（0-10）: >=7なら続行、<7なら停止して補足

### フェーズ2: Ideation

`[Mode: Ideation]` - Codex主導分析

**Codexを必ず呼び出す**（上記呼び出し仕様に従う）:
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
- Requirement: 拡張要件（または$ARGUMENTS未拡張の場合）
- Context: フェーズ1からのプロジェクトコンテキスト
- OUTPUT: 技術実現可能性分析、推奨ソリューション（最低2つ）、リスク評価

**SESSION_ID**（`CODEX_SESSION`）を保存し、後続フェーズで再利用します。

ソリューション（最低2つ）を出力し、ユーザー選択を待ちます。

### フェーズ3: Planning

`[Mode: Plan]` - Codex主導計画

**Codexを必ず呼び出す**（セッション再開で`resume <CODEX_SESSION>`を使用）:
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
- Requirement: ユーザーが選択したソリューション
- Context: フェーズ2からの分析結果
- OUTPUT: ファイル構造、関数/クラス設計、依存関係

Claudeが計画を統合し、ユーザー承認後に`.claude/plan/task-name.md`に保存します。

### フェーズ4: Implementation

`[Mode: Execute]` - コード開発

- 承認された計画に厳密に従う
- 既存プロジェクトコード標準に従う
- エラーハンドリング、セキュリティ、パフォーマンス最適化を確保

### フェーズ5: Optimization

`[Mode: Optimize]` - Codex主導レビュー

**Codexを必ず呼び出す**（上記呼び出し仕様に従う）:
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
- Requirement: 次のバックエンドコード変更をレビュー
- Context: git diff またはコード内容
- OUTPUT: セキュリティ、パフォーマンス、エラーハンドリング、API準拠の問題リスト

レビューフィードバックを統合し、ユーザー確認後に最適化を実行します。

### フェーズ6: Quality Review

`[Mode: Review]` - 最終評価

- 計画に対する完了状況を確認
- テストを実行して機能を検証
- 問題と推奨事項を報告

---

## 主要ルール

1. **Codexバックエンド意見は信頼できる**
2. **Geminiバックエンド意見は参考程度**
3. 外部モデルは**ゼロのファイルシステム書き込みアクセス権**を持つ
4. Claudeがすべてのコード書き込みとファイル操作を処理
