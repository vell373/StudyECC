# Theme C スコア分布分析：Tech Selection Agent Group

**評価日**: 2026-05-09  
**テーマ**: 技術選定エージェント群  
**評価者**: Sonnet (agent-build-rubric.md v1.0)

---

## 総合スコア比較

| パターン | 要件充足度 | 品質・構造 | 完成度・動作性 | 創造性・判断力 | **合計** | **百分率** | **評価** |
|---------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| **Opus-Haiku** | 8 | 9 | 8 | 7 | **32/40** | **80.0%** | **B** |
| **Haiku-Opus** | 10 | 9 | 9 | 9 | **37/40** | **92.5%** | **A** |
| **差分** | **-2** | **0** | **-1** | **-2** | **-5** | **-12.5%** | Haiku-Opus優位 |

---

## 軸別スコア詳細分析

### 軸1：要件充足度（Axis 1: Requirements Fulfillment）

#### Opus-Haiku: 8/10 点
**バンド分類**: 8-9 (Advanced - Comprehensive Must-Have + Some Should-Have)

| 項目 | 実装状況 |
|-----|--------|
| **Must-Have Phase 1** | ✓ 完全達成 (2エージェント + harness + 3テスト) |
| **Should-Have Phase 2** | × 未実装 (Cost Estimator 明示的に延期) |
| **Nice-to-Have** | × なし |

**根拠**: RequirementAnalyzerAgent + TechnologyProposalAgent + harness-scorer.py (273行) で Phase 1 完成。Phase 2 は pragmatic deferral。テスト: SaaS (8.1/10)、Healthcare (9.1/10)、IoT (8.8/10) で業界別推奨が異なることを確認。

---

#### Haiku-Opus: 10/10 点
**バンド分類**: 10 (Perfect - Complete Must-Have + Comprehensive Should-Have)

| 項目 | 実装状況 |
|-----|--------|
| **Must-Have Phase 1** | ✓ 完全達成 (4エージェント + orchestrator) |
| **Should-Have Phase 2** | ✓ 実装 (Cost Estimator.md + Market Maturity) |
| **Nice-to-Have** | ✓ 豊富 (5-tier Taxonomy、5業界Decision Rules) |

**根拠**: 4エージェント (200+252+322+615行)、5-tier technology stack taxonomy (30+combinations)、5業界 (SaaS/Healthcare/IoT/Enterprise/EdTech) の decision rules、Year 1/3/5 cost projections

---

#### 差分分析: -2点

Phase 2 Should-Have (Cost Estimator、Market Maturity Framework) と Nice-to-Have (industry taxonomy、decision rules) の実装度が Haiku-Opus が優位。Opus-Haiku は Phase 1 に特化する実行重視、Haiku-Opus は長期拡張性を重視。

---

### 軸2：品質・構造（Axis 2: Quality & Structure）

#### Opus-Haiku: 9/10 点
**バンド分類**: 8-9 (Excellent - Clean Architecture)

| 側面 | 評価 |
|-----|------|
| **責務分離** | 優秀 (TechSelectionHarness で integrate/calculate/score/recommend 分離) |
| **コード複雑度** | 低い (平均39行 <50行 threshold) |
| **説明可能性** | 高い (deterministic keyword matching) |

**減点理由**: -1点: ユニットテストの欠如

---

#### Haiku-Opus: 9/10 点
**バンド分類**: 8-9 (Excellent - Sophisticated Design)

| 側面 | 評価 |
|-----|------|
| **マルチエージェント設計** | 高度 (4agent + orchestrator) |
| **conflict resolution** | 4段階優先度 hierarchy |
| **specification detail** | gradient rubric、industry rule tables |

**減点理由**: -1点: 仕様ドリブン（実装コードなし）での手動検証必要

---

#### 差分分析: 0点

異なる実装媒体 (code vs. spec) でも設計思想の質は同等。Opus-Haiku の simplicity と Haiku-Opus の sophistication は相互補完的。

---

### 軸3：完成度・動作性（Axis 3: Completeness & Functionality）

#### Opus-Haiku: 8/10 点
- パイプライン: 100% (require分析 → 正規化 → スコアリング → tradeoff → recommendation)
- エッジケース: 基本的 (矛盾検出、予算制約、timeline conflict)
- テスト: 3業界で異なる推奨確認

**減点理由**: -1点: Graceful degradation 限定的、-1点: Sparse document edge cases 対応不足

---

#### Haiku-Opus: 9/10 点
- パイプライン: 100% (+ cost projection)
- エッジケース: 包括的 (3-level severity flagging、graceful degradation documented)
- テスト: 5業界 × 複数シナリオ、cost modeling with infrastructure/development/operations breakdown

**減点理由**: -1点: 仕様ドリブン（実装での実世界validation 欠如）

---

#### 差分分析: -1点

Haiku-Opus の包括的エッジケース対応と業界拡張 (3→5) が Opus-Haiku の基本的対応を上回る。

---

### 軸4：創造性・判断力（Axis 4: Creativity & Judgment）

#### Opus-Haiku: 7/10 点
- 設計判断: 現実的 (Phase 1 に集中)
- 実装拡張: 最小限 (spec 厳密実装)
- industry-specific: 基本的 (keyword matching のみ)

**減点理由**: -2点: industry-adaptive algorithm なし、-1点: predictive feature なし

---

#### Haiku-Opus: 9/10 点
- 技術 taxonomy: 高度 (5-tier × 30+)
- industry adaptation: 5業界 × decision rule table with nuanced trade-off reasoning
- conflict resolution: 4-level priority (constraints > core > trade-offs > optimization)
- financial modeling: Year 1/3/5 で long-term ROI analysis

**減点理由**: -1点: 仕様ドリブン（proof-of-concept validation 欠如）

---

#### 差分分析: -2点

| 要素 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| Industry knowledge | Keyword matching | 5-tier taxonomy + 30+ combos |
| Financial insight | なし | Year 1/3/5 cost modeling |
| Conflict framework | Basic flagging | 4-level priority hierarchy |

---

## グレード判定

| Grade | スコア | パターン | 推奨用途 |
|-------|-----:|---------|--------|
| **A** | 92.5% | Haiku-Opus | 本番環境・長期保守・エンタープライズ |
| **B** | 80.0% | Opus-Haiku | MVP・PoC・学習・初期段階 |

---

## スコア差 -5点の分解

```
Axis 1 (Requirements):    8 vs 10 = -2  (Phase 2 Should-Have)
Axis 2 (Quality):         9 vs 9  =  0  (Architecture excellence)
Axis 3 (Completeness):    8 vs 9  = -1  (Edge case handling)
Axis 4 (Creativity):      7 vs 9  = -2  (Domain richness)
                         ──────────────
Total: -5 points (-12.5%)
```

**解釈**: Haiku-Opus の優位は「完全な Phase 2 実装」と「industry-aware decision framework」から生まれる。Opus-Haiku は「Phase 1 実行品質」で B grade を確保。

---

**評価完了**: 2026-05-09
