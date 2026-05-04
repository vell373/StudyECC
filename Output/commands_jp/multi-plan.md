---
description: 本番コードを変更しない、マルチモデル実装プランを作成します。
---

# プラン - マルチモデル協力的計画

マルチモデル協力的計画 - コンテキスト検索 + 双モデル分析 → ステップバイステップ実装プランを生成。

$ARGUMENTS

---

## コアプロトコル

- **言語プロトコル**: ツール/モデルと相互作用する場合は**英語**を使用し、ユーザーの言語でユーザーと通信します。
- **必須並列**: Codex/Gemini呼び出しは `run_in_background: true` を使用する必須（単一モデル呼び出しを含む、メインスレッドをブロックしない）
- **コード主権**: 外部モデルは**ファイルシステム書き込みアクセスなし**、Claudeによるすべての変更
- **ストップロスメカニズム**: 現在のフェーズ出力が検証されるまで次のフェーズに進まない
- **計画のみ**: このコマンドは `.claude/plan/*` プランファイルへのコンテキスト読み取りと書き込みを許可しますが、**本番コードを変更しません**

---

## マルチモデル呼び出し仕様

**呼び出し構文**（並列: `run_in_background: true` を使用）:

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <強化された要件>
Context: <取得されたプロジェクトコンテキスト>
</TASK>
OUTPUT: 疑似コード付きステップバイステップ実装プラン。ファイルを変更しないでください。
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

**セッション再利用**: 各呼び出しは `SESSION_ID: xxx` を返します（通常はラッパーで出力）、その後の`/ccg:execute` 使用用に**保存必須**。

**バックグラウンドタスクを待機**（最大タイムアウト 600000ms = 10分）:

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**:
- `timeout: 600000` を指定する必須、そうでなければデフォルト30秒がタイムアウトを引き起こします。
- 10分後も不完全な場合、`TaskOutput` での引き続きのポーリングを続ける、**決してプロセスを強制終了しないでください**
- 待機がタイムアウトによってスキップされた場合、**ユーザーに待機を続けるか、タスクを強制終了するかを尋ねるために `AskUserQuestion` を呼び出す必須**

---

## 実行ワークフロー

**計画タスク**: $ARGUMENTS

### フェーズ1: 完全なコンテキスト検索

`[Mode: Research]`

#### 1.1 プロンプト強化（実行必須）

**ace-tool MCPが利用可能な場合**、`mcp__ace-tool__enhance_prompt` ツールを呼び出す:

```
mcp__ace-tool__enhance_prompt({
  prompt: "$ARGUMENTS",
  conversation_history: "<最後の5～10会話ターン>",
  project_root_path: "$PWD"
})
```

強化されたプロンプトを待機し、**元の $ARGUMENTS をその後のすべてのフェーズの強化結果で置き換えます**。

**ace-tool MCPが利用不可の場合**: このステップをスキップし、すべての後続フェーズの元の `$ARGUMENTS` をそのまま使用します。

#### 1.2 コンテキスト検索

**ace-tool MCPが利用可能な場合**、`mcp__ace-tool__search_context` ツールを呼び出す:

```
mcp__ace-tool__search_context({
  query: "<強化された要件に基づいた意味検索>",
  project_root_path: "$PWD"
})
```

- 自然言語（Where/What/How）を使用して意味検索を構築
- **仮定に基づいて答えないでください**

**ace-tool MCPが利用不可の場合**、Claudeコード組み込みツールをフォールバックとして使用:
1. **Glob**: パターンでファイルを見つける（例：`Glob("**/*.ts")`、`Glob("src/**/*.py")`）
2. **Grep**: キーシンボル、関数名、クラス定義を検索（例：`Grep("className|functionName")`）
3. **Read**: 発見されたファイルを読み取り、完全なコンテキストを収集
4. **Task（Explore agent）**: より深い探索用、`Task` を `subagent_type: "Explore"` で使用

#### 1.3 完全性チェック

- 関連クラス、関数、変数の**完全な定義と署名**を取得必須
- コンテキストが不十分な場合、**再帰的検索**をトリガー
- 優先順位付き出力: エントリファイル + 行番号 + キーシンボル名; 曖昧性の解決が必要な場合のみ最小限のコードスニペットを追加

#### 1.4 要件アライメント

- 要件がまだ曖昧性を持つ場合、**ユーザーのガイディング質問を出力必須**
- 要件の境界が明確になるまで（欠落なし、冗長性なし）

### フェーズ2: マルチモデル協力的分析

`[Mode: Analysis]`

#### 2.1 入力を配布

**Codex と Gemini を並列呼び出し**（`run_in_background: true`）:

**元の要件**（プリセット意見なし）を両モデルに配布:

1. **Codex Backend分析**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - 焦点: 技術的実行可能性、アーキテクチャ影響、パフォーマンス考慮事項、潜在的リスク
   - OUTPUT: 多角的なソリューション + 利点/欠点分析

