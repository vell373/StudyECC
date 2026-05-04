---
description: 会話解析や明示的な指示から望ましくない動作を防ぐためのフックを作成
---

会話パターンの解析または明示的なユーザー指示によって、望ましくない Claude Code の動作を防ぐためのフックルールを作成します。

## 使用方法

`/hookify [behavior to prevent の説明]`

引数が提供されない場合、現在の会話を解析して、防止する価値のある動作を見つけます。

## ワークフロー

### ステップ 1: 動作情報を収集

- 引数付き: ユーザーが説明した望ましくない動作を解析
- 引数なし: `conversation-analyzer` エージェントを使用して見つける:
  - 明示的な訂正
  - 繰り返された間違いへの不満反応
  - 元に戻された変更
  - 繰り返された同様の問題

### ステップ 2: 調査結果を提示

ユーザーに表示:

- 動作説明
- 提案されたイベントタイプ
- 提案されたパターンまたはマッチャー
- 提案されたアクション

### ステップ 3: ルールファイルを生成

承認された各ルールについて、`.claude/hookify.{name}.local.md` にファイルを作成:

```yaml
---
name: rule-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern"
---
Message shown when rule triggers.
```

### ステップ 4: 確認

作成されたルールと `/hookify-list` および `/hookify-configure` でそれらを管理する方法を報告します。
