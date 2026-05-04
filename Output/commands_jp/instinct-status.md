---
name: instinct-status
description: 学習済みインスティンクト（プロジェクト + グローバル）を信頼度とともに表示
command: true
---

# インスティンクト ステータス コマンド

現在のプロジェクトのインスティンクトとグローバルインスティンクトを、ドメイン別にグループ化して表示します。

## 実装

プラグインルートパスを使用してinstinct CLIを実行：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合は：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 使用方法

```
/instinct-status
```

## すること

1. 現在のプロジェクトコンテキストを検出（git リモート/パスハッシュ）
2. `~/.claude/homunculus/projects/<project-id>/instincts/` からプロジェクトインスティンクトを読む
3. `~/.claude/homunculus/instincts/` からグローバルインスティンクトを読む
4. IDが衝突した場合の優先度ルール（プロジェクトがグローバルをオーバーライド）でマージ
5. ドメイン別にグループ化して、信頼度バーと観測統計とともに表示

## 出力形式

```
============================================================
  インスティンクト ステータス - 合計 12
============================================================

  プロジェクト: my-app (a1b2c3d4e5f6)
  プロジェクトインスティンクト: 8
  グローバルインスティンクト:  4

## プロジェクトスコープ（my-app）
  ### ワークフロー（3）
    ███████░░░  70%  grep-before-edit [project]
              トリガー: コード修正時

## グローバル（すべてのプロジェクトに適用）
  ### セキュリティ（2）
    █████████░  85%  validate-user-input [global]
              トリガー: ユーザー入力を処理するとき
```
