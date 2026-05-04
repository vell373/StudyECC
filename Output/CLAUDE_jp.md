# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際に Claude Code（claude.ai/code）に指針を提供します。

## プロジェクト概要

これは **Claude Code プラグイン** - 本番環境対応のエージェント、スキル、フック、コマンド、ルール、MCP設定の集合です。このプロジェクトは Claude Code を使用したソフトウェア開発のための実証済みワークフローを提供します。

## テスト実行

```bash
# すべてのテストを実行
node tests/run-all.js

# 個別テストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

## アーキテクチャ

プロジェクトはいくつかのコアコンポーネントに編成されています：

- **agents/** - 委譲用の特化したサブエージェント（プランナー、コードレビュアー、TDDガイド等）
- **skills/** - ワークフロー定義とドメイン知識（コーディング標準、パターン、テスト）
- **commands/** - ユーザーが呼び出すスラッシュコマンド（/tdd、/plan、/e2e等）
- **hooks/** - トリガーベースの自動化（セッション永続化、ツール前後のフック）
- **rules/** - 常に従うべきガイドライン（セキュリティ、コーディングスタイル、テスト要件）
- **mcp-configs/** - 外部統合のための MCP サーバー設定
- **scripts/** - フックと設定用のクロスプラットフォーム Node.js ユーティリティ
- **tests/** - スクリプトとユーティリティのテストスイート

## キーコマンド

- `/tdd` - テスト駆動開発ワークフロー
- `/plan` - 実装計画
- `/e2e` - E2E テストの生成と実行
- `/code-review` - 品質レビュー
- `/build-fix` - ビルドエラーの修正
- `/learn` - セッションからパターンを抽出
- `/skill-create` - git 履歴からスキルを生成

## 開発ノート

- パッケージマネージャー検出：npm、pnpm、yarn、bun（`CLAUDE_PACKAGE_MANAGER` 環境変数またはプロジェクト設定で設定可能）
- クロスプラットフォーム：Node.js スクリプトによる Windows、macOS、Linux サポート
- エージェント形式：YAML フロントマター付き Markdown（name、description、tools、model）
- スキル形式：明確なセクション付き Markdown（使用時期、動作方法、例）
- スキル配置：skills/ でキュレーション；生成/インポートは ~/.claude/skills/ 配下。docs/SKILL-PLACEMENT-POLICY.md を参照
- フック形式：マッチャー条件とコマンド/通知フックを持つ JSON

## 貢献

CONTRIBUTING.md のフォーマットに従ってください：
- エージェント：フロントマター付き Markdown（name、description、tools、model）
- スキル：明確なセクション（使用時期、動作方法、例）
- コマンド：フロントマター付き Markdown（説明）
- フック：マッチャーとフック配列を持つ JSON

ファイル命名：小文字ハイフン区切り（例：`python-reviewer.md`、`tdd-workflow.md`）

## スキル

関連ファイルで作業する場合は、以下のスキルを使用してください：

| ファイル | スキル |
|---------|--------|
| `README.md` | `/readme` |
| `.github/workflows/*.yml` | `/ci-workflow` |

サブエージェントをスポーンする場合は、常に該当スキルの規約をエージェントのプロンプトに渡してください。
