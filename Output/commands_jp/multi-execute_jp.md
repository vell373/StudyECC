---
description: マルチモデル実装計画を実行しながら、Claudeをファイルシステム唯一の書き込み者として保持します。
---

# Execute - マルチモデルコラボレーション実行

マルチモデルコラボレーション実行 - 計画からプロトタイプを取得 → Claudeがリファクタリングと実装 → マルチモデル監査と配信。

$ARGUMENTS

---

## コアプロトコル

- **言語プロトコル**: ツール/モデルとやり取りする際は**英語**を使用、ユーザーには自分たちの言語で通信
- **コード主権**: 外部モデルは**ゼロのファイルシステム書き込みアクセス権**を持ちます。すべての修正はClaudeが行う
- **ダーティプロトタイプリファクタリング**: Codex/Gemini統一差分を「ダーティプロトタイプ」として扱い、本番グレードコードにリファクタリングする必要があります
- **ストップロス機構**: 現在のフェーズ出力が検証されるまで次のフェーズに進まない
- **前提条件**: `/ccg:plan`出力に対してユーザーが明示的に「Y」で返答した後のみ実行（未実施の場合は事前確認が必須）

---

## マルチモデル呼び出し仕様

**呼び出し構文**（並列: `run_in_background: true`を使用）:

```
# セッション再開呼び出し（推奨） - 実装プロトタイプ
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <タスク説明>
Context: <計画コンテンツ + 対象ファイル>
</TASK>
OUTPUT: 統一差分パッチのみ。実際の修正を厳密に禁止します。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡潔な説明"
})

# 新規セッション呼び出し - 実装プロトタイプ
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <タスク説明>
Context: <計画コンテンツ + 対象ファイル>
</TASK>
OUTPUT: 統一差分パッチのみ。実際の修正を厳密に禁止します。
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡潔な説明"
})
```

**監査呼び出し構文**（コードレビュー/監査）:

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Scope: 最終コード変更を監査してください。
Inputs:
- 適用されたパッチ（git diff / 最終統一差分）
- 変更されたファイル（必要に応じて関連部分のみ）
Constraints:
- ファイルを修正しないでください。
- ファイルシステムアクセスを仮定するツールコマンドを出力しないでください。
</TASK>
OUTPUT:
1) 優先度付き問題リスト（重大度、ファイル、根拠）
2) 具体的な修正；コード変更が必要な場合は、フェンスで囲まれたコードブロック内に統一差分パッチを含めてください。
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
| Implementation | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**セッション再利用**: `/ccg:plan`がSESSION_IDを提供した場合、`resume <SESSION_ID>`を使用してコンテキストを再利用します。

**バックグラウンドタスク待機**（最大タイムアウト600000ms = 10分）:

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**:
- `timeout: 600000`を指定する必須。そうしないとデフォルト30秒でタイムアウト
- 10分後も未完了の場合は、`TaskOutput`で続行ポーリング。**決してプロセスを停止しない**
- タイムアウトのため待機をスキップした場合は、**`AskUserQuestion`を呼び出して、ユーザーに待機を継続するかタスクを停止するかを尋ねてください**

---

## 実行ワークフロー

**実行タスク**: $ARGUMENTS

### フェーズ0: 計画を読む

`[Mode: Prepare]`

1. **入力タイプを識別**:
   - 計画ファイルパス（例：`.claude/plan/xxx.md`）
   - 直接タスク説明

2. **計画コンテンツを読む**:
   - 計画ファイルパスを提供した場合は読んで解析
   - 抽出: タスクタイプ、実装ステップ、主要ファイル、SESSION_ID

3. **実行前確認**:
   - 入力が「直接タスク説明」または計画にSESSION_ID / 主要ファイルが欠ける場合: 事前にユーザーに確認
   - 計画に対してユーザーが「Y」で返答したか確認できない場合: 続行前に再度確認

4. **タスクタイプルーティング**:

   | タスクタイプ | 検出 | ルート |
   |-----------|------|--------|
   | **Frontend** | Pages、コンポーネント、UI、スタイル、レイアウト | Gemini |
   | **Backend** | API、インターフェース、データベース、ロジック、アルゴリズム | Codex |
   | **Fullstack** | フロントエンドとバックエンドの両方を含む | Codex ∥ Gemini 並列 |

---

### フェーズ1: 高速コンテキスト検索

`[Mode: Retrieval]`

**ace-tool MCPが利用可能な場合**、高速コンテキスト検索に使用してください:

計画の「主要ファイル」リストに基づいて、`mcp__ace-tool__search_context`を呼び出す:

```
mcp__ace-tool__search_context({
  query: "<計画コンテンツ（主要ファイル、モジュール、関数名を含む）に基づいたセマンティック照会>",
  project_root_path: "$PWD"
})
```

**検索戦略**:
- 計画の「主要ファイル」テーブルから対象パスを抽出
- 以下をカバーするセマンティック照会を構築: エントリファイル、依存モジュール、関連型定義
- 結果が不十分な場合、1～2回の再帰検索を追加

**ace-tool MCPが利用できない場合**、Claude Codeの内蔵ツールをフォールバックとして使用:
1. **Glob**: 計画の「主要ファイル」テーブルから対象ファイルを検索（例：`Glob("src/components/**/*.tsx")`）
2. **Grep**: キー記号、関数名、型定義をコードベース全体で検索
3. **Read**: 検出されたファイルを読んで完全なコンテキストを取得
4. **Task（Explore agent）**: より広い探索については、`Task`を`subagent_type: "Explore"`で使用

**検索後**:
- 検索されたコードスニペットを整理
- 実装用の完全なコンテキストを確認
- フェーズ3に進む

---

