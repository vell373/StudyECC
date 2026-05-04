---
name: tool
description: AIエージェントが実行可能なアクション。ユーザープロンプトに応答して、ファイル操作・コマンド実行・APIアクセス等を実現する機構
type: reference
---

# Tool（ツール）

## 定義

**Tool** は、Claude Code（およびそれに類するAIハーネス）がユーザープロンプトに応答して実行可能なアクション群を指す。Toolを通じて、AIエージェントは単なる「テキスト生成器」から「実世界に影響を与える自律エージェント」へと進化する。

## コア概念

### Tool の役割

1. **ユーザーの意図を実装する**: ユーザープロンプト（「このファイルを読み込んで」「コマンドを実行して」）をAIが実現するための実行基盤
2. **外部システムへのアクセス**: ファイルシステム・Git・シェル・API・データベース・外部サービスとの対話
3. **エージェントの自律性**: Tool なし = テキスト出力のみ。Tool あり = 実際に行動を起こせる

### Tool とAIハーネスの関係

```
ユーザープロンプト
    ↓
[AIモデル推論]
    ↓
Tool呼び出し（例: Bash, Read, Git）
    ↓
ファイル操作・コマンド実行等
    ↓
結果をモデルに返す
    ↓
ユーザーへ応答
```

## ECC における Tool の実装パターン

### 標準 Tool 一覧

Agentファイルの `tools:` フィールドに定義される（例: `code-reviewer.md`）:

```yaml
---
tools: ["Read", "Grep", "Glob", "Bash"]
---
```

| Tool | 用途 | 例 |
|------|------|-----|
| **Read** | ファイル内容を読む（行指定可） | ソースコード・設定ファイル・ドキュメント確認 |
| **Bash** | シェルコマンド実行 | git status, npm test, ls -la |
| **Glob** | ファイル検索（パターンマッチング） | `src/**/*.ts`, `*.json` |
| **Grep** | ファイル内容検索（正規表現対応） | 関数定義・エラーメッセージ検索 |
| **Edit** | ファイル内容を編集・置換 | コード修正・設定変更 |
| **Write** | 新規ファイル作成・全体上書き | ドキュメント作成・設定生成 |
| **Agent** | 別エージェントへの委譲 | 複雑なタスクを専門エージェントに依頼 |

### MCP（Model Context Protocol）Tool

ECCの高度な機能は **MCP サーバー** 経由でExpose される Tool:

- **Figma MCP**: デザインからコード生成（`get_design_context`, `upload_assets`）
- **GitHub MCP**: PR・Issue操作
- **Google Drive MCP**: ドキュメント作成・読み取り
- **Context7 MCP**: ライブラリドキュメント検索

設定例（MCP tool定義）:
```json
{
  "tools": ["Read", "Grep", "Bash"],
  "mcp": ["figma", "github"]
}
```

## Tool の実行フロー

### Pre-Tool Hook と Post-Tool Hook

ECCは各Tool実行の前後に Hook を発火させ、「Tool実行の可視化・ロギング・制御」を実現:

```
ユーザープロンプト
    ↓
[PreToolUse Hook] → "Bash tool about to run: ls"
    ↓
Tool実行（Bash: ls）
    ↓
[PostToolUse Hook] → "Bash tool completed with exit=0"
    ↓
ユーザーへ結果返却
```

**用途**:
- セッション活動ログの記録
- Tool実行の権限チェック（危険な操作を許可/ブロック）
- コスト計測（Tool実行にかかる時間・リソース）
- エラーの自動修復（Tool失敗時のリトライ推奨）

参考: `docs/fixes/HOOK-FIX-20260421.md`

## Tool 定義と Tool 呼び出しの違い

### Tool 定義（Harness側）
```markdown
---
tools: ["Read", "Bash", "Grep"]
---
```
→ 「このエージェントは Read, Bash, Grep を使うことができます」という **能力の宣言**

