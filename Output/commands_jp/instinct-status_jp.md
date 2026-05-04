---
name: instinct-status
description: 学習したインスティンクト（プロジェクト + グローバル）を信頼度付きで表示
command: true
---

# インスティンクトステータスコマンド

現在のプロジェクトのインスティンクトとグローバルインスティンクトを、ドメインごとにグループ化して表示します。

## 実装

プラグインルートパスを使用してインスティンクト CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）、以下を使用:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 使用方法

```
/instinct-status
```

## 何をするか

1. 現在のプロジェクトコンテキストを検出（git リモート/パスハッシュ）
2. `~/.claude/homunculus/projects/<project-id>/instincts/` からプロジェクトインスティンクトを読込
3. `~/.claude/homunculus/instincts/` からグローバルインスティンクトを読込
4. 優先度ルールでマージ（ID が衝突した場合、プロジェクトがグローバルをオーバーライド）
5. ドメインごとにグループ化して、信頼度バーと観測統計で表示

## 出力形式

```
============================================================
  INSTINCT STATUS - 12 total
============================================================

  Project: my-app (a1b2c3d4e5f6)
  Project instincts: 8
  Global instincts:  4

## PROJECT-SCOPED (my-app)
  ### WORKFLOW (3)
    ███████░░░  70%  grep-before-edit [project]
              trigger: when modifying code

## GLOBAL (apply to all projects)
  ### SECURITY (2)
    █████████░  85%  validate-user-input [global]
              trigger: when handling user input
```
