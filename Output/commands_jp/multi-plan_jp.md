---
description: 本番コードを修正せずにマルチモデル実装計画を作成します。
---

# Plan - マルチモデルコラボレーション計画

マルチモデルコラボレーション計画 - コンテキスト検索 + デュアルモデル分析 → ステップバイステップ実装計画を生成。

$ARGUMENTS

---

## コアプロトコル

- **言語プロトコル**: ツール/モデルとやり取りする際は**英語**を使用、ユーザーには自分たちの言語で通信
- **強制並列**: Codex/Gemini呼び出しは`run_in_background: true`を使用する必須（単一モデル呼び出しを含む、メインスレッドをブロックしないように）
- **コード主権**: 外部モデルは**ゼロのファイルシステム書き込みアクセス権**を持ちます。すべての修正はClaudeが行う
- **ストップロス機構**: 現在のフェーズ出力が検証されるまで次のフェーズに進まない
- **計画のみ**: このコマンドはコンテキスト読み取りと`.claude/plan/*`計画ファイルへの書き込みを許可しますが、**本番コードを修正しない**

---

## マルチモデル呼び出し仕様

**呼び出し構文**（並列: `run_in_background: true`を使用）:

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <ロールプロンプトパス>
<TASK>
Requirement: <拡張要件>
Context: <検索されたプロジェクトコンテキスト>
</TASK>
OUTPUT: ステップバイステップ実装計画（疑似コード付き）。ファイルを修正しないでください。
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

**セッション再利用**: 各呼び出しは`SESSION_ID: xxx`を返します（通常はラッパーが出力）。その後の`/ccg:execute`使用のため**保存する必須**。

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

**計画タスク**: $ARGUMENTS

### フェーズ1: 完全なコンテキスト検索

`[Mode: Research]`

#### 1.1 プロンプト拡張（実行必須）

**ace-tool MCPが利用可能な場合**、`mcp__ace-tool__enhance_prompt`ツールを呼び出す:

```
mcp__ace-tool__enhance_prompt({
  prompt: "$ARGUMENTS",
  conversation_history: "<過去5～10会話ターン>",
  project_root_path: "$PWD"
})
```

拡張プロンプトを待機、**元の$ARGUMENTSを拡張結果に置き換え**てすべての後続フェーズで使用。

**ace-tool MCPが利用できない場合**: このステップをスキップし、すべての後続フェーズで元の`$ARGUMENTS`をそのまま使用。

#### 1.2 コンテキスト検索

**ace-tool MCPが利用可能な場合**、`mcp__ace-tool__search_context`ツールを呼び出す:

```
mcp__ace-tool__search_context({
  query: "<拡張要件に基づいたセマンティック照会>",
  project_root_path: "$PWD"
})
```

- 自然言語を使用してセマンティック照会を構築（Where/What/How）
- **仮定に基づいて回答しない**

**ace-tool MCPが利用できない場合**、Claude Codeの内蔵ツールをフォールバックとして使用:
1. **Glob**: パターンでファイルを検索（例：`Glob("**/*.ts")`、`Glob("src/**/*.py")`）
2. **Grep**: キー記号、関数名、クラス定義を検索（例：`Grep("className|functionName")`）
3. **Read**: 検出されたファイルを読んで完全なコンテキストを取得
4. **Task（Explore agent）**: より深い探索については、`Task`を`subagent_type: "Explore"`で使用してコードベース全体を検索

#### 1.3 完全性確認

- 関連するクラス、関数、変数の**完全な定義と署名**を取得する必須
- コンテキストが不十分な場合は、**再帰的検索**をトリガー
- 出力優先順位: エントリファイル + 行番号 + キー記号名；曖昧性を解決する必要がある場合のみ最小限のコードスニペットを追加

#### 1.4 要件アライメント

- 要件に曖昧性がまだ存在する場合は、**ユーザーへのガイディング質問を必ず出力**
- 要件の境界が明確になるまで（欠落なし、冗長性なし）

### フェーズ2: マルチモデルコラボレーション分析

`[Mode: Analysis]`

#### 2.1 入力配分

**CodexとGeminiを並列呼び出し**（`run_in_background: true`）:

**元の要件**（プリセット意見なし）を両モデルに配分:

1. **Codexバックエンド分析**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - フォーカス: 技術実現可能性、アーキテクチャ影響、パフォーマンス考慮、潜在的リスク
   - OUTPUT: 多角度ソリューション + メリット/デメリット分析

2. **Geminifrontend分析**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - フォーカス: UI/UX影響、ユーザーエクスペリエンス、ビジュアルデザイン
   - OUTPUT: 多角度ソリューション + メリット/デメリット分析

`TaskOutput`で両モデルの完全な結果を待機。**SESSION_ID**（`CODEX_SESSION`と`GEMINI_SESSION`）を保存。

