# skills ディレクトリ 解析

**解析日**: 2026-05-04
**対象パス**: ECC/skills/
**関連トピック**: #スキル #専門知識 #リファレンス #ベストプラクティス

## 概要

ECC の skills ディレクトリには **182 個のスキルディレクトリ** が格納されており、各ディレクトリに `SKILL.md` を中心としたリファレンス資料が含まれる。スキルは「どうやるか」の深い専門知識を提供する実行ガイドであり、ルール（「何をすべきか」の基準）を補完する。コンテキストに注入されることで、Claude Code の実行品質を向上させる。

## 構造・仕組み

### ディレクトリ構成

各スキルは独立したディレクトリとして存在し、以下の構造を持つ：

```
skills/
├── {skill-name}/
│   ├── SKILL.md          ← メインのスキル定義
│   ├── references/       ← 参考資料（一部）
│   ├── agents/           ← スキル固有のエージェント（一部）
│   └── rules/            ← スキル固有のルール（一部）
```

### frontmatter の構成要素

| フィールド | 説明 |
|-----------|------|
| `name` | スキル識別子 |
| `description` | 用途と起動条件 |
| `origin` | 出典（多くは `ECC`） |
| `tools` | 利用可能なツール（一部のみ） |

### カテゴリ分類（182 スキル）

#### A. エージェント・オーケストレーション系（18）
| スキル | 説明 |
|--------|------|
| `autonomous-loops` | 自律ループパターン（Sequential Pipeline → Ralphinho DAG） |
| `continuous-agent-loop` | 継続的エージェントループ（autonomous-loops の後継） |
| `council` | 4ボイス意思決定（Architect/Skeptic/Pragmatist/Critic） |
| `santa-method` | 敵対的デュアルレビュー収束ループ |
| `team-builder` | エージェントチーム構成・ディスパッチ |
| `enterprise-agent-ops` | エンタープライズエージェント運用 |
| `agent-eval` | エージェント評価フレームワーク |
| `agent-harness-construction` | エージェントハーネス構築 |
| `agent-introspection-debugging` | エージェント内省・デバッグ |
| `agent-payment-x402` | エージェント決済（x402 プロトコル） |
| `agent-sort` | エージェントソート・選択 |
| `eval-harness` | Eval-Driven Development（EDD）フレームワーク |
| `verification-loop` | 包括的検証システム |
| `token-budget-advisor` | トークン予算アドバイザー |
| `context-budget` | コンテキスト予算管理 |
| `strategic-compact` | 戦略的コンテキスト圧縮 |
| `cost-aware-llm-pipeline` | コスト考慮型 LLM パイプライン |
| `prompt-optimizer` | プロンプト最適化 |

#### B. 言語・フレームワーク別パターン系（45）
| サブカテゴリ | スキル例 |
|------------|---------|
| **Python** | python-patterns, python-testing, pytorch-patterns, django-patterns, django-security, django-tdd, django-verification |
| **TypeScript/JS** | nextjs-turbopack, nestjs-patterns, nuxt4-patterns, bun-runtime |
| **Go** | golang-patterns, golang-testing |
| **Rust** | rust-patterns, rust-testing |
| **Java/Spring** | springboot-patterns, springboot-security, springboot-tdd, springboot-verification, jpa-patterns, java-coding-standards |
| **Kotlin** | kotlin-patterns, kotlin-testing, kotlin-coroutines-flows, kotlin-exposed-patterns, kotlin-ktor-patterns |
| **Swift** | swiftui-patterns, swift-concurrency-6-2, swift-actor-persistence, swift-protocol-di-testing |
| **Dart/Flutter** | dart-flutter-patterns, compose-multiplatform-patterns, flutter-dart-code-review |
| **C++** | cpp-coding-standards, cpp-testing |
| **C#** | csharp-testing |
| **Perl** | perl-patterns, perl-security, perl-testing |
| **Laravel** | laravel-patterns, laravel-security, laravel-tdd, laravel-verification, laravel-plugin-discovery |

