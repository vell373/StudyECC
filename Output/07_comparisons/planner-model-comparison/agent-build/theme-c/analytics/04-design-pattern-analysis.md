# Theme C デザインパターン分析

**分析日**: 2026-05-09  
**テーマ**: Tech Selection Agent Group のアーキテクチャパターン比較

---

## Opus-Haiku パターン：集中型 Harness 設計

### アーキテクチャ構成

```
┌─────────────────────────────────────────────┐
│           Project Requirements              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  RequirementAnalyzerAgent                   │
│  (Keyword detection → Priority axes)        │
└──────────────┬──────────────────────────────┘
               │ JSON output
               ▼
┌─────────────────────────────────────────────┐
│  TechnologyProposalAgent                    │
│  (Stack candidates × 3-5)                  │
└──────────────┬──────────────────────────────┘
               │ JSON output
               ▼
┌─────────────────────────────────────────────┐
│  TechSelectionHarness (273行 Python)       │
│  ├─ integrate_analyses()                   │
│  ├─ calculate_weights()                    │
│  ├─ score_candidate()                      │
│  ├─ generate_scoring_matrix()              │
│  ├─ generate_tradeoff_analysis()           │
│  ├─ recommend_stack()                      │
│  └─ generate_report()                      │
└──────────────┬──────────────────────────────┘
               │ Markdown Report
               ▼
        Final Recommendation
```

### 責務配置図

| コンポーネント | 責務 | 行数 |
|-------------|------|------|
| RequirementAnalyzerAgent | キーワード判定 → 4軸スコア化 | ~140 |
| TechnologyProposalAgent | Stack知識ベース → 候補提案 | ~150 |
| TechSelectionHarness | 統合・スコアリング・レポート生成 | 273 |
| **合計** | - | **563行** |

### メリット

| メリット | 詳細 |
|---------|------|
| **実装速度** | Python実装で3週間で Phase 1完成 |
| **Code testability** | 273行のシンプルな Python classで全機能テスト可能 |
| **デバッグ容易性** | Single harness point で全ロジック traced/debugged 可能 |
| **責務が明確** | Harness = 統合・スコアリング・レポート、エージェント = input analysis |
| **実行速度** | JSON 処理 + Markdown 生成、計3分以内に完了 |

### デメリット

| デメリット | 詳細 |
|-----------|------|
| **拡張時の複雑化** | Phase 2 (Cost estimator等) 追加時、Harness に新メソッド追加必要 |
| **エージェント間の協調** | Feedback loop・Parallel processing が困難 |
| **Domain knowledge** | Industry-specific rules が Harness に硬コーディングされやすい |
| **スケーラビリティ** | Stack数が 50+ に増えるとスコアリング行列が計算重に |
| **保守性の限界** | 273行を超えると refactoring が複雑 (実装ガイドラインの300行超=分割) |

---

## Haiku-Opus パターン：分散型 Orchestrator 設計

### アーキテクチャ構成

```
┌─────────────────────────────────────────────┐
│           Project Requirements              │
└──────────────┬──────────────────────────────┘
               │
      ┌────────┴────────┬────────────┐
      ▼                 ▼            ▼
   ┌──────┐        ┌──────┐    ┌──────────┐
   │Req.  │        │Tech  │    │Cost      │
   │Ana.  │        │Prop. │    │Est.      │
   │(200) │        │(252) │    │(322)     │
   └──┬───┘        └───┬──┘    └────┬─────┘
      │                │             │
      └────────────────┼─────────────┘
                       │
                ┌──────▼─────────┐
                │ HarnessOrches- │
                │ trator (615)   │
                │ ├─ Priority 1: │
                │ │  Constraints │
                │ ├─ Priority 2: │
                │ │  Core axes   │
                │ ├─ Priority 3: │
                │ │  Fit         │
                │ └─ Priority 4: │
                │    Optimize    │
                └──────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    Scoring      Cost Impact    Conflict
    Matrix       Report         Flags
```

### 責務配置図

| コンポーネント | 責務 | 行数 |
|-------------|------|------|
| RequirementAnalyzerAgent | キーワード判定 + 業界検出 + conflict detection | 200 |
| TechnologyProposalAgent | 5-tier taxonomy + 30+ stacks + candidate filtering | 252 |
| CostEstimatorAgent | Year 1/3/5 cost simulation + ROI analysis | 322 |
| HarnessOrchestrator | 4-stage conflict resolution + priority weighting + reporting | 615 |
| **合計** | - | **1,389行** |

### メリット

| メリット | 詳細 |
|---------|------|
| **マルチエージェント分離** | 各エージェント が独立仕様で、新メンバー向けドキュメント明確 |
| **拡張性が高い** | Phase 3 で MarketMaturityScorer を追加しても既存エージェント不変 |
| **Domain richness** | 5-tier taxonomy、5業界 decision rules で industry-aware |
| **Sophistication** | 4段階矛盾検出、優先度階層化で複雑要件に対応 |
| **財務インパクト** | Cost estimator で Year 1-5 ROI 分析可能 |
| **Parallel processing準備** | Agent仕様なので、異なるモデル (Haiku/Sonnet/Opus) を並列実行可能 |

### デメリット

| デメリット | 詳細 |
|-----------|------|
| **仕様ドリブン** | Markdown spec のみ、実装コードなし → 手動検証必要 |
| **デバッグ複雑性** | 4エージェント × orchestrator で data flow を trace 困難 |
| **実装検証** | 実装して初めてエッジケース発見 (実装後 refactor コスト) |
| **セットアップ時間** | 仕様理解に時間必要 (Opus-Haiku は 273行を読むだけ) |
| **過設計の可能性** | Phase 2 実装しない場合、仕様の複雑さが無駄に |

---

## パターン比較表

