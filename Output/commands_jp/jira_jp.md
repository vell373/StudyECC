---
description: Jira チケットを取得して解析し、ステータスを更新、コメントを追加します。jira-integration スキルと MCP または REST API を使用します。
---

# Jira コマンド

ワークフローから直接 Jira チケットと対話 — チケットをフェッチ、要件を解析、コメントを追加、ステータスを遷移させます。

## 使用方法

```
/jira get <TICKET-KEY>          # チケットをフェッチして解析
/jira comment <TICKET-KEY>      # 進捗コメントを追加
/jira transition <TICKET-KEY>   # チケットステータスを変更
/jira search <JQL>              # JQL でイシューを検索
```

## このコマンドの処理

1. **取得と解析** — Jira チケットをフェッチして、要件、受け入れ基準、テストシナリオ、依存関係を抽出
2. **コメント** — 構造化された進捗更新をチケットに追加
3. **遷移** — ワークフロー状態を移動（To Do → In Progress → Done）
4. **検索** — JQL クエリを使用してイシューを検索

## 動作方法

### `/jira get <TICKET-KEY>`

1. Jira からチケットをフェッチ（MCP `jira_get_issue` または REST API 経由）
2. すべてのフィールドを抽出: 要約、説明、受け入れ基準、優先度、ラベル、リンク済みイシュー
3. 追加のコンテキスト用にコメントを任意でフェッチ
4. 構造化された解析を生成:

```
チケット: PROJ-1234
要約: [タイトル]
ステータス: [ステータス]
優先度: [優先度]
タイプ: [Story/Bug/Task]

要件:
1. [抽出された要件]
2. [抽出された要件]

受け入れ基準:
- [ ] [チケットの基準]

テストシナリオ:
- ハッピーパス: [説明]
- エラーケース: [説明]
- エッジケース: [説明]

依存関係:
- [リンク済みイシュー、API、サービス]

推奨される次のステップ:
- /plan で実装計画を作成
- `tdd-workflow` スキルを使用してテストファーストで実装
```

### `/jira comment <TICKET-KEY>`

1. 現在のセッション進捗を要約（何が構築された、テストされた、コミットされた）
2. 構造化されたコメントとしてフォーマット
3. Jira チケットにポスト

### `/jira transition <TICKET-KEY>`

1. チケットの利用可能な遷移をフェッチ
2. ユーザーにオプションを表示
3. 選択された遷移を実行

### `/jira search <JQL>`

1. Jira に対して JQL クエリを実行
2. マッチしたイシューの要約テーブルを返す

## 前提条件

このコマンドは Jira 認証情報が必要です。以下から選択:

**オプション A — MCP サーバー（推奨）:**
`jira` を `mcpServers` 設定に追加（テンプレートは `mcp-configs/mcp-servers.json` を参照）。

**オプション B — 環境変数:**
```bash
export JIRA_URL="https://yourorg.atlassian.net"
export JIRA_EMAIL="your.email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

認証情報が欠落している場合は、停止してユーザーにセットアップを指示してください。

## 他のコマンドとの統合

チケット解析後:
- `/plan` を使用して要件から実装計画を作成
- `tdd-workflow` スキルを使用してテスト駆動開発で実装
- 実装後に `/code-review` を使用
- `/jira comment` を使用して進捗をチケットに投稿
- `/jira transition` を使用して作業完了時にチケットを移動

## 関連

- **スキル:** `skills/jira-integration/`
- **MCP 設定:** `mcp-configs/mcp-servers.json` → `jira`
