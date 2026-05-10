# Theme C コスト・リソース分析

**分析日**: 2026-05-09  
**テーマ**: Tech Selection Agent Group のコスト効率

---

## 実装規模の比較

### エージェント・ハーネス規模

| 指標 | Opus-Haiku | Haiku-Opus | 比較 |
|-----|-----------|-----------|------|
| **エージェント数** | 2体 | 4体 | +2 |
| **コア仕様行数** | 629行 | 717行 | +88行 (+14%) |
| **ハーネス行数** | 273行 (Python) | 615行 (Markdown spec) | +342行 |
| **テスト業界数** | 3 | 5 | +2 |
| **総実装量** | ~1200行 (code+spec) | ~2400行 (spec+samples) | ~2倍 |

---

## Token コスト推定

### Planner フェーズ（仕様策定）

#### Opus Planner → Haiku Generator パターン

| コンポーネント | Token推定 | 根拠 |
|-------------|------:|------|
| Opus spec (629行) | 2,500 | 詳細仕様 - prompt用 |
| Generator prompt | 1,000 | 要件+context |
| Haiku generation (2 agents) | 8,000 | 実装コード |
| Harness generation (273行) | 3,500 | Python実装 |
| **Total Planner Cost** | **15,000** | 1st pass費用 |

**Opus使用**: spec策定 (2,500 tokens)  
**Haiku使用**: 実装 (11,500 tokens)

---

#### Haiku Planner → Opus Generator パターン

| コンポーネント | Token推定 | 根拠 |
|-------------|------:|------|
| Haiku spec (717行) | 2,800 | より詳細仕様 |
| Generator prompt + context | 1,200 | 拡張仕様 |
| Opus generation (4 agents) | 18,000 | 詳細実装 (4エージェント) |
| Harness generation (615行 spec) | 4,000 | 複雑なorchestration |
| Industry rules (5業界) | 3,000 | Decision tables |
| **Total Planner Cost** | **29,000** | 1st pass費用 |

**Haiku使用**: spec策定 (2,800 tokens)  
**Opus使用**: 実装 (26,200 tokens)

---

### Generator フェーズのコスト

#### Opus-Haiku パターン

| 活動 | Haiku Token | Opus Token | 備考 |
|-----|----------:|----------:|------|
| 基本実装 | 11,500 | - | 2エージェント + harness |
| テスト生成 (3業界) | 4,500 | - | SaaS/Healthcare/IoT |
| README・doc | 2,000 | - | 実装ガイド |
| **Subtotal** | **18,000** | **0** | **Haiku単独実装** |

---

#### Haiku-Opus パターン

| 活動 | Haiku Token | Opus Token | 備考 |
|-----|----------:|----------:|------|
| Spec詳細化 | 2,800 | - | 仕様ドリブン |
| 実装 (4 agents) | - | 18,000 | Cost Estimator等 |
| Orchestrator詳細 | - | 4,000 | 矛盾検出 4段階 |
| Industry rules | - | 3,000 | 5業界 × rule table |
| Sample scenarios | - | 3,500 | 複数業界シナリオ |
| **Subtotal** | **2,800** | **28,500** | **Opus主導実装** |

---

## ROI 分析：エージェント数増加（2→4体）に対するスコア改善

### 効率性指標

| 指標 | Opus-Haiku | Haiku-Opus | 効率 |
|-----|-----------|-----------|------|
| **スコア** | 32/40 | 37/40 | +5点 |
| **Generator Token** | ~18,000 | ~28,500 | +58% |
| **点/token ratio** | 1.78 | 1.30 | Opus-Haiku有利 |
| **エージェント数** | 2 | 4 | +2体 (+100%) |
| **テスト業界** | 3 | 5 | +2業界 (+67%) |

**解釈**:
- **Opus-Haiku**: 高効率（token当たり 1.78点）だが低スコア
- **Haiku-Opus**: 低効率（token当たり 1.30点）だが完全性重視

---

### Phase 2 長期効果：スケーラビリティのコスト影響

#### Year 1 実装コスト

| 活動 | Opus-Haiku | Haiku-Opus | 差分 |
|-----|-----------|-----------|------|
| Initial implementation | 18K tokens | 31K tokens | +13K |
| Phase 2 追加実装 | +25K tokens | 0 (already done) | -25K |
| **Total Year 1** | **43K tokens** | **31K tokens** | **-12K tokens** |

**Year 1 結論**: Haiku-Opus の仕様ドリブン設計が前払い完了により、Phase 2 実装コストを削減

---

#### Year 2+ メンテナンス・拡張コスト

| シナリオ | Opus-Haiku | Haiku-Opus | 理由 |
|--------|-----------|-----------|------|
| 新業界追加 (6業界→8業界) | +8K tokens | +2K tokens | Taxonomy 既存 |
| 新技術追加 (30→50 stacks) | +5K tokens | +1K tokens | Framework 既存 |
| Cost model更新 | +6K tokens | +1K tokens | Estimator 既存 |
| **Year 2+ 累積** | **+19K** | **+4K** | **Haiku-Opus優位** |

**長期結論**: Haiku-Opus は初期投資が大きいが、Year 2+ で cumulative savings が 15K tokens を超える

---

## リソース効率分析

### チーム規模・期間への影響

#### Opus-Haiku パターン

