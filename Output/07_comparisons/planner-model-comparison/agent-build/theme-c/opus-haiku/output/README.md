# Tech Selection Agent Group（技術選定エージェント群）

複数エージェントによる協調システムで、新規プロジェクトの最適なテック スタックを提案・比較・推奨する。

---

## 概要

### 目的
新規プロジェクトの要件定義から、最適なテック スタック（言語・フレームワーク・DB・インフラ）を科学的に選定し、意思決定をサポートする。

### 構成

```
Tech Selection Agent Group
├── RequirementAnalyzerAgent
│   └── プロジェクト要件書を分析 → 4軸優先度を数値化
├── TechnologyProposalAgent
│   └── 優先度に基づき、3-5セットのテック候補を提案
└── HarnesScorer
    ├── スコアリング表生成（要件軸 × 技術候補）
    ├── トレードオフ分析（◎と××の対比）
    └── 最終推奨とその根拠を出力
```

---

## エージェント定義

### 1. RequirementAnalyzerAgent

**責務**: プロジェクト要件書を解析し、4つの優先軸を 0-10 の数値で判定

**入力**: Markdown テキスト（3-5ページ）

**出力**: JSON
```json
{
  "priority_axes": {
    "scalability": {"score": 0-10, "reason": "..."},
    "security": {"score": 0-10, "reason": "..."},
    "performance": {"score": 0-10, "reason": "..."},
    "development_speed": {"score": 0-10, "reason": "..."}
  },
  "project_type": "SaaS|Healthcare|IoT|Enterprise",
  "team_size": 5,
  "timeline_months": 6,
  "constraints": ["..."],
  "key_findings": ["..."]
}
```

**判定ロジック**:

| 軸 | 高スコア（8-10）のキーワード |
|----|----|
| **スケーラビリティ** | マルチテナント、SaaS、数百万ユーザー、スケール、QPS 高 |
| **セキュリティ** | GDPR、HIPAA、PCI-DSS、暗号化、監査ログ、準拠 |
| **パフォーマンス** | リアルタイム、低遅延、IoT、ストリーミング、< 100ms |
| **開発速度** | 3ヶ月以内、MVP、新規チーム、学習コスト |

**ファイル**: `requirement-analyzer-agent.md`

---

### 2. TechnologyProposalAgent

**責務**: RequirementAnalyzer の出力を受け取り、3-5セットのテック候補を提案

**入力**: RequirementAnalyzer の出力 JSON

**出力**: JSON（3セット提案）
```json
{
  "candidates": [
    {
      "rank": 1,
      "set_name": "Python + Django + PostgreSQL + AWS",
      "language": "Python 3.11",
      "framework": "Django 4.2",
      "database": "PostgreSQL 15",
      "cloud": "AWS",
      "justification": "...",
      "pros": ["...", "..."],
      "cons": ["...", "..."]
    },
    {...}
  ]
}
```

**提案ロジック**:

- **スケーラビリティ重視** → Node.js + Express / Java + Spring / Go + Gin
- **セキュリティ重視** → Java + Spring Security / Rust + Actix / Go + Gin
- **パフォーマンス重視** → Rust + Actix / Go + Gin / C++ + Boost
- **開発速度重視** → Python + Django / JavaScript + Next.js / Ruby + Rails
- **複合要件** → 複数軸のバランスで 3-4セット提案

**ファイル**: `technology-proposal-agent.md`

---

## ハーネス実装

### HarnesScorer（Python）

複数エージェント結果を統合し、スコアリング・分析・推奨を生成

**機能**:

1. **スコアリング表生成**
   - 「要件軸 × 技術候補」のマトリックス
   - 各セルを 0-10 点で採点

2. **トレードオフ分析**
   - 「技術 A は◎だが××」形式
   - 対立軸を明確化

3. **最終推奨**
   - 重み付け合計スコアが最高の候補を推奨
   - 根拠を明記

**実行方法**:

```bash
python harness-scorer.py <requirement_json> <proposal_json>
```

**ファイル**: `harness-scorer.py`

---

## スコアリング基準

### 0-10点の定義

