# agents ディレクトリ 解析

**解析日**: 2026-05-04
**対象パス**: ECC/agents/
**関連トピック**: #エージェント #マルチエージェント #専門特化 #分離コンテキスト

## 概要

ECC の agents ディレクトリには **48 個の専門エージェント定義** が格納されている。各エージェントは Markdown 形式の frontmatter（name, description, tools, model）とプロンプト本体で構成され、Claude Code の `Task` ツールからサブエージェントとして呼び出される。エージェントは独立したコンテキストウィンドウで動作し、「著者バイアスの排除」を設計思想とする。

## 構造・仕組み

### frontmatter の構成要素

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `name` | エージェント識別子 | `architect`, `code-reviewer` |
| `description` | 用途と起動条件の説明 | `Use PROACTIVELY when...` |
| `tools` | 利用可能なツール | `["Read", "Grep", "Glob", "Bash"]` |
| `model` | 使用モデル | `opus`（深い推論）/ `sonnet`（高速） |

### カテゴリ分類（48 エージェント）

| カテゴリ | エージェント数 | 代表例 |
|---------|------------|--------|
| **コアワークフロー** | 6 | planner, architect, code-reviewer, tdd-guide, security-reviewer, chief-of-staff |
| **言語別レビュアー** | 10 | typescript-reviewer, python-reviewer, go-reviewer, rust-reviewer, java-reviewer, kotlin-reviewer, cpp-reviewer, csharp-reviewer, flutter-reviewer, database-reviewer |
| **ビルドエラー解決** | 7 | build-error-resolver, go-build-resolver, rust-build-resolver, java-build-resolver, kotlin-build-resolver, cpp-build-resolver, dart-build-resolver, pytorch-build-resolver |
| **GAN ハーネス** | 3 | gan-planner, gan-generator, gan-evaluator |
| **オープンソースパイプライン** | 3 | opensource-forker, opensource-sanitizer, opensource-packager |
| **分析・品質** | 7 | performance-optimizer, refactor-cleaner, silent-failure-hunter, type-design-analyzer, comment-analyzer, conversation-analyzer, pr-test-analyzer |
| **その他専門** | 12 | e2e-runner, doc-updater, docs-lookup, seo-specialist, healthcare-reviewer, harness-optimizer, loop-operator, a11y-architect, code-architect, code-explorer, code-simplifier |

### モデルルーティング

- **opus**: 深い推論が必要なエージェント（planner, architect, chief-of-staff）
- **sonnet**: 高速処理・パターン適用（code-reviewer, performance-optimizer, 各言語レビュアー）

## 設計上の特徴

1. **分離コンテキスト設計**: 各エージェントは独立したコンテキストウィンドウで動作し、他のエージェントの出力に影響されない。レビュアーがコードの著者と異なるコンテキストで動作することで「著者バイアス」を排除する
2. **ツール制限による安全性**: Read-only エージェント（planner, architect）はファイル書き込み不可。書き込み可能なエージェント（chief-of-staff, performance-optimizer）は明示的に `Write`, `Edit` が付与される
3. **言語別特化 + 共通パターン**: 共通の code-reviewer が汎用レビューを行い、言語固有の深い知識は専門レビュアーに委譲する二層構造
4. **GAN パターン**: planner → generator → evaluator の3エージェントが反復ループで品質を収束させるアーキテクチャ
5. **PROACTIVELY の設計**: description に `Use PROACTIVELY` と記載されたエージェントは、ユーザーの指示を待たず自動的に起動されることを想定

## 関連ファイル

- `ECC/rules/common/agents.md` — エージェントオーケストレーションのルール
- `ECC/commands/review-pr.md` — PR レビュー時のエージェント呼び出しコマンド
- `ECC/commands/gan-build.md`, `gan-design.md` — GAN ハーネスの起動コマンド
- `ECC/skills/team-builder/` — エージェントチーム構成スキル
- `ECC/skills/council/` — 4 ボイス議論スキル

## 参照元

ECC/agents/ 配下の全 48 ファイル:
- a11y-architect.md, architect.md, build-error-resolver.md, chief-of-staff.md, code-architect.md, code-explorer.md, code-reviewer.md, code-simplifier.md, comment-analyzer.md, conversation-analyzer.md, cpp-build-resolver.md, cpp-reviewer.md, csharp-reviewer.md, dart-build-resolver.md, database-reviewer.md, doc-updater.md, docs-lookup.md, e2e-runner.md, flutter-reviewer.md, gan-evaluator.md, gan-generator.md, gan-planner.md, go-build-resolver.md, go-reviewer.md, harness-optimizer.md, healthcare-reviewer.md, java-build-resolver.md, java-reviewer.md, kotlin-build-resolver.md, kotlin-reviewer.md, loop-operator.md, opensource-forker.md, opensource-packager.md, opensource-sanitizer.md, performance-optimizer.md, planner.md, pr-test-analyzer.md, python-reviewer.md, pytorch-build-resolver.md, refactor-cleaner.md, rust-build-resolver.md, rust-reviewer.md, security-reviewer.md, seo-specialist.md, silent-failure-hunter.md, tdd-guide.md, type-design-analyzer.md, typescript-reviewer.md
