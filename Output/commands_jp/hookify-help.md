---
description: hookifyシステムのヘルプを取得します。
---

# Hookify ヘルプ

hookifyシステムの包括的なドキュメントを表示します。

## フックシステム概要

Hookifyは、Claude Codeのフックシステムと統合して望ましくない動作を防ぐルールファイルを作成します。

### イベントタイプ

- `bash`: Bashツール使用時にトリガーし、コマンドパターンにマッチ
- `file`: Write/Editツール使用時にトリガーし、ファイルパスにマッチ
- `stop`: セッション終了時にトリガー
- `prompt`: ユーザーメッセージ提出時にトリガーし、入力パターンにマッチ
- `all`: すべてのイベント時にトリガー

### ルールファイル形式

ファイルは `.claude/hookify.{name}.local.md` として保存：

```yaml
---
name: descriptive-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern to match"
---
ルールがトリガーされたときに表示するメッセージ。
複数行に対応します。
```

### コマンド

- `/hookify [description]` 新しいルールを作成し、説明なしの場合は会話を自動解析
- `/hookify-list` 構成されたルールをリスト表示
- `/hookify-configure` ルールをオン/オフに切り替え

### パターンTips

- 正規表現構文を使用
- `bash` の場合、完全なコマンド文字列にマッチ
- `file` の場合、ファイルパスにマッチ
- デプロイ前にパターンをテスト