### スケーラビリティ

| 側面 | Opus-Haiku | Haiku-Opus | 勝者 |
|-----|-----------|-----------|------|
| Stack数 (3→30→100) | Linear growth | Taxonomy-driven (fixed) | **Haiku-Opus** |
| 業界数 (3→5→10) | Hardcoding必要 | Rule table で容易 | **Haiku-Opus** |
| Cost model 追加 | Harness refactor | Estimator extend | **Haiku-Opus** |
| Agent追加 (2→4→6) | Sequential pipeline → complex | Multi-agent architecture | **Haiku-Opus** |

---

### デバッグ難度

| 観点 | Opus-Haiku | Haiku-Opus | 勝者 |
|-----|-----------|-----------|------|
| Data flow 追跡 | Simple (1 harness) | Complex (4 agents) | **Opus-Haiku** |
| エッジケース発見 | Runtime errors | Specification review | **Opus-Haiku** |
| 原因特定 | Python traceback | Spec logic vs. Agent output | **Opus-Haiku** |
| 修正速度 | 1 method change | Spec + implementation | **Opus-Haiku** |

---

### 初期実装速度

| フェーズ | Opus-Haiku | Haiku-Opus | 勝者 |
|---------|-----------|-----------|------|
| Spec策定 | 1週 (Opus) | 1週 (Haiku) | 同等 |
| 実装 | 2週 (Haiku) | 3週 (Opus) | **Opus-Haiku** |
| テスト・validation | 1週 | 1.5週 | **Opus-Haiku** |
| **Total** | **4週** | **5.5週** | **Opus-Haiku** |

---

### 長期保守性

| 要素 | Opus-Haiku | Haiku-Opus | 勝者 |
|-----|-----------|-----------|------|
| Year 2 拡張コスト | +25K token (Phase 2) | +4K token | **Haiku-Opus** |
| Team onboarding | 1日 (code読む) | 2日 (spec理解) | **Opus-Haiku** |
| 仕様との齟齬 | Code = truth (sync easy) | Spec vs. impl (diverge risk) | **Opus-Haiku** |
| Domain knowledge維持 | Keyword matching (limited) | Taxonomy documented | **Haiku-Opus** |
| Industry追加 | +8K token | +2K token | **Haiku-Opus** |

---

### Domain Specialization

| 要素 | Opus-Haiku | Haiku-Opus | 勝者 |
|-----|-----------|-----------|------|
| Stack taxonomy | Generic list | 5-tier + 30+ combos | **Haiku-Opus** |
| Industry rules | Keyword detection | 5業界 × decision table | **Haiku-Opus** |
| Cost model | なし | Year 1/3/5 ROI | **Haiku-Opus** |
| Conflict handling | Basic flagging | 4-level priority | **Haiku-Opus** |

---

## 教訓：なぜ Haiku-Opus が +12.9点で最大差分か

### パターンの本質的違い

**Opus-Haiku**: 「Execution focused」
```
Philosophy: Phase 1 の品質を最大化して MVP 完成
Cost: 初期 token 効率が高い (1.78 pt/K)
Risk: Phase 2 実装時に architectural refactor 必要
```

**Haiku-Opus**: 「Architecture focused」
```
Philosophy: Phase 1-3 の完全設計をして長期拡張性確保
Cost: 初期 token コストが高い (1.30 pt/K)
Benefit: Phase 2+ は incremental (+ 4K token のみ)
```

### スコア -12.5点 (5点差) の根拠

| 差分要因 | 点数 | 説明 |
|---------|---:|------|
| **Phase 2 Should-Have** | -2 | Cost estimator、Market maturity framework 実装差 |
| **Edge case coverage** | -1 | 3-level severity detection vs. basic flagging |
| **Domain taxonomy** | -2 | Keyword matching vs. 5-tier × 30+ stacks |
| **Industry adaptation** | 0 | 3業界 vs. 5業界 テストだけでは同点 |
| **Financial modeling** | -2 | Year 1-5 cost impact の有無 |
| **Architecture depth** | 0 | 設計思想の複雑さは同等 (code vs. spec 媒体差) |

### なぜ +12.9点か（最大差分）

Theme B との比較で、Theme C は以下の理由で差分が大きい：

1. **エージェント数増加 (2→4)**
   - Opus-Haiku は 2 に留まる (Phase 1)
   - Haiku-Opus は 4 まで完全設計

2. **仕様複雑性の増加**
   - Opus-Haiku spec: 629行 → Harness 273行 で 42% 削減
   - Haiku-Opus spec: 717行 → Orchestrator 615行 で実装密度が高い

3. **Domain richness の価値**
   - Theme B (Doc update): industry adaptation なし
   - Theme C (Tech selection): industry-specific rules が +2点の大きな要素

4. **Financial modeling の有無**
   - Theme B では cost concept なし
   - Theme C では Year 1-5 ROI analysis が -2点の差を生む

---

## 適用シナリオ

### Opus-Haiku が優位

```
Scenario: FinTech startup MVP (3ヶ月以内)
- スケーリング要件は不明確
- チームが初期段階
- Phase 1 (tech recommendation) のみ必要

Recommendation: Opus-Haiku
  + 3週で MVP 完成
  + 273行 code で検証可能
  + デバッグ・修正が迅速
```

### Haiku-Opus が優位

```
Scenario: Enterprise tech stack migration (12ヶ月+)
- Multiple industries (SaaS + Healthcare + Enterprise)
- Long-term ROI analysis critical
- Phase 2-3 での cost optimization が必要

Recommendation: Haiku-Opus
  + 5業界対応で汎用性高い
  + Year 1-5 cost modeling で意思決定支援
  + Phase 2+ 拡張が低コスト (+4K token のみ)
```

---

**分析完了**: 2026-05-09
