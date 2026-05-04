---
name: promote
description: プロジェクトスコープのinstinctをグローバルスコープに昇格させる
command: true
---

# Promoteコマンド

continuous-learning-v2でinstinctをプロジェクトスコープからグローバルスコープに昇格。

## 実装

プラグインルートパスを使用してinstinct CLIを実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" promote [instinct-id] [--force] [--dry-run]
```

または、`CLAUDE_PLUGIN_ROOT`が設定されていない場合（マニュアルインストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py promote [instinct-id] [--force] [--dry-run]
```

## 使用方法

```bash
/promote                      # 昇格候補を自動検出
/promote --dry-run            # 自動昇格候補をプレビュー
/promote --force              # 確認なしにすべての適格候補を昇格
/promote grep-before-edit     # 現在のプロジェクトから1つの特定instinctを昇格
```

## 何をするか

1. 現在のプロジェクトを検出
2. `instinct-id`が提供されている場合、そのinstinctのみを昇格（現在のプロジェクトに存在する場合）
3. それ以外の場合、クロスプロジェクト候補を検出:
   - 最低2つのプロジェクトに存在
   - 信頼閾値を満たす
4. 昇格されたinstinctを`~/.claude/homunculus/instincts/personal/`に`scope: global`で書き込む
