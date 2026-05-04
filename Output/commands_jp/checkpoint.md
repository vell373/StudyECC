---
description: 検証チェックを実行した後、ワークフローのチェックポイントを作成、検証、または一覧表示します。
---

# チェックポイント コマンド

ワークフロー内でチェックポイントを作成または検証します。

## 使用方法

`/checkpoint [create|verify|list] [name]`

## チェックポイントを作成

チェックポイントを作成する場合：

1. `/verify quick` を実行して現在の状態がクリーンであることを確認
2. チェックポイント名で git stash またはコミットを作成
3. チェックポイントを `.claude/checkpoints.log` にログ：

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. チェックポイント作成を報告

## チェックポイントを検証

チェックポイントに対して検証する場合：

1. ログからチェックポイントを読み込み
2. 現在の状態をチェックポイントと比較：
   - チェックポイント以降のファイルの追加
   - チェックポイント以降のファイルの変更
   - テストパス率（現在 vs その時）
   - カバレッジ（現在 vs その時）

3. 報告：
```
CHECKPOINT COMPARISON: $NAME
============================
ファイル変更: X
テスト: +Y パス / -Z 失敗
カバレッジ: +X% / -Y%
ビルド: [成功/失敗]
```

## チェックポイント一覧

すべてのチェックポイントを表示：
- 名前
- タイムスタンプ
- Git SHA
- ステータス（現在、後ろ、先）

## ワークフロー

一般的なチェックポイントフロー：

```
[開始] --> /checkpoint create "feature-start"
   |
[実装] --> /checkpoint create "core-done"
   |
[テスト] --> /checkpoint verify "core-done"
   |
[リファクタリング] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 引数

$ARGUMENTS:
- `create <name>` - 名前付きチェックポイントを作成
- `verify <name>` - 名前付きチェックポイントに対して検証
- `list` - すべてのチェックポイントを表示
- `clear` - 古いチェックポイントを削除（最後の5つを保持）
