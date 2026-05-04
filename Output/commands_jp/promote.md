---
name: promote
description: プロジェクトスコープ instinct をグローバルスコープに昇格させます
command: true
---

# Promote コマンド

continuous-learning-v2 でプロジェクトスコープ instinct をグローバルスコープに昇格させます。

## 実装

プラグインルートパスを使用して instinct CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" promote [instinct-id] [--force] [--dry-run]
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py promote [instinct-id] [--force] [--dry-run]
```

## 使用方法

```bash
/promote                      # 昇格候補を自動検出
/promote --dry-run            # 自動昇格候補をプレビュー
/promote --force              # プロンプトなしで適格なすべての候補を昇格
/promote grep-before-edit     # 現在のプロジェクトから 1 つの特定 instinct を昇格
```

## 実行内容

1. 現在のプロジェクトを検出
2. `instinct-id` が提供されている場合、その instinct のみを昇格させる（現在のプロジェクトに存在する場合）
3. それ以外の場合、以下の条件を満たすクロスプロジェクト候補を検出:
   - 最低 2 つのプロジェクトに表示
   - 信頼度閾値を満たす
4. 昇格された instinct を `~/.claude/homunculus/instincts/personal/` に書き込む（`scope: global` 付き）
