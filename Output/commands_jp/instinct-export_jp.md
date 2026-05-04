---
name: instinct-export
description: プロジェクト/グローバルスコープから ファイルへインスティンクト をエクスポート
command: /instinct-export
---

# インスティンクトエクスポートコマンド

共有可能な形式へインスティンクトをエクスポートします。以下に最適:
- チームメンバーとの共有
- 新しいマシンへの転送
- プロジェクト規約へのコントリビューション

## 使用方法

```
/instinct-export                           # すべてのパーソナルインスティンクトをエクスポート
/instinct-export --domain testing          # テストインスティンクトのみをエクスポート
/instinct-export --min-confidence 0.7      # 高信頼度インスティンクトのみをエクスポート
/instinct-export --output team-instincts.yaml
/instinct-export --scope project --output project-instincts.yaml
```

## 何をするか

1. 現在のプロジェクトコンテキストを検出
2. 選択されたスコープ別にインスティンクトを読込:
   - `project`: 現在のプロジェクトのみ
   - `global`: グローバルのみ
   - `all`: プロジェクト + グローバルをマージ（デフォルト）
3. フィルターを適用（`--domain`、`--min-confidence`）
4. YAML スタイルのエクスポートをファイルに書込（出力パスが指定されていない場合は stdout）

## 出力形式

YAML ファイルを作成:

```yaml
# インスティンクトエクスポート
# 生成: 2025-01-22
# ソース: personal
# カウント: 12 インスティンクト

---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.8
domain: code-style
source: session-observation
scope: project
project_id: a1b2c3d4e5f6
project_name: my-app
---

# Prefer Functional Style

## Action
Use functional patterns over classes.
```

## フラグ

- `--domain <name>`: 指定されたドメインのみをエクスポート
- `--min-confidence <n>`: 最小信頼度しきい値
- `--output <file>`: 出力ファイルパス（省略時は stdout に出力）
- `--scope <project|global|all>`: エクスポートスコープ（デフォルト: `all`）