### Tool 呼び出し（AI推論側）
```
ユーザー: "package.json を読んで"
    ↓
[AI推論] → "Read tool を使って package.json を読むべき"
    ↓
Read("package.json")を実行
```
→ 実際に AIが「このタスクには Read が必要」と判断して呼び出す

## Tool 使用の原則（ECC哲学）

### 1. 権限と制御

- Tool には権限が紐付く（`permissions:` in settings.json）
- 危険な操作（`git reset --hard`, `rm -rf`）はユーザー確認が必須
- Hook で実行前に許可/拒否を判定

### 2. Tool の組み合わせ

単一 Tool ではなく、複数 Tool の組み合わせで強力な自動化を実現:

```
Glob（ファイル検索）
  ↓
Read（内容確認）
  ↓
Bash（テスト実行）
  ↓
Grep（エラー分析）
  ↓
Edit（修正）
```

### 3. Context 圧力への配慮

- MCP Tool は定義だけで Context を消費する（有効化 MCP サーバーは 10個以下推奨）
- `/mcp` コマンドで有効化中の MCP サーバーを確認・制御

参考: `docs/token-optimization.md`

## 実装例

### Agent での Tool 定義

```markdown
---
name: database-reviewer
description: データベーススキーマ・マイグレーションの品質チェック
tools: ["Read", "Bash", "Grep"]
model: sonnet
---

## Review Process

1. **マイグレーションファイルを読む** → `Read`
2. **既存スキーマを確認** → `Bash` + `Grep`
3. **互換性チェック** → `Bash`（SQL実行）
```

### Hook での Tool 実行監視

```json
{
  "event": "PreToolUse",
  "match": { "tool_name": "Bash" },
  "command": "check-if-destructive.sh"
}
```

## ECC における Tool の進化

### v1.8.0 以降の変化

- **Hook 信頼性向上**: SessionStart root fallback、Stop-phase session summaries
- **MCP 統合強化**: Figma Code Connect、GitHub API へのダイレクトアクセス
- **Cost 可視化**: Tool 実行ごとのコスト計測・レポート

### v2.0.0-rc.1（ECC 2.0 Alpha）

- **Rust制御平面** (`ecc2/`) による Tool 排序最適化
- **リスク スコアリング**: Tool 呼び出しに対して 4軸分析（base tool risk, file sensitivity, blast radius, irreversibility）で 0.0〜1.0 のリスクスコアを算出

参考: `research/ecc2-codebase-analysis.md`

## 関連概念

- **Hook**: Tool 実行の前後に発火する自動化ルール
- **MCP（Model Context Protocol）**: Tool・Resource・Prompt を提供するプロトコル
- **Permission**: Tool 実行権限（settings.json で定義）
- **Agent**: Tool を組み合わせた自律エージェント
- **Skill**: 特定ドメインの知識 + 推奨 Tool の組み合わせ

## 参考資料

- `agents/code-reviewer.md` — Tool 利用例（Read, Grep, Glob, Bash）
- `docs/token-optimization.md` — MCP Tool の Context 圧力管理
- `docs/fixes/HOOK-FIX-20260421.md` — Tool Hook の実装詳細
- `.cursor/skills/mcp-server-patterns/SKILL.md` — MCP Tool の開発パターン
- `research/ecc2-codebase-analysis.md` — ECC 2.0 の Tool リスク スコアリング

## キーポイント

1. **Tool は「能力」と「実行」の二層構造**: 定義（tools:）と呼び出し（実際の実行）
2. **Hook による可視化・制御**: 全 Tool 実行は Hook で監視・制御可能
3. **MCP Tool の Context コスト**: MCP サーバーは定義時点で Context を消費
4. **複数 Tool の組み合わせ**: 単独 Tool より「Tool チェーン」で強力な自動化を実現
5. **ECC 2.0 では「Tool リスク スコアリング」**: 危険度の自動判定により、ユーザー確認の効率化を推進

