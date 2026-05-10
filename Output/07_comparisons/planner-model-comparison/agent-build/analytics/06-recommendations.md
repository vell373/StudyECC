# Theme C 推奨戦略・選択基準

**評価日**: 2026-05-10  
**テーマ**: 技術選定エージェント群

---

## 推奨マトリックス：プロジェクト特性別

### Opus-Haiku を選ぶべき場合

```
プロジェクト特性:
  ✓ MVP・PoC フェーズ（本番化は後）
  ✓ 予算制約が厳しい（< $500 初期投資）
  ✓ 技術選定が単純（1-2業界・1-2優先軸）
  ✓ チームが小規模（3-5人）
  ✓ Phase 1 のみで十分な試算
  ✓ 初期市場検証・ユーザーフィードバック優先

投資効率:
  初期コスト: $92.50 （最安）
  投資効率: 1.73点/k （最高）
  初期完成度: 32点 / 40 = 80% (B グレード)
  
メリット:
  - 4-5営業日で実装完了
  - 学習曲線が低い（Haiku Generator の忠誠度95%で手探りが少ない）
  - 拡張前提で設計が簡潔（technical debt に強い）
  
リスク:
  - Phase 2 で Harness の大幅 refactor が必須（保守コスト）
  - 複数業界対応の拡張時に scoring logic の consistency が取りにくい
  - 運用コストが低い（年間 $375）のは初期段階のみ
  
推奨プロジェクト:
  - スタートアップ初期段階
  - 学習プロジェクト・PoC
  - チーム内のハーネス習得目的
  - 6ヶ月以内の sunset計画があるもの
```

---

### Haiku-Opus を選ぶべき場合

```
プロジェクト特性:
  ✓ 本番システム・長期運用前提
  ✓ 予算に余裕がある（> $1,500 Year 1）
  ✓ 技術選定が複雑（複数業界・複数優先軸）
  ✓ チームが中規模以上（6人以上）
  ✓ Cost見積もりが意思決定に必須
  ✓ 品質・保守性を優先
  ✓ Phase 2・3 の拡張が明確に予想される

投資効率:
  初期コスト: $156.00 （高いが品質で補う）
  投資効率: 1.19点/k （低いがスケーラビリティで補う）
  初期完成度: 37点 / 40 = 92.5% (A グレード)
  
メリット:
  - 初日から本番品質を達成
  - Phase 2 への拡張が軽量（plugin-style で +1-2 agents を追加可能）
  - エージェント間の責務が明確（因果関係が explicit）
  - テスト・保守性が高い（層別テストで regression risk が低い）
  - 複数業界への対応が natural（既に5業界サポート）
  
リスク:
  - 初期実装が 6-7営業日と長めな
  - 初期学習コストが高い（4体エージェント + 615行 Harness）
  - 年間運用コストが $1,500 と高い（但し、自動化による運用負担は -85%）
  
推奨プロジェクト:
  - エンタープライズ・製品化ステージ
  - 複数顧客・複数業界対応
  - Long-term maintenance が確定
  - 技術経営陣が参加するプロジェクト
```

---

### ハイブリッド戦略（推奨）

```
実行タイムライン:

Month 1-2: MVP フェーズ（Opus-Haiku）
  実装: Opus Planner で spec.md を設計 → Haiku Generator で実装
  投資: $92.50 (18.5K tokens)
  成果: 32点 (MVP 品質)
  目的: 市場フィット検証・ユーザーフィードバック収集
  
Month 2-3: フィードバック収集・Phase 2 計画
  追加投資: $0
  活動: ユーザー試行・フィードバック分析・ROI シミュレーション
  判定基準:
    ✓ 日次ユーザー数 > 100 → Phase 2 進行
    ✓ 日次ユーザー数 < 50 → project sunset
    
Month 3-4: Haiku-Opus への upgrade 判定
  Go/No-Go: フィードバックベースで判定
  
  GO の場合:
    投資: 追加 $63.50 (20K tokens 差分)
    実装: Haiku Planner で新 spec.md 策定 → Opus Generator で実装
    完成度: 37点 (本番品質)
    追加効果: Cost見積もり自動化・複数業界対応・Confidence scoring
    
  NO-GO の場合:
    MVP で project 完結
    最小投資で検証完了

Year 1 トータルコスト: $156 (GO) / $93 (NO-GO)
Year 1 完成度: 37/40 (GO) / 32/40 (NO-GO)

利点:
  - リスク最小化：初期投資 $92.50 で市場検証
  - 段階的投資：フィードバック後に upgrade 判定
  - ビジネス価値化の迅速化：月 1-2 で MVP 提供開始
  - 学習効果：Phase 1 で Opus-Haiku を習得してから Haiku-Opus に進級

推奨: **このハイブリッド戦略が最適**
```