#### C. インフラ・DevOps 系（10）
| スキル | 説明 |
|--------|------|
| `docker-patterns` | Docker パターン |
| `deployment-patterns` | デプロイメントパターン |
| `postgres-patterns` | PostgreSQL パターン |
| `clickhouse-io` | ClickHouse I/O |
| `database-migrations` | データベースマイグレーション |
| `git-workflow` | Git ワークフロー |
| `github-ops` | GitHub 操作 |
| `mcp-server-patterns` | MCP サーバーパターン |
| `terminal-ops` | ターミナル操作 |
| `dmux-workflows` | dmux ワークフロー |

#### D. セキュリティ系（12）
| スキル | 説明 |
|--------|------|
| `security-review` | セキュリティレビュー |
| `security-scan` | セキュリティスキャン（AgentShield） |
| `security-bounty-hunter` | バグバウンティ型脆弱性探索 |
| `safety-guard` | 破壊的操作の防止 |
| `gateguard` | ゲートガード |
| `hipaa-compliance` | HIPAA コンプライアンス |
| `healthcare-phi-compliance` | PHI コンプライアンス |
| `defi-amm-security` | DeFi AMM セキュリティ |
| `llm-trading-agent-security` | LLM 取引エージェントセキュリティ |
| `evm-token-decimals` | EVM トークンデシマル |
| `nodejs-keccak256` | Node.js Keccak256 |

#### E. コード品質・リファクタリング系（10）
| スキル | 説明 |
|--------|------|
| `coding-standards` | コーディング標準 |
| `tdd-workflow` | TDD ワークフロー |
| `e2e-testing` | E2E テスト |
| `ai-regression-testing` | AI 回帰テスト |
| `benchmark` | ベンチマーク |
| `plankton-code-quality` | コード品質分析 |
| `skill-comply` | スキルコンプライアンス可視化 |
| `skill-stocktake` | スキル在庫管理 |
| `repo-scan` | リポジトリスキャン |
| `workspace-surface-audit` | ワークスペース監査 |

#### F. アーキテクチャ・設計系（10）
| スキル | 説明 |
|--------|------|
| `architecture-decision-records` | ADR（アーキテクチャ決定記録） |
| `hexagonal-architecture` | ヘキサゴナルアーキテクチャ |
| `android-clean-architecture` | Android クリーンアーキテクチャ |
| `backend-patterns` | バックエンドパターン |
| `frontend-patterns` | フロントエンドパターン |
| `api-design` | API 設計 |
| `api-connector-builder` | API コネクタビルダー |
| `design-system` | デザインシステム |
| `codebase-onboarding` | コードベースオンボーディング |
| `code-tour` | コードツアー |

#### G. 自己改善・学習系（8）
| スキル | 説明 |
|--------|------|
| `continuous-learning` | 継続的学習 |
| `continuous-learning-v2` | 継続的学習 v2 |
| `knowledge-ops` | ナレッジ管理 |
| `rules-distill` | ルール蒸留 |
| `search-first` | リサーチファーストワークフロー |
| `deep-research` | 深いリサーチ |
| `iterative-retrieval` | 反復的情報取得 |
| `configure-ecc` | ECC 設定 |

#### H. ビジネス・業界特化系（22）
| スキル | 説明 |
|--------|------|
| `healthcare-*` | ヘルスケア系（EMR、CDSS、eval-harness、PHI） |
| `finance-billing-ops` | 金融・請求 |
| `customer-billing-ops` | 顧客請求 |
| `lead-intelligence` | リード情報 |
| `investor-*` | 投資家向け |
| `energy-procurement` | エネルギー調達 |
| `carrier-relationship-management` | 運送業者管理 |
| `customs-trade-compliance` | 通関・貿易コンプライアンス |
| `inventory-demand-planning` | 在庫需要計画 |
| `logistics-exception-management` | 物流例外管理 |
| `returns-reverse-logistics` | 返品・リバースロジスティクス |
| `production-scheduling` | 生産スケジューリング |
| `quality-nonconformance` | 品質不適合 |