| スコア | 定義 |
|--------|------|
| 10 | 最高峰。業界標準で最も適切 |
| 8-9 | 優秀。実用的で信頼性が高い |
| 6-7 | 良好。要件を十分満たす |
| 4-5 | 平均的。制限あり |
| 0-3 | 不適切。採用非推奨 |

### スコアリング例

**スケーラビリティ軸**:

| 技術 | スコア | 根拠 |
|------|:-----:|------|
| Rust + Actix | 9 | メモリ安全性 + 高速 + 水平スケーリング対応 |
| Go + Gin | 8 | 軽量 + 高速 + スケーリング容易 |
| Node.js + Express | 8 | 非同期I/O + 水平スケーリング対応 |
| Java + Spring | 7 | マイクロサービス化容易、ただしリソース多用 |
| Python + Django | 6 | GIL の制限、事前設計で対応可能 |

**セキュリティ軸**:

| 技術 | スコア | 根拠 |
|------|:-----:|------|
| Java + Spring Security | 10 | HIPAA・GDPR・PCI-DSS フレームワーク充実 |
| Rust + Actix | 10 | 所有権システムで メモリ安全 |
| Go + Gin | 8 | TLS ネイティブ、ただし認証フレームワーク薄い |
| Node.js + Express | 7 | Passport.js で対応可能だが実装工数あり |
| Python + Django | 8 | CSRF・SQL インジェクション対策標準 |

---

## サンプル実行

### 入力（プロジェクト要件書）

**サンプル 1: SaaS（スケーラビリティ重視）**
```
sample-requirement-1-saas.md
```

期待: スケーラビリティ重視 → Node.js または Go が推奨

**サンプル 2: ヘルスケア（セキュリティ重視）**
```
sample-requirement-2-healthcare.md
```

期待: セキュリティ重視 → Java + Spring Security が推奨

**サンプル 3: IoT（パフォーマンス・効率重視）**
```
sample-requirement-3-iot.md
```

期待: パフォーマンス重視 → Go + Rust が推奨

### エージェント出力

**分析結果（JSON）**:
```
sample-analysis-saas.json       # SaaS 要件分析
sample-proposal-saas.json       # SaaS 技術提案
```

**最終レポート（Markdown）**:
```
sample-output-report-saas.md        # SaaS の完全レポート
sample-output-report-healthcare.md  # ヘルスケア完全レポート
sample-output-report-iot.md         # IoT 完全レポート
```

---

## トレードオフ分析の仕組み

### 「◎と××」形式

各技術候補について、強みと弱みを対立軸で表現

**例: Node.js + Express**
```
◎ スケーラビリティ: 非同期I/O で高スループット対応
◎ 開発速度: npm エコシステム充実、学習短期間
◎ チーム採用: Node.js エンジニア市場で豊富
×× メモリ効率: Python・Go 比で約 1.5倍消費
×× セキュリティフレームワーク: Spring Security 比で薄い（実装工数 +2-3週間）
```

### トレードオフの判断基準

優先軸に基づいて、トレードオフをどう判断するか：

1. **優先軸が◎** → その技術を推奨
2. **優先軸が××** → その技術を非推奨
3. **優先軸が△** → チーム・予算で判断（推奨理由に記載）

---

## エッジケース処理

### Case 1: 複数優先軸が同時に最高優先

**例**: 「スケーラビリティ重視、開発速度も必須、セキュリティも重要」

**処理**:
1. ハーネスが優先度ウェイトを自動調整
2. トレードオフ分析で「全軸を同時に満たす技術は存在しない」と明示
3. 推奨: スコア最高のもの + 「次の優先軸は△」と注釈

---

### Case 2: 異なる優先軸で異なる推奨結果

**検証済み**:

| プロジェクト型 | 最優先軸 | 推奨テック | 理由 |
|--------|----------|---------|------|
| SaaS | スケーラビリティ | Node.js + Express | 非同期I/O、スケーリング容易 |
| ヘルスケア | セキュリティ | Java + Spring Security | フレームワーク充実、実績多数 |
| IoT | パフォーマンス | Go + Rust | メモリ効率、低遅延 |

