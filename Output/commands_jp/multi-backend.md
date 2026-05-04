---
description: API、アルゴリズム、データ、ビジネスロジック向けのバックエンド集約型マルチモデルワークフローを実行します。
---

# バックエンド - バックエンド集約型開発

バックエンド集約型ワークフロー（リサーチ → アイデアション → プラン → 実行 → 最適化 → レビュー）、Codex主導。

## 使用方法

```bash
/backend <バックエンドタスク説明>
```

## コンテキスト

- バックエンドタスク: $ARGUMENTS
- Codex主導、Geminは補助参照用
- 適用可能: API設計、アルゴリズム実装、データベース最適化、ビジネスロジック

## あなたの役割

あなたは**バックエンドオーケストレーター**であり、サーバー側タスク（リサーチ → アイデアション → プラン → 実行 → 最適化 → レビュー）のためのマルチモデル協力を調整します。

**協力的なモデル**:
- **Codex** – バックエンドロジック、アルゴリズム（**バックエンド権威、信頼できる**）
- **Gemini** – フロントエンドパースペクティブ（**バックエンド意見は参照のみ**）
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
Requirement: <強化された要件（または $ARGUMENTS が強化されていない場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待される出力形式
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
Requirement: <強化された要件（または $ARGUMENTS が強化されていない場合）>
Context: <前のフェーズからのプロジェクトコンテキストと分析>
</TASK>
OUTPUT: 期待される出力形式
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "簡潔な説明"
})
```

**ロールプロンプト**:

| フェーズ | Codex |
|--------|-------|
| 分析 | `~/.claude/.ccg/prompts/codex/analyzer.md` |
| 計画 | `~/.claude/.ccg/prompts/codex/architect.md` |
| レビュー | `~/.claude/.ccg/prompts/codex/reviewer.md` |

**セッション再利用**: 各呼び出しは `SESSION_ID: xxx` を返します。後のフェーズで `resume xxx` を使用してください。フェーズ2で `CODEX_SESSION` を保存し、フェーズ3と5で `resume` を使用してください。

---

## コミュニケーションガイドライン

1. モードラベル `[Mode: X]` で応答を開始します。最初は `[Mode: Research]`
2. 厳密な順序に従う: `Research → Ideation → Plan → Execute → Optimize → Review`
3. 必要に応じて `AskUserQuestion` ツールを使用（確認/選択/承認など）

---

## コアワークフロー

### フェーズ0: プロンプト強化（オプション）

`[Mode: Prepare]` - ace-tool MCPが利用可能な場合、`mcp__ace-tool__enhance_prompt` を呼び出します。**元の $ARGUMENTS をその後のすべてのCodex呼び出しの強化結果で置き換えます**。利用不可の場合、$ARGUMENTS をそのまま使用してください。

### フェーズ1: リサーチ

`[Mode: Research]` - 要件を理解し、コンテキストを収集します。

1. **コード検索**（ace-tool MCPが利用可能な場合）: `mcp__ace-tool__search_context` を呼び出して既存API、データモデル、サービスアーキテクチャを取得します。利用不可の場合、組み込みツールを使用: ファイル検出用 `Glob`、シンボル/API検索用 `Grep`、コンテキスト収集用 `Read`、深掘り探索用 `Task`（Explore agent）。
2. 要件完全性スコア（0-10）: >= 7で継続、< 7で停止および補足

### フェーズ2: アイデアション

`[Mode: Ideation]` - Codex主導の分析

**必ずCodexを呼び出します**（上記の呼び出し仕様に従う）:
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
- Requirement: 強化された要件（または $ARGUMENTS が強化されていない場合）
- Context: フェーズ1からのプロジェクトコンテキスト
- OUTPUT: 技術的実行可能性分析、推奨されるソリューション（最低2つ）、リスク評価

**SESSION_IDを保存**（後のフェーズ再利用用 `CODEX_SESSION`）。

ソリューション（最低2つ）を出力し、ユーザー選択を待機します。

### フェーズ3: 計画

`[Mode: Plan]` - Codex主導の計画

**必ずCodexを呼び出します**（セッション再利用用 `resume <CODEX_SESSION>` を使用）:
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
- Requirement: ユーザーの選択したソリューション
- Context: フェーズ2からの分析結果
- OUTPUT: ファイル構造、関数/クラス設計、依存関係

Claudeは計画を合成し、ユーザー承認後 `.claude/plan/task-name.md` に保存します。

### フェーズ4: 実装

`[Mode: Execute]` - コード開発

- 承認されたプランを厳密に従う
- 既存プロジェクトコード標準に従う
- エラーハンドリング、セキュリティ、パフォーマンス最適化を確保

### フェーズ5: 最適化

`[Mode: Optimize]` - Codex主導のレビュー

**必ずCodexを呼び出します**（上記の呼び出し仕様に従う）:
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
- Requirement: 以下のバックエンドコード変更をレビュー
- Context: git diffまたはコード内容
- OUTPUT: セキュリティ、パフォーマンス、エラーハンドリング、API準拠の問題リスト

ユーザー確認後、レビューフィードバックを統合し、最適化を実行します。

### フェーズ6: 品質レビュー

`[Mode: Review]` - 最終評価

- プランに対する完了を確認
- テストを実行して機能を検証
- 問題と推奨事項を報告

---

## 主要ルール

1. **Codexバックエンド意見は信頼できる**
2. **Geminバックエンド意見は参照のみ**
3. 外部モデルは**ファイルシステム書き込みアクセスなし**
4. Claudeがすべてのコード書き込みとファイル操作を処理します。
