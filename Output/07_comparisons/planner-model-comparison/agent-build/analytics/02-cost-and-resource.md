# Theme C トークンコスト・リソース分析

**評価日**: 2026-05-10  
**テーマ**: 技術選定エージェント群

---

## トークンコスト比較

### 全体コスト構造

| 項目 | Opus-Haiku | Haiku-Opus | 差分 |
|-----|-----------|-----------|-----|
| **Planner (設計)** | Opus | Haiku | -7.5K |
| **Generator (実装)** | Haiku | Opus | +9.2K |
| **合計** | **18.5K** | **31.2K** | **+12.7K (+68.6%)** |
| **効率 (点/k tokens)** | 1.73点/k | 1.19点/k | -0.54点/k |

---

### 詳細ブレークダウン

#### Opus-Haiku パターン

**Phase 1: Planner（Opus）**
```
spec.md 生成: 629行
Token Cost Estimate: 15,000 tokens
- 要件定義・技術スタック設計
- フェーズ計画（Phase 1/2）
- 品質基準の詳細化
```

**Phase 2: Generator（Haiku）**
```
2エージェント + Harness 実装: 902行
Token Cost Estimate: 3,500 tokens
- 仕様に従った忠実な実装（95%忠誠度）
- 3つのサンプルシナリオ実装
- 総実装行数: 902行 （低コスト）
```

**合計**: **18.5K tokens**
- 効率: 32点 / 18.5K = **1.73点/k**
- 実装速度: 4-5営業日

---

#### Haiku-Opus パターン

**Phase 1: Planner（Haiku）**
```
spec.md 生成: 717行
Token Cost Estimate: 7,500 tokens
- Compact 仕様（Phase 1/2 暗に含める）
- 業界判別ロジックの暗示
- Should-Have への柔軟性を留保
```

**Phase 2: Generator（Opus）**
```
4エージェント + Harness + Cost計算: 1,332行
Token Cost Estimate: 23,700 tokens
- 仕様の creative interpretation（75%忠誠度, 25%拡張）
- Cost-estimator の自発的追加
- Confidence scoring の導入
- 5つのサンプルシナリオ実装
- 複雑な orchestration logic
- 総実装行数: 1,332行 （高コスト）
```

**合計**: **31.2K tokens**
- 効率: 37点 / 31.2K = **1.19点/k**
- 実装速度: 6-7営業日

---

## Cost-Benefit 分析

### 初期投資（Phase 1 のみ）

```
Opus-Haiku:
  投資額: $92.50 (18.5K tokens × $0.005/k)
  成果物: 32/40点 (80%)
  ROI: 3.46点/$

Haiku-Opus:
  投資額: $156.00 (31.2K tokens × $0.005/k)
  成果物: 37/40点 (92.5%)
  ROI: 2.37点/$
  
プレミアム: +$63.50 で +5点（+12.5%）
```

**判定**: Opus-Haiku が初期投資効率で優位（46%安い）

---

### 長期投資分析（Phase 2 以降）

#### シナリオ1: Opus-Haiku パターンで Phase 2 拡張

```
Phase 2 追加（Month 5-6）:
- Cost-estimator agent 追加: +456行
- Harness refactor: +150行
- テスト追加（複数業界対応）: +200行
- 追加Token Cost: +8,000 tokens

累積Cost:
  Phase 1: 18.5K tokens
  Phase 2: +8.0K tokens
  ─────────────────────
  合計: 26.5K tokens

累積スコア: 37点（Haiku-Opus 同等に upgrade）
最終ROI: 37点 / 26.5K = 1.40点/k
```

**問題**: Phase 2 で Harness を大幅 refactor が必要（保守コスト増）

---

#### シナリオ2: Haiku-Opus を最初から実装

```
初期投資: 31.2K tokens
初期スコア: 37点（即座に本番品質達成）
初期ROI: 1.19点/k

Phase 2 拡張（Month 3-4）: Cost-Estimator は既に統合
  追加拡張（高度な feature）: +2,000 tokens
  追加スコア: +1-2点
  累積: 33.2K tokens, 38-39点
  最終ROI: 1.16点/k（ほぼ flat）
```

**利点**: Phase 2 が軽量（既存構造を活用）

---

#### シナリオ3: Hybrid Approach（推奨）

```
Timeline:
Month 1-2:   Opus-Haiku で MVP launch
             投資: 18.5K tokens
             成果: 32点 (MVP品質)
             Cost: $92.50
             
Month 3-4:   User feedback 収集 + Phase 2 計画
             追加投資: 0
             収益機会創出: 実際の用途確認
             
Month 5-6:   Haiku-Opus に upgrade
             Phase 1 再実装: 7.5K tokens (Planner)
             Phase 1-2 統合実装: 12.5K tokens (Generator の差分)
             追加投資: 20K tokens
             
累積投資: 18.5K + 20K = 38.5K tokens
最終成果: 37点 (A グレード)
最終ROI: 37点 / 38.5K = 0.96点/k

段階別ROI:
- Phase 1 (MVP): 32点 / 18.5K = 1.73点/k
- Phase 2 (Upgrade): +5点 / 20K = 0.25点/k
- 加重平均: 1.09点/k
```

**利点**:
- リスク最小化（MVP で市場 fit 確認後に upgrade）
- 段階的投資（初期負担 $92.50）
- User feedback ベースの投資判断

---

## Token Cost の詳細内訳

### Opus-Haiku（18.5K）の内訳

