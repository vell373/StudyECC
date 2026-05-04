---
description: "セッションメタデータ、エイリアス、履歴を管理します。セッションディレクトリとスクリプトベースの操作。"
---

# セッション管理

セッション履歴、エイリアス、メタデータを Node.js スクリプトで管理します。

## 使用方法

```
/sessions <operation> [options]
```

### 操作一覧

| 操作 | 説明 | 用途 |
|-----|------|------|
| `list` | セッションを一覧表示 | セッション履歴を確認 |
| `load` | セッションを復元 | 以前のセッションを再開 |
| `alias` | エイリアスを設定 | セッション名に別名をつける |
| `info` | セッション詳細を表示 | メタデータ・進捗を確認 |
| `archive` | セッションをアーカイブ | 古いセッションを整理 |
| `export` | セッションをエクスポート | セッションをファイルとして出力 |

## サブコマンド詳細

### list - セッション一覧

```bash
/sessions list
/sessions list --project my-app       # プロジェクトでフィルタ
/sessions list --limit 10             # 最新 N 件を表示
/sessions list --sort created|modified # ソート順序
```

出力例:
```
最近のセッション
─────────────────────────────────────────────────
ID      | 日付       | プロジェクト | 進捗    | タイトル
────────────────────────────────────────────────
abc123  | 2024-01-15 | my-app      | 進行中  | JWT 認証実装
def456  | 2024-01-14 | my-app      | 完了   | API ゲートウェイ
ghi789  | 2024-01-10 | tools       | ブロック| CLI バージョン管理
─────────────────────────────────────────────────
```

### load - セッション復元

```bash
/sessions load abc123                 # ID で復元
/sessions load my-project-session     # エイリアスで復元
/sessions load --project my-app       # プロジェクトの最新セッションを復元
```

実行時:
```bash
$ /sessions load abc123
セッションロード: abc123
プロジェクト: my-app
タイトル: JWT 認証実装
最終更新: 2024-01-15 14:32:45

セッション内容を復元しました。
/resume-session で完全な状態を読み込むことができます。
```

### alias - エイリアス設定

```bash
/sessions alias abc123 jwt-auth       # ID にエイリアスを設定
/sessions alias --remove jwt-auth     # エイリアスを削除
/sessions alias --list                # すべてのエイリアスを表示
```

設定後:
```bash
/sessions load jwt-auth  # ID 代わりにエイリアスで復元可能
```

### info - セッション詳細

```bash
/sessions info abc123                 # セッション詳細を表示
/sessions info jwt-auth               # エイリアスで詳細を表示
```

出力例:
```
セッション詳細: abc123
════════════════════════════════════════════
プロジェクト: my-app
タイトル: JWT 認証実装
ブランチ: feat/jwt-auth
ファイル: ~/.claude/session-data/2024-01-15-abc123de-session.tmp

進捗:
  達成: 4/7 (57%)
  進行中: 1 項目
  ブロッカー: 1 件

作成日時: 2024-01-15 10:00:00
最終更新: 2024-01-15 14:32:45
経過時間: 4h 32m

メモ: JWT をクッキーに保存する実装中
════════════════════════════════════════════
```

### archive - セッションアーカイブ

```bash
/sessions archive abc123              # セッションをアーカイブ
/sessions archive --days 30           # 30 日以上前のセッションをアーカイブ
/sessions archive --project my-app    # プロジェクトのセッションをアーカイブ
```

アーカイブ後:
```
状態: アーカイブされたセッションは ~/.claude/session-archive/ に移動
復元: /sessions unarchive abc123
```

### export - セッションエクスポート

```bash
/sessions export abc123 ~/path/export.md       # ファイルにエクスポート
/sessions export abc123 --format json          # JSON 形式でエクスポート
/sessions export abc123 --include-context      # コンテキストを含める
```

## セッションメタデータスキーマ

各セッションファイルには以下の JSON メタデータが埋め込まれます:

```json
{
  "session_id": "abc123de",
  "timestamp_created": "2024-01-15T10:00:00Z",
  "timestamp_modified": "2024-01-15T14:32:45Z",
  "project": "my-app",
  "branch": "feat/jwt-auth",
  "title": "JWT 認証実装",
  "progress": {
    "achieved": 4,
    "in_progress": 1,
    "planned": 2,
    "blockers": 1
  },
  "aliases": ["jwt-auth", "auth-work"],
  "tags": ["authentication", "nextjs", "priority-high"],
  "summary": "httpOnly クッキーに保存された JWT トークンを使用したユーザー認証..."
}
```

## エイリアス管理

複数のプロジェクトで作業する場合、エイリアスでセッションを整理:

```bash
# エイリアス設定
/sessions alias abc123 jwt-auth
/sessions alias def456 api-gateway
/sessions alias ghi789 cli-version

# エイリアスで復元
/sessions load jwt-auth
/sessions load api-gateway
/sessions load cli-version

# エイリアス一覧
/sessions alias --list
```

出力例:
```
エイリアス一覧
──────────────────────────────────
エイリアス       | セッション ID | プロジェクト
──────────────────────────────────
jwt-auth       | abc123        | my-app
api-gateway    | def456        | my-app
cli-version    | ghi789        | tools
──────────────────────────────────
```

## タグ管理

セッションにタグを付与して分類:

```bash
/sessions tag abc123 add authentication
/sessions tag abc123 add nextjs
/sessions tag abc123 add priority-high

/sessions list --tag authentication    # タグで検索
/sessions list --tag priority-high     # 優先度タグで検索
```

## セッション検索

複数の条件で検索:

```bash
/sessions list --project my-app --tag authentication --limit 5
/sessions list --branch feat/                                    # ブランチプレフィックス
/sessions list --modified-since 2024-01-10                      # 日付範囲
```

## セッション比較

2 つのセッション間の進捗差分を表示:

```bash
/sessions compare abc123 def456       # セッション間の変更を比較
```

出力例:
```
セッション比較: abc123 vs def456
════════════════════════════════════════════
メトリック      | abc123 | def456 | 変化
────────────────────────────────────────────
達成            | 4      | 6      | +2
進行中          | 1      | 0      | -1
ブロッカー      | 1      | 0      | -1
経過時間        | 4h32m  | 2h15m  | -2h17m
────────────────────────────────────────────

新規で達成されたもの:
- ✓ middleware.ts - 認証トークン検証

解決されたブロッカー:
- cookies().set() の動作確認済み
```

## セッション履歴管理

### ファイルシステム構成

```
~/.claude/
├── session-data/
│   ├── 2024-01-15-abc123de-session.tmp
│   ├── 2024-01-15-def456gh-session.tmp
│   ├── 2024-01-14-ijk789lm-session.tmp
│   └── session-metadata.json
├── session-archive/
│   ├── 2023-12-20-old123xx-session.tmp
│   └── archive-metadata.json
└── session-aliases.json
```

### メタデータファイル

`session-metadata.json`:
```json
{
  "sessions": {
    "abc123de": {
      "project": "my-app",
      "timestamp": "2024-01-15T14:32:45Z",
      "aliases": ["jwt-auth"]
    }
  }
}
```

## 関連コマンド

- `/save-session` - 現在のセッション状態を保存
- `/resume-session` - セッションを復元

## 関連

- スキル: `skills/session-management/`