---

## チームスキル別の推奨

### エージェント設計の経験がない場合

```
推奨: Opus-Haiku
理由:
  - エージェント数が少ない（2体で シンプル）
  - Harness の責務が単一（統合 glue のみ）
  - ハーネスエンジニアリングの学習曲線が低い
  
学習パス:
  Week 1-2: Opus-Haiku を構築・動作確認
  Week 3-4: Phase 2 refactor の必要性を実感
  Week 5+: Haiku-Opus のスケーラビリティを習得

警告: Haiku-Opus で最初から始めると、4体エージェント + 層別 Harness で圧倒される可能性
```

---

### エージェント設計経験が豊富な場合

```
推奨: Haiku-Opus
理由:
  - 責務分離の重要性を理解している
  - Plugin-style の拡張パターンが自然に見える
  - 複数業界対応の複雑性に対応可能
  
利点:
  - Opus-Haiku の「シンプルだが拡張に弱い」という限界を回避
  - Phase 2 以降の保守コストを大幅削減
  
注意: Phase 1 の実装時間が長めになるが、長期視点で見合う
```

---

### チームサイズ別の推奨

| チームサイズ | 推奨パターン | 理由 |
|---------|-----------|------|
| 1-2人 | **Opus-Haiku** | シンプルさと学習効率を優先 |
| 3-5人 | **Opus-Haiku → Hybrid upgrade** | MVP 検証後に本番化 |
| 6-10人 | **Haiku-Opus** | 複数チーム・複数担当で並行開発可能 |
| 10人以上 | **Haiku-Opus + Phase 3 expansion** | スケーリング前提・specialized agents追加 |

---

## 業界別の推奨

### SaaS 向け

```
特徴:
  優先軸: Scalability > Performance > DevSpeed
  ユーザー成長: 指数関数的（100 → 1K → 10K → 100K DAU）
  
Opus-Haiku:
  MVP (DAU < 1K): 十分
  Growth (DAU > 5K): Harness refactor が必須
  
Haiku-Opus:
  MVP～Growth～Scaling: シームレス対応
  最初から本番品質で安心
  
推奨: **Haiku-Opus**（高成長SaaSは複雑性増加が必然）
```

---

### ヘルスケア向け

```
特徴:
  優先軸: Security > Compliance > Reliability
  規制制約: HIPAA / GDPR / 業界固有規制
  変更頻度: 低い（仕様が固定化されやすい）
  
Opus-Haiku:
  初期構築: OK
  規制追加: Harness に条件分岐が増加
  
Haiku-Opus:
  コンプライアンス layer が統合（Security framework 連携）
  将来の規制変更に対応しやすい
  
推奨: **Haiku-Opus**（規制遵守は継続的な拡張が必須）
```

---

### IoT・組込向け

```
特徴:
  優先軸: Performance > Reliability > Cost
  ハードウェア多様性: 複数プラットフォーム対応
  制約: メモリ・電力が制限される
  
Opus-Haiku:
  単一環境: OK
  複数環境対応: scoring logic の複雑化
  
Haiku-Opus:
  platform-specific agents で対応可能
  Decision tree engine で environment detection が自動
  
推奨: **Haiku-Opus**（デバイス多様性は責務分離が必須）
```

---

## 長期TCO（Total Cost of Ownership）比較

### 初期投資（Month 1-2）

```
Opus-Haiku:
  Planner: 15K tokens = $75
  Generator: 3.5K tokens = $17.50
  合計: $92.50

Haiku-Opus:
  Planner: 7.5K tokens = $37.50
  Generator: 23.7K tokens = $118.50
  合計: $156.00

差分: Haiku-Opus が +$63.50 高い
```

