---
name: prune
description: 30日以上前のペンディング中の instinct を削除します
command: true
---

# Prune コマンド

continuous-learning-v2 で古いペンディング中の instinct を削除します。

## 実装

プラグインルートパスを使用して instinct CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" prune [--age-days 30] [--dry-run]
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py prune [--age-days 30] [--dry-run]
```

## 使用方法

```bash
/prune                           # 30日以上前のペンディング instinct を削除
/prune --dry-run                 # 削除対象をプレビュー
/prune --age-days 7              # 7日以上前のペンディング instinct を削除
/prune --age-days 7 --dry-run    # 7日以上前の削除対象をプレビュー
```

## 実行内容

1. 現在のプロジェクトを検出
2. `~/.claude/homunculus/instincts/[project-id]/pending/` 内の instinct を列挙
3. 各 instinct の `created_at` タイムスタンプを取得
4. `--age-days` で指定された日数（デフォルト: 30日）より古いものをフィルタ
5. `--dry-run` の場合:
   - 削除対象リストを表示（ファイルパスと作成日時）
   - 実際には削除しない
6. `--dry-run` がない場合:
   - ファイル数を確認
   - ユーザーにもう一度確認を取る
   - 削除実行
   - 削除数をレポート