2. **Gemini Frontend分析**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - 焦点: UI/UX影響、ユーザーエクスペリエンス、ビジュアルデザイン
   - OUTPUT: 多角的なソリューション + 利点/欠点分析

`TaskOutput` で両モデルの完全な結果を待機。**SESSION_IDを保存**（`CODEX_SESSION` と `GEMINI_SESSION`）。

#### 2.2 クロスバリデーション

パースペクティブを統合し、最適化のために反復:

1. **合意を特定**（強いシグナル）
2. **分岐を特定**（重み付けが必要）
3. **相補的な強み**: バックエンドロジックはCodexに従う、フロントエンドデザインはGeminに従う
4. **論理的推論**: ソリューションで論理的ギャップを除去

#### 2.3 (オプションだが推奨) 双モデルプランドラフト

Claudeの合成プランで欠落のリスクを削減するため、両モデルに「プランドラフト」出力させることができます（**ファイル変更は許可されません**）:

1. **Codex Plan Draft**（Backend権威）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
   - OUTPUT: ステップバイステッププラン + 疑似コード（焦点: データフロー/エッジケース/エラーハンドリング/テスト戦略）

2. **Gemini Plan Draft**（Frontend権威）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
   - OUTPUT: ステップバイステッププラン + 疑似コード（焦点: 情報アーキテクチャ/相互作用/アクセシビリティ/ビジュアル一貫性）

`TaskOutput` で両モデルの完全な結果を待機、彼らの提案の主な違いを記録。

#### 2.4 実装プラン生成（Claude最終版）

両分析を合成し、**ステップバイステップ実装プラン**を生成:

```markdown
## 実装プラン: <タスク名>

### タスクタイプ
- [ ] フロントエンド（→ Gemini）
- [ ] バックエンド（→ Codex）
- [ ] フルスタック（→ 並列）

### 技術的ソリューション
<Codex + Gemini分析から合成された最適なソリューション>

### 実装ステップ
1. <ステップ1> - 期待される成果物
2. <ステップ2> - 期待される成果物
...

### キーファイル
| ファイル | 操作 | 説明 |
|--------|------|------|
| path/to/file.ts:L10-L50 | 変更 | 説明 |

### リスクと軽減策
| リスク | 軽減策 |
|-------|--------|

### SESSION_ID（/ccg:execute 使用向け）
- CODEX_SESSION: <session_id>
- GEMINI_SESSION: <session_id>
```

### フェーズ2終了: プラン配信（実行ではない）

**`/ccg:plan` の責任ここで終了、以下のアクションを実行必須**:

1. ユーザーに完全な実装プラン（疑似コード含む）を提示
2. プランを `.claude/plan/<feature-name>.md` に保存（要件からフィーチャー名を抽出、例：`user-auth`、`payment-module`）
3. 出力プロンプトを**太字**で出力（**保存したファイルパスを使用必須**）:

---
**プランが生成され `.claude/plan/actual-feature-name.md` に保存されました**

**上記のプランを確認してください。以下ができます：**
- **プランを変更**: 調整が必要なことを知らせてください。プランを更新します
- **プランを実行**: 新しいセッションに以下のコマンドをコピー

```
/ccg:execute .claude/plan/actual-feature-name.md
```
---

**注意**: 上記の `actual-feature-name.md` を実際の保存ファイル名で置き換える必須!

4. **現在の応答を即座に終了**（ここで停止。ツール呼び出しはもう不要。）

**絶対禁止**:
- ユーザーに「Y/N」を聞いてから自動実行（実行は `/ccg:execute` の責任）
- 本番コードへの書き込み操作
- `/ccg:execute` または他の実装アクションを自動呼び出し
- ユーザーが明示的に変更をリクエストしていないのにモデル呼び出しをトリガー続ける

---

## プラン保存

計画が完了した後、プランを保存:

- **最初の計画**: `.claude/plan/<feature-name>.md`
- **反復バージョン**: `.claude/plan/<feature-name>-v2.md`、`.claude/plan/<feature-name>-v3.md`...

プランファイル書き込みはユーザーへのプラン提示の前に完了必須。

---

## プラン変更フロー

ユーザーがプラン変更をリクエストした場合:

1. ユーザーフィードバックに基づいてプラン内容を調整
2. `.claude/plan/<feature-name>.md` ファイルを更新
3. 変更されたプランを再提示
4. ユーザーに再度確認または実行をプロンプト

---

## 次のステップ

ユーザーが承認した後、**手動で**実行:

```bash
/ccg:execute .claude/plan/<feature-name>.md
```

---

## 主要ルール

1. **計画のみ、実装なし** – このコマンドはコード変更を実行しません
2. **Y/Nプロンプトなし** – プランのみ提示、ユーザーが次のステップを決定
3. **信頼ルール** – バックエンドはCodexに従う、フロントエンドはGeminに従う
4. 外部モデルは**ファイルシステム書き込みアクセスなし**
5. **SESSION_ID ハンドオフ** – プランは `CODEX_SESSION` / `GEMINI_SESSION` を終わりに含む必須（`/ccg:execute resume <SESSION_ID>` 使用向け）