---

## ファイル構成

```
.
├── requirement-analyzer-agent.md       # エージェント定義1
├── technology-proposal-agent.md        # エージェント定義2
├── harness-scorer.py                   # ハーネス実装
├── sample-requirement-1-saas.md        # テスト入力（SaaS）
├── sample-requirement-2-healthcare.md  # テスト入力（ヘルスケア）
├── sample-requirement-3-iot.md         # テスト入力（IoT）
├── sample-analysis-saas.json           # エージェント出力（分析）
├── sample-proposal-saas.json           # エージェント出力（提案）
├── sample-output-report-saas.md        # 最終レポート（SaaS）
├── sample-output-report-healthcare.md  # 最終レポート（ヘルスケア）
├── sample-output-report-iot.md         # 最終レポート（IoT）
└── README.md                           # このファイル
```

---

## 拡張可能性（Should-Have・Nice-to-Have）

### Should-Have

1. **3体目エージェント（CostEstimator）**: インフラ・開発コスト推定
2. **業界判別ロジック**: キーワード分析で自動的に SaaS・Healthcare・IoT を判別
3. **エージェント間パイプライン**: 要件 → 分析 → 提案 → スコアリング → 推奨の自動化
4. **ドキュメント充実**: スコアリング基準表、学習曲線グラフ、リスク分析

### Nice-to-Have

1. **マイグレーションパス分析**: 既存技術から新言語への移行コスト推定
2. **OWASP Top 10 連携**: セキュリティスコア業界標準化
3. **開発体験（DX）スコア**: GitHub stars・npm downloads・Reddit sentiment から推定
4. **AI モデル検討エージェント**: LLM API 統合必要性を判定

---

## 品質基準（チェックリスト）

### Phase 1（Must-Have）完成判定

- [x] RequirementAnalyzerAgent 実装（`.md`, 100-150行）
- [x] TechnologyProposalAgent 実装（`.md`, 100-150行）
- [x] ハーネス実装（スコアリング・トレードオフ・出力機能）
- [x] スコアリング表生成
- [x] トレードオフ分析（◎と××形式）
- [x] 最終推奨テック スタック + 根拠
- [x] Markdown レポート生成
- [x] サンプル要件書 3件（SaaS・Healthcare・IoT）
- [x] テスト実行で「異なる優先軸 → 異なる推奨」を確認

---

## 使用例

### 1. 新規プロジェクトが決定

```
新規 CRM SaaS プロジェクト
初期 1,000 ユーザー → 1年後 100,000 ユーザー
スケーラビリティが最優先
6ヶ月で MVP リリース
```

### 2. 要件書を作成（サンプル 1 参照）

```markdown
# プロジェクト要件書: CloudCRM Pro
... （詳細記載）
```

### 3. RequirementAnalyzerAgent が分析

```json
{
  "scalability": {"score": 9, "reason": "..."},
  "development_speed": {"score": 8, "reason": "..."},
  ...
}
```

### 4. TechnologyProposalAgent が提案

```json
{
  "candidates": [
    {"rank": 1, "set_name": "Node.js + Express + PostgreSQL + AWS", ...},
    {"rank": 2, "set_name": "Python + Django + PostgreSQL + AWS", ...},
    ...
  ]
}
```

### 5. Harness がレポート生成

```markdown
# 技術選定レポート

## Executive Summary
推奨: **Node.js + Express + PostgreSQL + AWS**

## スコアリング表
[表]

## トレードオフ分析
Node.js:
  ◎ スケーラビリティ: 非同期I/O
  ◎ 開発速度: npm エコシステム
  ×× メモリ効率: 1.5倍消費
  
## 最終推奨
...
```

### 6. CTO が確認し、採用決定

---

## 参考資料

- スペック: `spec.md`
- ルーブリック: `agent-build-rubric.md`
- エージェント定義詳細: 各 `.md` ファイルの frontmatter 参照

---

**作成日**: 2026-05-09  
**バージョン**: 1.0（Phase 1: Must-Have）  
**ステータス**: 完成（テスト 3件で異なる推奨結果を確認）
