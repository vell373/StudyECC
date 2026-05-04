---
name: projects
description: 既知のプロジェクトと instinct 統計情報をリスト表示します
command: true
---

# Projects コマンド

プロジェクトレジストリエントリと continuous-learning-v2 プロジェクト単位の instinct/observation カウントをリスト表示します。

## 実装

プラグインルートパスを使用して instinct CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" projects
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py projects
```

## 使用方法

```bash
/projects
```

## 実行内容

1. `~/.claude/homunculus/projects.json` を読み取る
2. 各プロジェクトに対して、以下を表示:
   - プロジェクト名、id、root、remote
   - Personal と Inherited instinct カウント
   - Observation イベントカウント
   - 最終確認タイムスタンプ
3. グローバル instinct 合計も表示