### フェーズ3: プロトタイプ取得

`[Mode: Prototype]`

**タスクタイプに基づいてルート**:

#### ルートA: Frontend/UI/Styles → Gemini

**制限**: コンテキスト < 32kトークン

1. Geminiを呼び出す（`~/.claude/.ccg/prompts/gemini/frontend.md`を使用）
2. 入力: 計画コンテンツ + 検索されたコンテキスト + 対象ファイル
3. OUTPUT: `統一差分パッチのみ。実際の修正を厳密に禁止します。`
4. **Geminiはフロントエンドデザイン権威です。そのCSS/React/Vueプロトタイプは最終ビジュアルベースライン**
5. **警告**: Geminiのバックエンドロジック提案を無視する
6. 計画に`GEMINI_SESSION`が含まれる場合: `resume <GEMINI_SESSION>`を優先

#### ルートB: Backend/Logic/Algorithms → Codex

1. Codexを呼び出す（`~/.claude/.ccg/prompts/codex/architect.md`を使用）
2. 入力: 計画コンテンツ + 検索されたコンテキスト + 対象ファイル
3. OUTPUT: `統一差分パッチのみ。実際の修正を厳密に禁止します。`
4. **Codexはバックエンドロジック権威です。その論理的推論とデバッグ機能を活用**
5. 計画に`CODEX_SESSION`が含まれる場合: `resume <CODEX_SESSION>`を優先

#### ルートC: Fullstack → 並列呼び出し

1. **並列呼び出し**（`run_in_background: true`）:
   - Gemini: フロントエンド部分を処理
   - Codex: バックエンド部分を処理
2. `TaskOutput`で両モデルの完全な結果を待機
3. 各自が計画から対応する`SESSION_ID`を使用して`resume`（未提供の場合は新規セッション作成）

**上記「マルチモデル呼び出し仕様」の`重要`な指示に従う**

---

### フェーズ4: コード実装

`[Mode: Implement]`

**コード主権としてClaudeが以下のステップを実行**:

1. **差分を読む**: Codex/Geminiから返された統一差分パッチを解析

2. **メンタルサンドボックス**:
   - 差分を対象ファイルに適用することをシミュレート
   - 論理的一貫性を確認
   - 潜在的な競合または副作用を特定

3. **リファクタリングと清掃**:
   - 「ダーティプロトタイプ」を**非常に読みやすく、保守可能で、エンタープライズグレード**のコードにリファクタリング
   - 冗長なコードを削除
   - プロジェクトの既存コード標準への準拠を確保
   - **必要がない限りコメント/ドキュメントを生成しない**。コードは自己説明的であるべき

4. **最小スコープ**:
   - 変更は要件スコープのみに限定
   - **副作用の強制レビュー**
   - 対象の修正を実施

5. **変更を適用**:
   - Edit/Writeツールを使用して実際の修正を実行
   - **必要なコードのみを修正**。ユーザーの他の既存機能に影響しない

6. **自己検証**（強く推奨）:
   - プロジェクトの既存lint / typecheck / テストを実行（関連スコープの最小化を優先）
   - 失敗した場合: 回帰を最初に修正してからフェーズ5に進む

---

### フェーズ5: 監査と配信

`[Mode: Audit]`

#### 5.1 自動監査

**変更が発効した後、すぐにCodexとGeminiを並列呼び出してコードレビュー**:

1. **Codexレビュー**（`run_in_background: true`）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 入力: 変更差分 + 対象ファイル
   - フォーカス: セキュリティ、パフォーマンス、エラーハンドリング、ロジック正確性

2. **Geminiレビュー**（`run_in_background: true`）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 入力: 変更差分 + 対象ファイル
   - フォーカス: アクセシビリティ、デザイン一貫性、ユーザーエクスペリエンス

`TaskOutput`で両モデルの完全なレビュー結果を待機。フェーズ3セッション（`resume <SESSION_ID>`）の再利用を優先してコンテキスト一貫性を確保。

#### 5.2 統合と修正

1. Codex + Geminiレビューフィードバックを統合
2. 信頼ルールで重み付け: バックエンドはCodexに従う、フロントエンドはGeminiに従う
3. 必要な修正を実行
4. リスクが許容可能なまでフェーズ5.1を繰り返す

#### 5.3 配信確認

監査がパスした後、ユーザーに報告:

```markdown
## 実行完了

### 変更概要
| ファイル | 操作 | 説明 |
|---------|------|------|
| path/to/file.ts | Modified | 説明 |

### 監査結果
- Codex: <Passed/Found N issues>
- Gemini: <Passed/Found N issues>

### 推奨事項
1. [ ] <推奨テストステップ>
2. [ ] <推奨検証ステップ>
```

---

## 主要ルール

1. **コード主権** – すべてのファイル修正はClaudeが実施、外部モデルはゼロの書き込みアクセス権
2. **ダーティプロトタイプリファクタリング** – Codex/Gemini出力はドラフトとして扱い、リファクタリング必須
3. **信頼ルール** – バックエンドはCodex従い、フロントエンドはGemini従う
4. **最小変更** – 必要なコードのみを修正、副作用なし
5. **強制監査** – 変更後にマルチモデルコードレビュー実施必須

---

## 使用方法

```bash
# 計画ファイルを実行
/ccg:execute .claude/plan/feature-name.md

# タスクを直接実行（コンテキスト内で既に議論された計画の場合）
/ccg:execute 前の計画に基づいてユーザー認証を実装
```

---

## /ccg:planとの関係

1. `/ccg:plan`は計画 + SESSION_IDを生成
2. ユーザーが「Y」で確認
3. `/ccg:execute`は計画を読み、SESSION_IDを再利用、実装を実行
