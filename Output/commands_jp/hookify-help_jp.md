---
description: hookify システムのヘルプを取得
---

包括的な hookify ドキュメントを表示します。

## フックシステム概要

Hookify は Claude Code のフックシステムと統合して、望ましくない動作を防ぐルールファイルを作成します。

### イベントタイプ

- `bash`: Bash ツール使用時にトリガーされ、コマンドパターンをマッチング
- `file`: Write/Edit ツール使用時にトリガーされ、ファイルパスをマッチング
- `stop`: セッション終了時にトリガー
- `prompt`: ユーザーメッセージ送信時にトリガーされ、入力パターンをマッチング
- `all`: すべてのイベントでトリガー

### ルールファイル形式

ファイルは `.claude/hookify.{name}.local.md` として格納されます:

```yaml
---
name: descriptive-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern to match"
---
Message to display when rule triggers.
Supports multiple lines.
```

### コマンド

- `/hookify [description]` は新しいルールを作成し、説明がない場合は会話を自動解析
- `/hookify-list` は設定されたルールをリスト表示
- `/hookify-configure` はルールをオン/オフに切り替え

### パターンのヒント

- regex 構文を使用
- `bash` の場合、完全なコマンド文字列に対してマッチング
- `file` の場合、ファイルパスに対してマッチング
- デプロイ前にパターンをテスト
