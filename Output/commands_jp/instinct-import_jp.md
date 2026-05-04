---
name: instinct-import
description: ファイルまたは URL からプロジェクト/グローバルスコープへインスティンクト をインポート
command: true
---

# インスティンクトインポートコマンド

## 実装

プラグインルートパスを使用してインスティンクト CLI を実行:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7] [--scope project|global]
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url>
```

ローカルファイルパスまたは HTTP(S) URL からインスティンクトをインポート。

## 使用方法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import team-instincts.yaml --dry-run
/instinct-import team-instincts.yaml --scope global --force
```

## 何をするか

1. インスティンクトファイルをフェッチ（ローカルパスまたは URL）
2. 形式を解析して検証
3. 既存インスティンクトとの重複をチェック
4. 新しいインスティンクトをマージまたは追加
5. 継承インスティンクトディレクトリに保存:
   - プロジェクトスコープ: `~/.claude/homunculus/projects/<project-id>/instincts/inherited/`
   - グローバルスコープ: `~/.claude/homunculus/instincts/inherited/`

## インポートプロセス

```
 Importing instincts from: team-instincts.yaml
================================================

Found 12 instincts to import.

Analyzing conflicts...

## New Instincts (8)
These will be added:
  ✓ use-zod-validation (confidence: 0.7)
  ✓ prefer-named-exports (confidence: 0.65)
  ✓ test-async-functions (confidence: 0.8)
  ...

## Duplicate Instincts (3)
Already have similar instincts:
  WARNING: prefer-functional-style
     Local: 0.8 confidence, 12 observations
     Import: 0.7 confidence
     → Keep local (higher confidence)

  WARNING: test-first-workflow
     Local: 0.75 confidence
     Import: 0.9 confidence
     → Update to import (higher confidence)

Import 8 new, update 1?
```

## マージ動作

既存 ID のインスティンクトをインポートする場合:
- 高信頼度インポートは更新候補になる
- 等しい/低信頼度インポートはスキップされる
- ユーザーが確認（`--force` が使用されない限り）

## ソース追跡

インポートされたインスティンクトはマーク付け:
```yaml
source: inherited
scope: project
imported_from: "team-instincts.yaml"
project_id: "a1b2c3d4e5f6"
project_name: "my-project"
```

## フラグ

- `--dry-run`: インポート前にプレビュー
- `--force`: 確認プロンプトをスキップ
- `--min-confidence <n>`: しきい値以上のインスティンクトのみをインポート
- `--scope <project|global>`: ターゲットスコープを選択（デフォルト: `project`）

## 出力

インポート後:
```
PASS: Import complete!

Added: 8 instincts
Updated: 1 instinct
Skipped: 3 instincts (equal/higher confidence already exists)

New instincts saved to: ~/.claude/homunculus/instincts/inherited/

Run /instinct-status to see all instincts.
```
