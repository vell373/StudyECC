---
name: evolve
description: インスティンクトを分析して、進化した構造を提案または生成する
command: true
---

# Evolve コマンド

## 実装

プラグインルートパスを使用してインスティンクト CLI を実行する:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" evolve [--generate]
```

または `CLAUDE_PLUGIN_ROOT` が設定されていない場合（手動インストール）:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

インスティンクトを分析して、関連するものを高レベルの構造にクラスタリングする:
- **コマンド**: インスティンクトがユーザーが呼び出すアクションを説明する場合
- **スキル**: インスティンクトが自動トリガーの動作を説明する場合
- **エージェント**: インスティンクトが複雑なマルチステップのプロセスを説明する場合

## 使い方

```
/evolve                    # すべてのインスティンクトを分析して進化を提案する
/evolve --generate         # evolved/{skills,commands,agents} 配下にファイルも生成する
```

## 進化ルール

### → コマンド（ユーザーが呼び出す）
インスティンクトがユーザーが明示的にリクエストするアクションを説明する場合:
- 「ユーザーが...を依頼するとき」に関する複数のインスティンクト
- 「新しい X を作成するとき」のようなトリガーを持つインスティンクト
- 繰り返し可能なシーケンスに従うインスティンクト

例:
- `new-table-step1`: 「データベーステーブルを追加するとき、マイグレーションを作成する」
- `new-table-step2`: 「データベーステーブルを追加するとき、スキーマを更新する」
- `new-table-step3`: 「データベーステーブルを追加するとき、型を再生成する」

→ 作成: **new-table** コマンド

### → スキル（自動トリガー）
インスティンクトが自動的に起きるべき動作を説明する場合:
- パターンマッチングのトリガー
- エラーハンドリングの応答
- コードスタイルの強制

例:
- `prefer-functional`: 「関数を書くとき、関数型スタイルを好む」
- `use-immutable`: 「状態を変更するとき、不変パターンを使用する」
- `avoid-classes`: 「モジュールを設計するとき、クラスベースの設計を避ける」

→ 作成: `functional-patterns` スキル

### → エージェント（深さ/独立性が必要）
インスティンクトが独立性から恩恵を受ける複雑なマルチステップのプロセスを説明する場合:
- デバッグワークフロー
- リファクタリングシーケンス
- リサーチタスク

例:
- `debug-step1`: 「デバッグするとき、最初にログを確認する」
- `debug-step2`: 「デバッグするとき、失敗しているコンポーネントを分離する」
- `debug-step3`: 「デバッグするとき、最小限の再現を作成する」
- `debug-step4`: 「デバッグするとき、テストで修正を確認する」

→ 作成: **debugger** エージェント

## 実行すること

1. 現在のプロジェクトコンテキストを検出する
2. プロジェクトとグローバルのインスティンクトを読む（ID の競合ではプロジェクトが優先される）
3. トリガー/ドメインパターンでインスティンクトをグループ化する
4. 以下を特定する:
   - スキル候補（2 つ以上のインスティンクトを持つトリガークラスター）
   - コマンド候補（高信頼度のワークフローインスティンクト）
   - エージェント候補（より大きな高信頼度クラスター）
5. 該当する場合は昇格候補（プロジェクト -> グローバル）を表示する
6. `--generate` が渡された場合、ファイルを以下に書き込む:
   - プロジェクトスコープ: `~/.claude/homunculus/projects/<project-id>/evolved/`
   - グローバルフォールバック: `~/.claude/homunculus/evolved/`

## 出力フォーマット

```
============================================================
  EVOLVE ANALYSIS - 12 instincts
  Project: my-app (a1b2c3d4e5f6)
  Project-scoped: 8 | Global: 4
============================================================

High confidence instincts (>=80%): 5

## SKILL CANDIDATES
1. Cluster: "adding tests"
   Instincts: 3
   Avg confidence: 82%
   Domains: testing
   Scopes: project

## COMMAND CANDIDATES (2)
  /adding-tests
    From: test-first-workflow [project]
    Confidence: 84%

## AGENT CANDIDATES (1)
  adding-tests-agent
    Covers 3 instincts
    Avg confidence: 82%
```

## フラグ

- `--generate`: 分析出力に加えて進化したファイルを生成する

## 生成されたファイルフォーマット

### コマンド
```markdown
---
name: new-table
description: Create a new database table with migration, schema update, and type generation
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table Command

[クラスタリングされたインスティンクトに基づいて生成されたコンテンツ]

## Steps
1. ...
2. ...
```

### スキル
```markdown
---
name: functional-patterns
description: Enforce functional programming patterns
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns Skill

[クラスタリングされたインスティンクトに基づいて生成されたコンテンツ]
```

### エージェント
```markdown
---
name: debugger
description: Systematic debugging agent
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger Agent

[クラスタリングされたインスティンクトに基づいて生成されたコンテンツ]
```