#### 2.2 クロス検証

観点を統合し、最適化のために反復:

1. **合意を特定**（強いシグナル）
2. **相違点を特定**（重み付けが必要）
3. **補完的な強み**: バックエンドロジックはCodexに従う、フロントエンドデザインはGeminiに従う
4. **論理推論**: ソリューションの論理的ギャップを排除

#### 2.3 （オプションだが推奨）デュアルモデル計画ドラフト

Claudeの統合計画での欠落リスクを削減するため、両モデルに「計画ドラフト」を出力させられます（ファイルの修正は**依然として許可されていない**）:

1. **Codex計画ドラフト**（バックエンド権威）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
   - OUTPUT: ステップバイステップ計画 + 疑似コード（フォーカス: データフロー/エッジケース/エラーハンドリング/テスト戦略）

2. **Gemini計画ドラフト**（フロントエンド権威）:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
   - OUTPUT: ステップバイステップ計画 + 疑似コード（フォーカス: 情報アーキテクチャ/相互作用/アクセシビリティ/ビジュアル一貫性）

`TaskOutput`で両モデルの完全な結果を待機。それらの提案の主要な違いを記録。

#### 2.4 実装計画を生成（Claudeの最終版）

両方の分析を統合し、**ステップバイステップ実装計画**を生成:

```markdown
## 実装計画: <タスク名>

### タスクタイプ
- [ ] Frontend（→ Gemini）
- [ ] Backend（→ Codex）
- [ ] Fullstack（→ 並列）

### 技術的ソリューション
<Codex + Gemini分析から統合された最適ソリューション>

### 実装ステップ
1. <ステップ1> - 期待配信物
2. <ステップ2> - 期待配信物
...

### 主要ファイル
| ファイル | 操作 | 説明 |
|---------|------|------|
| path/to/file.ts:L10-L50 | Modify | 説明 |

### リスクと軽減
| リスク | 軽減 |
|--------|------|

### SESSION_ID（/ccg:execute使用用）
- CODEX_SESSION: <session_id>
- GEMINI_SESSION: <session_id>
```

### フェーズ2終了: 計画配信（実行ではない）

**/ccg:plan責務はここで終了、以下の操作を実行する必須**:

1. 完全な実装計画をユーザーに提示（疑似コード含む）
2. `.claude/plan/<feature-name>.md`に計画を保存（要件から機能名を抽出、例：`user-auth`、`payment-module`）
3. **太字**で出力プロンプト（実際に保存されたファイルパスを使用する必須）:

---
**計画が生成され、`.claude/plan/actual-feature-name.md`に保存されました**

**上記の計画をご確認ください。以下のことが可能です:**
- **計画を修正**: 何を調整する必要があるかをお知らせください。計画を更新します
- **計画を実行**: 次のコマンドを新しいセッションにコピー

```
/ccg:execute .claude/plan/actual-feature-name.md
```
---

**注記**: 上記の`actual-feature-name.md`は実際に保存されたファイル名に置き換える必須！

4. **現在のレスポンスを直ちに終了**（ここで停止。ツール呼び出しなし）

**絶対禁止**:
- ユーザーに「Y/N」を尋ねてから自動実行（実行は`/ccg:execute`の責務）
- 本番コードへの書き込み操作
- `/ccg:execute`またはその他の実装アクションを自動呼び出し
- ユーザーが明示的に修正をリクエストしていない場合のモデル呼び出し継続トリガー

---

## 計画保存

計画が完了した後、以下に保存:

- **初回計画**: `.claude/plan/<feature-name>.md`
- **イテレーションバージョン**: `.claude/plan/<feature-name>-v2.md`、`.claude/plan/<feature-name>-v3.md`...

計画ファイル書き込みはユーザーに計画を提示する前に完了する必須。

---

## 計画修正フロー

ユーザーが計画修正をリクエストする場合:

1. ユーザーフィードバックに基づいて計画コンテンツを調整
2. `.claude/plan/<feature-name>.md`ファイルを更新
3. 修正された計画を再提示
4. ユーザーに再度レビューまたは実行をプロンプト

---

## 次のステップ

ユーザーが承認した後、**手動で**実行:

```bash
/ccg:execute .claude/plan/<feature-name>.md
```

---

## 主要ルール

1. **計画のみ、実装なし** – このコマンドはコード変更を実行しません
2. **Y/Nプロンプトなし** – 計画のみ提示、ユーザーが次のステップを決定
3. **信頼ルール** – バックエンドはCodex従う、フロントエンドはGemini従う
4. 外部モデルは**ゼロのファイルシステム書き込みアクセス権**を持つ
5. **SESSION_ID引き継ぎ** – 計画は最後に`CODEX_SESSION` / `GEMINI_SESSION`を含む必須（`/ccg:execute resume <SESSION_ID>`使用用）
