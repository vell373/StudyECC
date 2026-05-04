---
description: ワークフロー検証チェックを実行した後、チェックポイントを作成、確認、または一覧表示する。
---

# チェックポイントコマンド

ワークフロー内でチェックポイントを作成または確認。

## 使用方法

`/checkpoint [create|verify|list] [name]`

## チェックポイントを作成

チェックポイントを作成する場合:

1. `/verify quick`を実行して現在の状態がクリーンであることを確認
2. チェックポイント名でgit stashまたはコミットを作成
3. チェックポイントを`.claude/checkpoints.log`にログ:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. チェックポイント作成を報告

## チェックポイントを確認

チェックポイントに対して確認する場合:

1. ログからチェックポイントを読む
2. 現在の状態とチェックポイントを比較:
   - チェックポイント以来追加されたファイル
   - チェックポイント以来修正されたファイル
   - 今対チェックポイント時のテスト合格率
   - 今対チェックポイント時のカバレッジ

3. レポート:
```
チェックポイント比較: $NAME
============================
変更されたファイル: X
テスト: +Y合格 / -Z不合格
カバレッジ: +X% / -Y%
ビルド: [合格/不合格]
```

## チェックポイントを一覧表示

以下を含むすべてのチェックポイントを表示:
- 名前
- タイムスタンプ
- Git SHA
- ステータス（現在、遅れ、前進）

## ワークフロー

典型的なチェックポイントフロー:

```
[スタート] --> /checkpoint create "feature-start"
   |
[実装] --> /checkpoint create "core-done"
   |
[テスト] --> /checkpoint verify "core-done"
   |
[リファクタ] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 引数

$ARGUMENTS:
- `create <name>` - 名前付きチェックポイントを作成
- `verify <name>` - 名前付きチェックポイントに対して確認
- `list` - すべてのチェックポイントを表示
- `clear` - 古いチェックポイントを削除（最後の5つを保持）
