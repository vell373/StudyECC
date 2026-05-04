---
name: instinct-export
description: プロジェクト/グローバルスコープからファイルにインスティンクトをエクスポートします。
command: /instinct-export
---

# インスティンクト エクスポート コマンド

インスティンクトを共有可能な形式にエクスポートします。以下に最適：
- チームメイトと共有
- 新しいマシンに転送
- プロジェクト規約に貢献

## 使用方法

```
/instinct-export                           # すべての個人インスティンクトをエクスポート
/instinct-export --domain testing          # テストインスティンクトのみをエクスポート
/instinct-export --min-confidence 0.7      # 高信頼度インスティンクトのみをエクスポート
/instinct-export --output team-instincts.yaml
/instinct-export --scope project --output project-instincts.yaml
```

## すること

1. 現在のプロジェクトコンテキストを検出
2. スコープ別にインスティンクトを読込：
   - `project`: 現在のプロジェクトのみ
   - `global`: グローバルのみ
   - `all`: プロジェクト + グローバル マージ（デフォルト）
3. フィルターを適用（`--domain`、`--min-confidence`）
4. YAML形式でエクスポートをファイルに書き込み（出力パス指定なしの場合は標準出力）

## 出力形式

YAMLファイルを作成：

```yaml
# インスティンクト エクスポート
# 生成日: 2025-01-22
# ソース: personal
# カウント: 12インスティンクト

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

# 関数形式を優先

## アクション
クラスより関数形パターンを使用します。
```

## フラグ

- `--domain <name>`: 指定したドメインのみをエクスポート
- `--min-confidence <n>`: 最小信頼度しきい値
- `--output <file>`: 出力ファイルパス（省略時は標準出力）
- `--scope <project|global|all>`: エクスポートスコープ（デフォルト: `all`）