| 項目 | Token数 | 割合 |
|-----|---------|------|
| Planner (Opus Spec) | 15,000 | 81% |
| RequirementAnalyzerAgent | 1,200 | 6.5% |
| TechnologyProposalAgent | 1,100 | 6% |
| Harness + Tests | 1,200 | 6.5% |

**特徴**: Planner が圧倒的（81%）

---

### Haiku-Opus（31.2K）の内訳

| 項目 | Token数 | 割合 |
|-----|---------|------|
| Planner (Haiku Spec) | 7,500 | 24% |
| RequirementAnalyzerAgent | 1,500 | 4.8% |
| TechnologyProposalAgent | 2,000 | 6.4% |
| CostEstimatorAgent | 3,200 | 10.2% |
| HarnessOrchestrator | 4,500 | 14.4% |
| Quality Visualization | 2,100 | 6.7% |
| Tests (5業界 × 8 edge cases) | 2,800 | 9% |
| Documentation | 1,100 | 3.5% |

**特徴**: Generator が圧倒的（76%）

---

## 投資効果の分析

### 単位当たりの品質向上コスト

```
スコア改善: +5点 (32→37)
追加投資: +12.7K tokens (+68.6%)

改善効率: 5点 / 12.7K tokens = 0.39点/k

別の見方：
  1点あたりの追加コスト = 12.7K / 5 = 2,540 tokens
  金額換算: $12.70 / 1点
```

---

## 運用効率への影響

### Opus-Haiku の運用コスト（推定）

```
1回の技術提案処理:
  - Harness の基本的矛盾検出: 1-2K tokens/実行
  - 3つのサンプル業界対応: 固定
  - 推奨結果生成: 0.5K tokens
  
年間推定（50回処理）:
  計算: 50 × 1.5K = 75K tokens追加
  年間コスト: $375
```

### Haiku-Opus の運用コスト（推定）

```
1回の技術提案処理:
  - 業界判別: 1K tokens
  - 複数レベルの矛盾検出: 1.5K tokens
  - Cost 見積もり計算: 2K tokens
  - Confidence score 計算: 0.5K tokens
  - Report generation (複数形式): 1K tokens
  
年間推定（50回処理）:
  計算: 50 × 6K = 300K tokens追加
  年間コスト: $1,500
```

**差分**: +$1,125/年（4倍のコスト）

---

## 長期 ROI（Year 1-5）

### Year 1

```
Opus-Haiku:
  初期投資: $92.50
  運用: $375
  計: $467.50
  成果: 32点 (MVP品質)

Haiku-Opus:
  初期投資: $156.00
  運用: $1,500
  計: $1,656.00
  成果: 37点 (本番品質)

差分: Haiku-Opus が +$1,188.50 高い
```

### Year 3

```
Opus-Haiku (累積):
  Phase 1: $92.50
  Phase 2 upgrade: $100 (upgrade cost)
  運用 3年: $375 × 3 = $1,125
  累積: $1,317.50
  成果: 37点 (upgrade後)

Haiku-Opus (累積):
  初期: $156.00
  運用 3年: $1,500 × 3 = $4,500
  累積: $4,656.00
  成果: 37点 (最初から本番品質)

差分: Haiku-Opus が +$3,338.50 高い
      しかし「時間」で本番品質実現（Month 3 vs Month 1）
```

### Year 5

```
Opus-Haiku (累積):
  初期 + Phase 2: $192.50
  運用 5年: $375 × 5 = $1,875
  累積: $2,067.50

Haiku-Opus (累積):
  初期: $156.00
  運用 5年: $1,500 × 5 = $7,500
  累積: $7,656.00

Cost 差分: Haiku-Opus が +$5,588.50 高い
但し、Haiku-Opus は Year 1 から本番品質を提供
→ ビジネス価値化の時間が 4-6ヶ月早い
```

---

## 投資判断の指標

### Opus-Haiku を選ぶべき場合

```
条件:
- 予算制約が厳しい（< $200 Year 1）
- MVP → 本番の段階展開が許容される
- 技術スタック選定が単純な場合
- 初期市場検証を優先する
- コスト最適化を重視

投資効率: 1.73点/k （最高）
リスク: 中（Phase 2 refactor の不確実性）
推奨: スタートアップ・初期段階プロジェクト
```

### Haiku-Opus を選ぶべき場合

```
条件:
- 予算に余裕がある（> $1,500 Year 1）
- 初日から本番品質を求める
- 技術スタック選定が複雑（多業界対応）
- Cost 見積もりが意思決定に必須
- 長期メンテナンスを重視
- ビジネス価値化を早期に実現したい

投資効率: 1.19点/k （低いが品質面で補う）
リスク: 低（設計が完全）
推奨: エンタープライズ・製品開発
```

---

## 結論

### Cost-Benefit Summary

| 指標 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| **初期投資** | $92.50 （安） | $156.00 （高） |
| **投資効率（点/K）** | 1.73 （高） | 1.19 （低） |
| **本番品質到達** | 4-6ヶ月後 | 初日 |
| **Year 1 総コスト** | $467.50 | $1,656.00 |
| **Year 3 総コスト** | $1,317.50 | $4,656.00 |
| **推奨用途** | MVP | 本番 |

### 推奨戦略

**選択肢A: コスト重視**
→ Opus-Haiku で MVP、Month 5-6 で upgrade

**選択肢B: 品質・時間重視**
→ Haiku-Opus で即座に本番品質

**選択肢C: バランス型（推奨）**
→ Hybrid: Month 1-2 は Opus-Haiku (MVP検証), Month 5+ は Haiku-Opus (本番化)

---

**分析完了**: 2026-05-10
