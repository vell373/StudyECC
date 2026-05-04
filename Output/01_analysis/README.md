# 01_analysis — ECC 解析メモ

AI によって ECC のフォルダ・ファイルを解析した内容を体系的にまとめる場所。
後から見てすぐに概要を把握できる「教科書」として機能する。

## ディレクトリ構成

```
01_analysis/
├── README.md                      ← このファイル（全体インデックス）
│
├── ecc_core/                      ← ECC コアファイルの解析
│   ├── ECC_SOUL.md                  SOUL.md（設計哲学）
│   ├── ECC_CLAUDE.md                CLAUDE.md（プロジェクト規約）
│   ├── ECC_RULES.md                 RULES.md（ルール構成の解説）
│   └── ECC_AGENTS.md                AGENTS.md（エージェント構成の解説）
│
├── agents/                        ← ECC/agents/ の解析
│   ├── agents_overview.md           全48エージェントの総合解析
│   ├── agents_architect.md          architect エージェント
│   ├── agents_chief-of-staff.md     chief-of-staff エージェント
│   ├── agents_code-reviewer.md      code-reviewer エージェント
│   ├── agents_planner.md            planner エージェント
│   ├── agents_security-reviewer.md  security-reviewer エージェント
│   └── agents_tdd-guide.md          tdd-guide エージェント
│
├── commands/                      ← ECC/commands/ の解析
│   └── commands_overview.md         全68コマンドの総合解析
│
├── rules/                         ← ECC/rules/ の解析
│   └── rules_overview.md            全87ルールの総合解析
│
└── skills/                        ← ECC/skills/ の解析
    └── skills_overview.md           全182スキルの総合解析
```

## ファイル命名規則

```
{フォルダ名}_overview.md     → フォルダ全体の概要
{フォルダ名}_{ファイル名}.md → 個別ファイルの解析

例:
  agents/agents_overview.md       → ECC/agents/ フォルダ全体の概要
  agents/agents_architect.md      → ECC/agents/architect.md の解析
  rules/rules_overview.md         → ECC/rules/ フォルダ全体の概要
```

## ファイル構成テンプレート

```markdown
# {対象} 解析

**解析日**: YYYY-MM-DD
**対象パス**: ECC/{path}
**関連トピック**: #agent #skill #hook など

## 概要
（1〜3文で何者かを説明）

## 構造・仕組み
（どう動くか、何が含まれるか）

## 設計上の特徴
（なぜこの設計なのか、気づいた工夫）

## 関連ファイル
（他のどのファイルと連携しているか）

## 参照元
（解析した ECC の実際のファイルパス）
```

---

## インデックス

### ECC コアファイル

| ファイル | 対象 | 解析日 |
|---------|------|--------|
| [ECC_SOUL.md](./ecc_core/ECC_SOUL.md) | ECC の設計哲学・行動原則 | 2026-05-03 |
| [ECC_CLAUDE.md](./ecc_core/ECC_CLAUDE.md) | プロジェクト規約 | 2026-05-03 |
| [ECC_RULES.md](./ecc_core/ECC_RULES.md) | ルール構成の解説 | 2026-05-03 |
| [ECC_AGENTS.md](./ecc_core/ECC_AGENTS.md) | エージェント構成の解説 | 2026-05-03 |
| [ecc_coreagents_strategy.md](./ecc_coreagents_strategy.md) | CoreAgents クロスプロジェクト共有戦略 | 2026-05-04 |

### agents（48 エージェント）

| ファイル | 対象 | 解析日 |
|---------|------|--------|
| [agents_overview.md](./agents/agents_overview.md) | **全体概要** — カテゴリ分類・設計思想 | 2026-05-04 |
| [agents_architect.md](./agents/agents_architect.md) | architect — システム設計の専門家 | 2026-05-03 |
| [agents_chief-of-staff.md](./agents/agents_chief-of-staff.md) | chief-of-staff — コミュニケーション管理 | 2026-05-03 |
| [agents_code-reviewer.md](./agents/agents_code-reviewer.md) | code-reviewer — コードレビュー | 2026-05-03 |
| [agents_planner.md](./agents/agents_planner.md) | planner — 実装計画の策定 | 2026-05-03 |
| [agents_security-reviewer.md](./agents/agents_security-reviewer.md) | security-reviewer — セキュリティ分析 | 2026-05-03 |
| [agents_tdd-guide.md](./agents/agents_tdd-guide.md) | tdd-guide — テスト駆動開発 | 2026-05-03 |

### commands（68 コマンド）

| ファイル | 対象 | 解析日 |
|---------|------|--------|
| [commands_overview.md](./commands/commands_overview.md) | **全体概要** — 10カテゴリ分類・設計思想 | 2026-05-04 |

### rules（87 ルール）

| ファイル | 対象 | 解析日 |
|---------|------|--------|
| [rules_overview.md](./rules/rules_overview.md) | **全体概要** — レイヤード設計・言語別構成 | 2026-05-04 |

### skills（182 スキル）

| ファイル | 対象 | 解析日 |
|---------|------|--------|
| [skills_overview.md](./skills/skills_overview.md) | **全体概要** — 11カテゴリ分類・設計思想 | 2026-05-04 |

### .cursor（Cursorシステム設定）

| ファイル | 対象 | 解析日 |
|---------|------|--------|
| [cursor_overview.md](./cursor/cursor_overview.md) | **全体概要** — フック・ルール・スキルの統合設定 | 2026-05-04 |

---

## ECC 全体構成の概要図

```
ECC/
├── .cursor/        ← Cursorエディタ固有の設定・自動化フック・ルール群
│
├── agents/  (48)   ← 専門エージェント（分離コンテキスト・自動起動）
│                     コアワークフロー / 言語別レビュアー / ビルド解決 / GAN / OSS
│
├── commands/ (68)  ← スラッシュコマンド（ユーザー起動）
│                     開発ワークフロー / マルチモデル / 言語別 / セッション管理 / 学習
│
├── rules/   (87)   ← ルール（セッション自動注入・「何をすべきか」）
│   ├── common/       共通原則（10ファイル）
│   └── {lang}/       言語固有の拡張（14言語）
│
└── skills/  (182)  ← スキル（深い専門知識・「どうやるか」）
    ├── エージェント・オーケストレーション (18)
    ├── 言語・フレームワーク別パターン (45)
    ├── インフラ・DevOps (10)
    ├── セキュリティ (12)
    ├── コード品質 (10)
    ├── アーキテクチャ・設計 (10)
    ├── 自己改善・学習 (8)
    ├── ビジネス・業界特化 (22)
    ├── コンテンツ・メディア (12)
    ├── 外部連携 (12)
    └── その他 (15)
```

### 三層の役割分担

| レイヤー | 起動方式 | 役割 | 例 |
|---------|---------|------|-----|
| **Rules** | 自動注入 | 「何をすべきか」— 基準・チェックリスト | テストカバレッジ 80%+、ハードコード禁止 |
| **Agents** | 自動/委譲 | 「誰がやるか」— 専門家への委譲 | code-reviewer、security-reviewer |
| **Skills** | 必要時参照 | 「どうやるか」— 深い手順・リファレンス | tdd-workflow、autonomous-loops |
| **Commands** | ユーザー起動 | 「いつやるか」— 明示的なアクション | /plan、/code-review、/sessions |

## 注意事項

- 解析内容は客観的な事実のみ。自分の考察は `02_notes/` に書く
- ECC のコードをそのままコピーせず、**要約・抽出**する
- 新しい解析を追加したら、このインデックスを更新する