#### I. コンテンツ・メディア系（12）
| スキル | 説明 |
|--------|------|
| `brand-voice` | ブランドボイス |
| `article-writing` | 記事執筆 |
| `content-engine` | コンテンツエンジン |
| `crosspost` | クロスポスト |
| `video-editing` | 動画編集 |
| `remotion-video-creation` | Remotion 動画作成 |
| `manim-video` | Manim 動画 |
| `videodb` | 動画データベース |
| `ui-demo` | UI デモ録画 |
| `fal-ai-media` | fal.ai メディア |
| `frontend-slides` | フロントエンドスライド |
| `dashboard-builder` | ダッシュボード構築 |

#### J. 外部連携系（12）
| スキル | 説明 |
|--------|------|
| `x-api` | X/Twitter API |
| `email-ops` | メール操作 |
| `messages-ops` | メッセージ操作 |
| `google-workspace-ops` | Google Workspace |
| `jira-integration` | Jira 連携 |
| `exa-search` | Exa 検索 |
| `social-graph-ranker` | ソーシャルグラフランキング |
| `unified-notifications-ops` | 統合通知 |
| `data-scraper-agent` | データスクレイパー |
| `visa-doc-translate` | ビザ書類翻訳 |
| `market-research` | 市場調査 |
| `product-*` | プロダクト分析 |

#### K. その他の特殊系（15）
| スキル | 説明 |
|--------|------|
| `gan-style-harness` | GAN スタイルハーネス |
| `nanoclaw-repl` | NanoClaw REPL |
| `hookify-rules` | Hookify ルール |
| `browser-qa` | ブラウザ QA |
| `click-path-audit` | クリックパス監査 |
| `canary-watch` | カナリアウォッチ |
| `openclaw-persona-forge` | ペルソナ生成 |
| `liquid-glass-design` | Liquid Glass デザイン |
| `ralphinho-rfc-pipeline` | RFC 駆動パイプライン |
| `project-flow-ops` | プロジェクトフロー |
| `connections-optimizer` | コネクション最適化 |
| `seo` | SEO |
| `accessibility` | アクセシビリティ |
| `ecc-tools-cost-audit` | ECC ツールコスト監査 |
| `content-hash-cache-pattern` | コンテンツハッシュキャッシュ |

## 設計上の特徴

1. **スキル = 深い専門知識のパッケージ**: ルールが「何をすべきか」のチェックリストなのに対し、スキルは「どうやるか」の詳細なリファレンスと手順を提供。SKILL.md は教科書のように読める設計
2. **When to Use / When NOT to Use**: 多くのスキルが明確な使用条件と非使用条件を定義。これにより不必要な起動を防止し、コンテキストウィンドウの消費を抑制
3. **サブリソースの内包**: 複雑なスキル（videodb, lead-intelligence, remotion-video-creation）はディレクトリ内に `references/`, `agents/`, `rules/` を持ち、自己完結型のパッケージとして機能
4. **バージョニング**: `continuous-learning` → `continuous-learning-v2`、`autonomous-loops` → `continuous-agent-loop` のように、互換性を保ちながら新バージョンへ移行する設計
5. **業界特化の深さ**: ヘルスケア、物流、金融、エネルギーなど、特定業界向けの深い知識を持つスキルが多数存在。ECC が汎用フレームワークでありながら、専門領域にも対応可能なことを示す

## 関連ファイル

- `ECC/rules/` — スキルの「何をすべきか」を定義するルール群
- `ECC/agents/` — スキルから呼び出されるエージェント群
- `ECC/commands/skill-create.md` — スキル作成コマンド
- `ECC/commands/skill-health.md` — スキルヘルスチェックコマンド

## 参照元

ECC/skills/ 配下の全 182 ディレクトリおよび各 SKILL.md ファイル
