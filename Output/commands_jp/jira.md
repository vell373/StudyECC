---
description: Jiraチケットを取得、要件を解析、ステータスを更新、またはコメントを追加します。jira-integrationスキルとMCPまたはREST APIを使用します。
---

# Jira コマンド

ワークフローから直接Jiraチケットと対話 — チケットを取得、要件を解析、コメントを追加、ステータスを遷移します。

## 使用方法

```
/jira get <TICKET-KEY>          # チケットを取得して解析
/jira comment <TICKET-KEY>      # 進捗コメントを追加
/jira transition <TICKET-KEY>   # チケットステータスを変更
/jira search <JQL>              # JQLでイシューを検索
```

## このコマンドが行うこと

1. **取得＆解析** — Jiraチケットを取得し、要件、受入基準、テストシナリオ、依存関係を抽出
2. **コメント** — チケットに構造化された進捗更新を追加
3. **遷移** — チケットをワークフロー状態を移動（To Do → In Progress → Done）
4. **検索** — JQLクエリを使用してイシューを検出

## 仕組み

### `/jira get <TICKET-KEY>`

1. Jira（MCPの `jira_get_issue` またはREST API経由）からチケットを取得
2. すべてのフィールドを抽出: サマリー、説明、受入基準、優先度、ラベル、リンク済みイシュー
3. オプションでコメントを取得して追加コンテキストを得る
4. 構造化分析を生成：

```
チケット: PROJ-1234
サマリー: [タイトル]
ステータス: [ステータス]
優先度: [優先度]
タイプ: [ストーリー/バグ/タスク]

要件:
1. [抽出された要件]
2. [抽出された要件]

受入基準:
- [ ] [チケットからの基準]

テストシナリオ:
- ハッピーパス: [説明]
- エラーケース: [説明]
- エッジケース: [説明]

依存関係:
- [リンク済みイシュー、API、サービス]

推奨される次のステップ:
- /plan で実装計画を作成
- `tdd-workflow` スキルでテストファーストに実装
```

### `/jira comment <TICKET-KEY>`

1. 現在のセッション進捗をサマリー（構築、テスト、コミット内容）
2. 構造化されたコメントとしてフォーマット
3. Jiraチケットに投稿

### `/jira transition <TICKET-KEY>`

1. チケットの利用可能な遷移を取得
2. ユーザーにオプションを表示
3. 選択した遷移を実行

### `/jira search <JQL>`

1. Jira に対してJQLクエリを実行
2. マッチするイシューのサマリーテーブルを返す

## 前提条件

このコマンドはJira認証情報を要求します。以下から選択：

**オプションA — MCPサーバー（推奨）:**
`jira` を `mcpServers` 設定に追加（`mcp-configs/mcp-servers.json` のテンプレート参照）。

**オプションB — 環境変数:**
```bash
export JIRA_URL="https://yourorg.atlassian.net"
export JIRA_EMAIL="your.email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

認証情報が不足している場合は停止してユーザーにセットアップを指示します。

## 他のコマンドとの統合

チケット解析後：
- `/plan` で要件から実装計画を作成
- `tdd-workflow` スキルでテスト駆動開発による実装
- 実装後に `/code-review` を使用
- `/jira comment` で進捗をチケットにポスト
- 作業完了時に `/jira transition` でチケットを移動

## 関連

- **スキル:** `skills/jira-integration/`
- **MCP設定:** `mcp-configs/mcp-servers.json` → `jira`
