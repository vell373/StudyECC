---
name: instinct-import
description: ファイルまたはURLからプロジェクト/グローバルスコープにインスティンクトをインポートします。
command: true
---

# インスティンクト インポート コマンド

## 実装

プラグインルートパスを使用してinstinct CLIを実行：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7] [--scope project|global]
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url>
```

ローカルファイルパスまたは HTTP(S) URL からインスティンクトをインポートします。

## 使用方法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import team-instincts.yaml --dry-run
/instinct-import team-instincts.yaml --scope global --force
```

## すること

1. インスティンクトファイルを取得（ローカルパスまたはURL）
2. 形式を解析して検証
3. 既存インスティンクトと重複をチェック
4. 新しいインスティンクトをマージまたは追加
5. 継承されたインスティンクトディレクトリに保存：
   - プロジェクトスコープ: `~/.claude/homunculus/projects/<project-id>/instincts/inherited/`
   - グローバルスコープ: `~/.claude/homunculus/instincts/inherited/`

## インポートプロセス

```
インポート中: team-instincts.yaml
================================================

インポート対象のインスティンクト: 12

競合を解析中...

## 新規インスティンクト（8）
追加されます：
  ✓ use-zod-validation（信頼度: 0.7）
  ✓ prefer-named-exports（信頼度: 0.65）
  ✓ test-async-functions（信頼度: 0.8）
  ...

## 重複インスティンクト（3）
既に同様のインスティンクトがあります：
  警告: prefer-functional-style
     ローカル: 信頼度 0.8、12観測
     インポート: 信頼度 0.7
     → ローカルを保持（信頼度が高い）

  警告: test-first-workflow
     ローカル: 信頼度 0.75
     インポート: 信頼度 0.9
     → インポートに更新（信頼度が高い）

8個新規追加、1個更新しますか？
```

## マージ動作

既存IDのインスティンクトをインポートする場合：
- 信頼度が高いインポートが更新候補になる
- 同等/低信頼度インポートはスキップ
- `--force` 使用時以外はユーザーが確認

## ソース追跡

インポートされたインスティンクトは以下でマーク：
```yaml
source: inherited
scope: project
imported_from: "team-instincts.yaml"
project_id: "a1b2c3d4e5f6"
project_name: "my-project"
```

## フラグ

- `--dry-run`: インポートせずプレビュー
- `--force`: 確認プロンプトをスキップ
- `--min-confidence <n>`: しきい値以上のインスティンクトのみをインポート
- `--scope <project|global>`: ターゲットスコープを選択（デフォルト: `project`）

## 出力

インポート後：
```
成功: インポート完了！

追加: 8インスティンクト
更新: 1インスティンクト
スキップ: 3インスティンクト（同等/より高い信頼度が既に存在）

新規インスティンクト保存先: ~/.claude/homunculus/instincts/inherited/

/instinct-status ですべてのインスティンクトを確認できます。
```
