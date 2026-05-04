# commands ディレクトリ 解析

**解析日**: 2026-05-04
**対象パス**: ECC/commands/
**関連トピック**: #コマンド #ワークフロー #自動化 #マルチモデル

## 概要

ECC の commands ディレクトリには **68 個のスラッシュコマンド定義** が格納されている。コマンドは `/command-name` 形式でユーザーが明示的に呼び出すアクションであり、frontmatter の `description` フィールドとプロンプト本体（実行手順・スクリプト）で構成される。エージェントの「自動起動」に対し、コマンドは「ユーザー起動」の設計。

## 構造・仕組み

### frontmatter の構成要素

| フィールド | 説明 |
|-----------|------|
| `description` | コマンドの目的と用途 |
| `name` | コマンド識別子（一部のみ） |
| `command` | コマンドフラグ（一部のみ） |
| `$ARGUMENTS` | ユーザーから渡される引数の受け取り |

### カテゴリ分類（68 コマンド）

#### 1. 開発ワークフロー系（14）
| コマンド | 説明 |
|---------|------|
| `plan.md` | 要件分析→実装計画→ユーザー確認 |
| `feature-dev.md` | ガイド付き機能開発 |
| `build-fix.md` | ビルドエラーの修正 |
| `refactor-clean.md` | デッドコード検出・除去 |
| `test-coverage.md` | カバレッジ分析・テスト生成 |
| `quality-gate.md` | 品質パイプライン実行 |
| `update-docs.md` | ドキュメント同期 |
| `update-codemaps.md` | アーキテクチャコードマップ生成 |
| `checkpoint.md` | 進捗チェックポイント |
| `prp-prd.md` | PRD（要件定義書）生成 |
| `prp-plan.md` | 包括的な実装計画 |
| `prp-implement.md` | 実装計画の実行 |
| `prp-commit.md` | 自然言語コミット |
| `prp-pr.md` | PR 作成 |

#### 2. マルチモデル連携系（5）
| コマンド | 説明 |
|---------|------|
| `multi-plan.md` | Codex + Gemini による協調計画 |
| `multi-execute.md` | マルチモデル実装計画の実行 |
| `multi-workflow.md` | フルスタック開発ワークフロー |
| `multi-backend.md` | バックエンド特化ワークフロー |
| `multi-frontend.md` | フロントエンド特化ワークフロー |

#### 3. 言語別ビルド・レビュー・テスト系（21）
| 言語 | ビルド | レビュー | テスト |
|------|--------|---------|--------|
| Go | go-build | go-review | go-test |
| Rust | rust-build | rust-review | rust-test |
| Kotlin | kotlin-build | kotlin-review | kotlin-test |
| Flutter | flutter-build | flutter-review | flutter-test |
| C++ | cpp-build | cpp-review | cpp-test |
| Python | — | python-review | — |
| Gradle | gradle-build | — | — |

#### 4. コードレビュー・品質系（4）
| コマンド | 説明 |
|---------|------|
| `code-review.md` | 汎用コードレビュー |
| `review-pr.md` | PR レビュー |
| `santa-loop.md` | 敵対的デュアルレビュー |
| `harness-audit.md` | リポジトリハーネス監査 |

#### 5. セッション管理系（4）
| コマンド | 説明 |
|---------|------|
| `sessions.md` | セッション履歴・エイリアス管理 |
| `save-session.md` | セッション状態保存 |
| `resume-session.md` | セッション復元 |
| `aside.md` | 脇道作業のコンテキスト管理 |

#### 6. 学習・進化系（8）
| コマンド | 説明 |
|---------|------|
| `learn.md` | セッションからパターン抽出 |
| `learn-eval.md` | 学習品質の自己評価 |
| `evolve.md` | instinct → command/skill/agent への進化 |
| `instinct-status.md` | 学習済み instinct の表示 |
| `instinct-export.md` | instinct のエクスポート |
| `instinct-import.md` | instinct のインポート |
| `promote.md` | プロジェクト→グローバルへの昇格 |
| `prune.md` | 古い instinct の削除 |

#### 7. GAN ハーネス系（2）
| コマンド | 説明 |
|---------|------|
| `gan-build.md` | 実装タスクの Generator/Evaluator ループ |
| `gan-design.md` | デザインタスクの Generator/Evaluator ループ |

#### 8. ループ・自動化系（4）
| コマンド | 説明 |
|---------|------|
| `loop-start.md` | 自律ループの起動 |
| `loop-status.md` | ループ状態の確認 |
| `model-route.md` | 最適モデルの推薦 |
| `pm2.md` | PM2 サービス構成生成 |

#### 9. Hookify 系（4）
| コマンド | 説明 |
|---------|------|
| `hookify.md` | フック作成 |
| `hookify-list.md` | フック一覧 |
| `hookify-configure.md` | フック設定 |
| `hookify-help.md` | フックヘルプ |

#### 10. その他（2）
| コマンド | 説明 |
|---------|------|
| `jira.md` | Jira チケット連携 |
| `skill-create.md` / `skill-health.md` | スキル管理 |
| `setup-pm.md` | パッケージマネージャ設定 |
| `projects.md` | プロジェクト一覧 |
| `auto-update.md` | 自動更新 |

## 設計上の特徴

1. **ユーザー起動 vs 自動起動の明確な分離**: コマンドは `/` プレフィックスで明示的に呼び出す。エージェントは自動的に起動する。この分離が ECC のコア設計思想
2. **言語別三位一体**: build → review → test の 3 コマンドが言語ごとに用意され、統一されたワークフローを提供
3. **マルチモデル協調**: `multi-*` コマンド群は Claude をオーケストレーターとし、Codex/Gemini をバックグラウンドで並列呼び出しする。「コード主権」原則により、ファイル書き込みは Claude のみ
4. **学習ループ**: learn → evolve → promote の流れで、セッション中のパターンが instinct → skill/command/agent へと進化する自己改善システム
5. **セッション永続化**: save-session / resume-session で、ステートレスな Claude Code セッション間のコンテキストをファイルベースで永続化

## 関連ファイル

- `ECC/agents/` — コマンドから呼び出されるエージェント群
- `ECC/rules/common/development-workflow.md` — 開発ワークフローのルール
- `ECC/skills/autonomous-loops/` — 自律ループパターン
- `ECC/skills/continuous-learning-v2/` — 学習システムのスクリプト

## 参照元

ECC/commands/ 配下の全 68 ファイル