| フェーズ | Team | 期間 | FTE |
|---------|------|------|-----|
| Phase 1 実装 | 1 Senior | 2 週 | 1.0 |
| Phase 1 テスト | 1 QA + 1 Dev | 1 週 | 2.0 |
| Phase 2 計画 | 1 Architect | 1 週 | 1.0 |
| **Total Phase 1** | - | **3 weeks** | **1.2 FTE** |
| Phase 2 実装 (Month 2-3) | 2 Dev | 4 週 | 2.0 |

**Time-to-Production**: 3 weeks (Phase 1 only)  
**Full Feature**: 7 weeks

---

#### Haiku-Opus パターン

| フェーズ | Team | 期間 | FTE |
|---------|------|------|-----|
| Spec詳細化 | 1 Architect | 1 週 | 1.0 |
| Phase 1+2 実装 | 2 Dev | 3 週 | 2.0 |
| Integration test | 1 QA + 1 Dev | 1.5 週 | 2.0 |
| **Total Phase 1+2** | - | **5.5 weeks** | **1.5 FTE** |
| Phase 3 拡張 (Month 3+) | 1 Dev | 2 週 | 1.0 |

**Time-to-Production**: 5.5 weeks (Full Feature)  
**Advanced Features**: Week 7+

---

### コスト比較図

```
Team Cost (FTE × week):

Opus-Haiku:
  Week 1-3:  1.2 FTE × 3 = 3.6 FTE-weeks
  Week 4-7:  2.0 FTE × 4 = 8.0 FTE-weeks
  Total:    11.6 FTE-weeks

Haiku-Opus:
  Week 1-5.5: 1.5 FTE × 5.5 = 8.25 FTE-weeks
  Week 6-7:   1.0 FTE × 2 = 2.0 FTE-weeks
  Total:      10.25 FTE-weeks

Savings: 1.35 FTE-weeks (Haiku-Opus有利)
```

---

## Cloud インフラコスト（運用コスト例）

### 月額コスト推定（AWS基準、年間運用）

#### Opus-Haiku システムの運用コスト

| コンポーネント | リソース | コスト/月 | 理由 |
|------------|---------|---------|------|
| LLM API (Haiku) | 100K req/月 (Phase 1) | $50 | 実装時の API call |
| Validation (manual) | エージェント出力レビュー | $500 | Manual validation cost |
| EC2/Lambda | t3.small ×1 | $20 | 実行環境 |
| **Total/Month** | - | **$570** | - |

**Year 1**: $570 × 12 = $6,840  
**Year 2**: $570 + Phase 2 ($200/月追加) = $8,040

---

#### Haiku-Opus システムの運用コスト

| コンポーネント | リソース | コスト/月 | 理由 |
|------------|---------|---------|------|
| LLM API (Opus) | 50K req/月 (仕様駆動) | $80 | Sophisticated generation |
| Automation (CI/CD) | GitHub Actions + Lambda | $50 | Orchestration overhead |
| EC2/Lambda | t3.small ×2 | $40 | 複雑なorchestration |
| **Total/Month** | - | **$170** | - |

**Year 1**: $170 × 12 = $2,040  
**Year 2**: $170 + $30 (scaling) = $2,400

---

## 総合ROI計算

### Year 1 総コスト（Token + Infrastructure）

| 項目 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| Generator Token | 18,000 token × $0.0005 = $9 | 31,000 token × $0.0015 = $46 |
| Phase 2 preparation | $0 (no cost) | 含む |
| Infrastructure | $6,840 | $2,040 |
| Manual validation | $4,000 (est.) | $1,000 (est.) |
| **Total Year 1** | **$10,849** | **$3,086** |
| **Value (score)** | 32 points | 37 points |
| **Cost/Point** | **$339** | **$83** |

**Year 1 結論**: Haiku-Opus は 4倍以上の効率（点/コスト比）

---

### Year 3 Cumulative ROI

| 指標 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| Total Token Cost (3年) | 88K tokens | 31K tokens |
| Infrastructure (3年) | $21,880 | $6,600 |
| Maintenance overhead | $15,000 | $3,000 |
| **Total 3-Year Cost** | **$36,880** | **$9,600** |
| **Maintenance efficiency** | Low | High |
| **Feature completeness** | Phase 1のみ | Phase 1+2 |

**結論**: Haiku-Opus は長期的に圧倒的優位（総コスト 75% 削減）

---

## 結論

### コスト効率分析のまとめ

| 観点 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| **初期Token効率** | 高い (1.78 pt/K token) | 低い (1.30 pt/K token) |
| **Phase 1納期** | 短い (3週) | 長い (5.5週) |
| **Year 1 ROI** | $339/point | $83/point |
| **Year 3 Cumulative** | $36,880 | $9,600 |
| **拡張コスト** | 高い (+25K token) | 低い (+4K token) |

### 推奨判断

**MVP/PoC (3ヶ月以内)**: Opus-Haiku  
- 初期 Token 効率が良い
- Phase 1 のみで MVP 完成
- コスト: $10K (Year 1)

**本番環境 (12ヶ月+)**: Haiku-Opus  
- 長期メンテナンスコストが低い
- Phase 2 既に完成で拡張容易
- コスト: $9.6K (3年)

---

**分析完了**: 2026-05-09