---

### Year 1 TCO

```
Opus-Haiku:
  初期: $92.50
  運用（月 1.5K tokens × 12月）: $90
  合計: $182.50

Haiku-Opus:
  初期: $156.00
  運用（月 6K tokens × 12月）: $360
  合計: $516.00

差分: Haiku-Opus が +$333.50 高い
但し、運用自動化による労務削減は $500-1,000相当
```

---

### Year 3 TCO

```
Opus-Haiku:
  初期: $92.50
  Phase 2 upgrade: +$63.50
  運用 3年: $270
  合計: $426.00
  
  問題: Phase 2 での設計面倒・テスト重複が高コスト

Haiku-Opus:
  初期: $156.00
  運用 3年: $1,080
  合計: $1,236.00
  
  利点: Phase 2 がスムーズ（+$50程度）
```

---

### Break-Even Point

```
Year X で TCO が同一化する計算:

Opus-Haiku: $92.50 + $90 × X
Haiku-Opus: $156.00 + $360 × X

等式: $92.50 + $90X = $156.00 + $360X
$0 = $63.50 + $270X
X = -0.235... （負になるため、TCO的には Opus-Haiku が常に安い）

但し、「品質」を考慮すると:
  Year 1: Opus-Haiku の完成度が低く、Phase 2 refactor コスト（隠れコスト）が $200-300
  Year 2: Haiku-Opus の優位性が顕著化

→ 総合コストでは Year 2 以降は Haiku-Opus が安い（品質 + 拡張性）
```

---

## 決定フロー（選択アルゴリズム）

```
Q1: 予算は十分か？（> $500 Year 1）
  ├─ YES → Q2 へ
  └─ NO → Opus-Haiku

Q2: 複数業界・複数優先軸に対応する必要があるか？
  ├─ YES → Q3 へ
  └─ NO → Opus-Haiku

Q3: Phase 2・3 の拡張が予想されるか？
  ├─ YES → Haiku-Opus
  └─ NO → Opus-Haiku

Q4: チームスキルはどうか？（エージェント設計経験）
  ├─ 豊富 → Haiku-Opus
  ├─ 中程度 → Hybrid (MVP → Upgrade)
  └─ 初心者 → Opus-Haiku
```

---

## 実装順序チェックリスト

### Opus-Haiku で開始する場合

- [ ] Month 1: RequirementAnalyzer + TechnologyProposal を実装
- [ ] Month 1: Harness の集中型統合ロジックを実装
- [ ] Month 2: 3業界サンプルで動作確認
- [ ] Month 2: フィードバック収集開始
- [ ] Month 3: ユーザー数が 100+ に達したか判定
- [ ] Month 4-5: 達していれば Phase 2（Haiku-Opus への upgrade）検討

### Haiku-Opus で開始する場合

- [ ] Week 1-2: RequirementAnalyzer + TechnologyProposal + CostEstimator を実装
- [ ] Week 2-3: Harness orchestrator + decision tree engine を実装
- [ ] Week 3-4: QualityVisualizer + scoring logic を統合
- [ ] Week 4: 5業界サンプルで動作確認
- [ ] Week 5: 本番品質で deploy

---

## 結論

| 判定軸 | Opus-Haiku | Haiku-Opus |
|-------|-----------|-----------|
| **初期投資** | $92.50 | $156.00 |
| **実装速度** | 4-5日 | 6-7日 |
| **初期完成度** | 80% | 92.5% |
| **拡張コスト** | 高い | 低い |
| **Year 1 TCO** | $182 | $516 |
| **Year 3 TCO** | $426 | $1,236 |
| **推奨用途** | MVP | 本番 |
| **推奨戦略** | Hybrid | Direct |

### 最終推奨

**リスク最小化・ビジネス検証優先**: **ハイブリッド戦略**で Opus-Haiku から開始、フィードバック後に upgrade 判定

**品質・スケーラビリティ重視**: **Haiku-Opus で最初から本番化**

---

**分析完了**: 2026-05-10
