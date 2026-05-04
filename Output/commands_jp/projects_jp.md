---
name: projects
description: 既知のプロジェクトと、continuous-learning-v2のプロジェクトごとのinstinct統計を一覧表示
command: true
---

# Projectsコマンド

プロジェクトレジストリエントリとcontinuous-learning-v2のプロジェクトごとのinstinct/observation数を一覧表示。

## 実装

プラグインルートパスを使用してinstinct CLIを実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" projects
```

または、`CLAUDE_PLUGIN_ROOT`が設定されていない場合（マニュアルインストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py projects
```

## 使用方法

```bash
/projects
```

## 何をするか

1. `~/.claude/homunculus/projects.json`を読む
2. 各プロジェクトについて、以下を表示:
   - プロジェクト名、id、root、remote
   - 個人およびinherited instinct数
   - Observationイベント数
   - 最後に見たタイムスタンプ
3. グローバルinstinct合計も表示
