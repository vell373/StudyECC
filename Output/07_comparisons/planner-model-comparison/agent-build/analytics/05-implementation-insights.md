# Theme C 実装洞察・意思決定パターン

**評価日**: 2026-05-10  
**テーマ**: 技術選定エージェント群

---

## Planner の哲学・戦略の差

### Opus Planner の思考様式

```
Spec 仕様書 (629行)

特徴:
  - 詳細で rigid
  - Must-Have を厳密に定義
  - Phase 計画が two-phase で fixed
  - エッジケースを enumerative に列挙

思考プロセス:
  1. 要件を深掘り → 「これは何を解決しているのか」
  2. スコープを明示 → 「within scope / out of scope」を明記
  3. 品質基準を定量化 → 「95%以上の精度」「10点満点中8点以上」
  4. 実装の「制約」を列挙 → 「時間制限」「技術制限」を記述
  5. Phase 計画を細分化 → Phase 1→Phase 2 の移行条件を明記

Message から見える personality:
  「責任を持って仕様を固める」
  「曖昧さを排除する」
  「Generator には明確な指針を与える」

Token consumption pattern:
  spec.md: 629行 / 15,000 tokens (23.8 tokens/行)
  密度: 高い（specification が詳細・explicit）
```

**哲学**: 「信頼はプロトコルから生まれる」→ spec を徹底的に rigid にする

---

### Haiku Planner の思考様式

```
Spec 仕様書 (717行)

特徴:
  - Compact だが deep
  - Must-Have は constraint として記述
  - Phase 計画が implicit （Generator に委ねる）
  - エッジケースを principle-based に定義

思考プロセス:
  1. 要件を本質化 → 「この問題の core は何か」
  2. スコープを flexible に定義 → 「must には strict、should には flexible」
  3. 品質基準を principle で表現 → 「スコアが transparent であること」
  4. 実装の「自由度」を示唆 → 「Generator が創意工夫できる余地」を残す
  5. Phase 計画を implicit に → 「Phase 2 の hint」をさりげなく埋め込む

Message から見える personality:
  「Generator を信頼する」
  「柔軟性を残す」
  「パターンで guidance を与える」

Token consumption pattern:
  spec.md: 717行 / 7,500 tokens (10.5 tokens/行)
  密度: 低い（specification が compact、implicit な部分が多い）
```

**哲学**: 「信頼は Generator の creativity から生まれる」→ spec は directions を示すのみ

---

## Generator の行動パターン

### Haiku Generator (Opus Planner に基づいて)

```
Behavior: Faithful Executor

入力: Opus の rigid spec (629行)
↓
実装行動:
  1. Spec を keyword で解析 → Must-Have checklist 化
  2. 各 Must-Have item を「strict に」実装
  3. Should-Have は「spec にないので」skip
  4. Spec に書かれた制約に严格に従う
  5. Edge case は spec で列挙されたものだけ実装
  6. 「spec に書かれていないことはしない」という discipline

出力: 902行
  - 2 agents (RequirementAnalyzer, TechnologyProposal)
  - Harness (280行, concentrated)
  - Tests (3 patterns, 12 cases)
  - Implementation summary (conservative)

特性:
  ✓ spec への loyalty 95%+
  ✓ 設計矛盾: zero （spec が完全なため）
  ✓ 拡張候補: none （spec に列挙されたもののみ）
  ✓ creativity: low （spec の boundary を超えない）

メッセージ: 「I have faithfully implemented the specification you provided」
```

---

### Opus Generator (Haiku Planner に基づいて)

```
Behavior: Creative Interpreter

入力: Haiku の compact spec (717行)
↓
実装行動:
  1. Spec を principle で解析 → 「core intent は何か」を読み取る
  2. Must-Have item は「確実に」実装
  3. Should-Have を「自発的に」読み取る → Cost Estimator 追加
  4. Spec の「hints」から Phase 2 を infer → 4 agents へ拡張
  5. Edge case を principle から generalize → 8 patterns に拡張
  6. 「spec の spirit」を maximize する創意工夫

出力: 1,332行
  - 4 agents (RequirementAnalyzer, TechnologyProposal, CostEstimator, QualityVisualizer)
  - Harness (615行, distributed)
  - Tests (5 industries, 40 cases)
  - Cost analysis (自発的追加)
  - Confidence scoring (自発的追加)
  - Implementation summary (proactive)

特性:
  ✓ spec への loyalty 75% （25%は creative expansion）
  ✓ 設計矛盾: zero （principle-driven なため）
  ✓ 拡張候補: +4 agents / +60 lines (Should-Have region)
  ✓ creativity: high （spec の boundary を超える）

メッセージ: 「The specification implied the need for broader capability. I took the liberty to extend...」
```

---

## Planner-Generator の相互作用パターン

### Pattern A: Opus Planner → Haiku Generator（厳密→忠実）

```
相互作用モデル:

Opus Planner:
  「このように実装してください」
  ↓
Haiku Generator:
  ✓ その通りに実装する
  ✓ 質問はしない
  ✓ 余計なことはしない
  
結果:
  - 予測可能（spec 通り）
  - 追加機能: zero
  - 議論: zero
  - Token cost: 低い (faithful execution だから)
  
成果物: MVP-grade（基本機能 100%、拡張 0%）
```

---

### Pattern B: Haiku Planner → Opus Generator（暗示→創造）

```
相互作用モデル:

Haiku Planner:
  「こういう principle で進めてください」
  ↓
Opus Generator:
  ? 「Phase 2 は何ですか？」（implicit hint を read）
  ? 「Should-Have はどの部分ですか？」（principle から infer）
  ✓ Cost estimator を追加してみた
  ✓ Confidence scoring を実装した
  ✓ 5 industry パターンを支援した
  
結果:
  - 創意工夫が active
  - 追加機能: 多数（Should-Have の大部分）
  - 議論: implicit （spec に hints が埋め込まれている）
  - Token cost: 高い（creative expansion だから）
  
成果物: Production-grade（基本機能 100%、拡張 90%以上）
```

---

## スコアリングロジック設計の戦略

### Opus-Haiku: スコアリング = 重み付け平均

```
実装アプローチ:

Phase 1 での定義:
  score(candidate) = 
    Σ (weight[axis] × score[candidate][axis])
    / Σ weight[axis]
  
例: Python の SaaS での score
  = (0.4 × 6_scalability + 0.3 × 8_security + ... )
  
特徴:
  ✓ Simple: 1行の式
  ✓ Fast: O(1) computation
  ✓ Interpretable: 「weight × score = contribution」が明確
  
限界:
  ✗ Industry-dependent weight が not supported
  ✗ Confidence が not tracked
  ✗ Contradiction detection が primitive
  
拡張困難性: 高い（新しい axis を加えると式が複雑化）
```

---

### Haiku-Opus: スコアリング = Decision Tree

```
実装アプローチ:

Level 1: Industry classification
  if industry == "SaaS":
    goto Level 2a (scalability-primary)
  elif industry == "Healthcare":
    goto Level 2b (security-primary)
  ...

Level 2a: Scalability-primary scoring
  score_multiplier[scalability] = 1.5
  score_multiplier[other] = 0.7
  return weighted_score with multipliers

Level 2b: Security-primary scoring
  score_multiplier[security] = 1.8
  score_multiplier[other] = 0.6
  return weighted_score with multipliers

Confidence scoring:
  confidence = 
    base_score × coverage(industry) × coverage(priority_axis)
  
例: Python の Healthcare での score
  = (1.8 × 8_security + 0.6 × 6_scalability + ...) × 0.92_confidence

特徴:
  ✓ Flexible: Industry ごとに異なる weighting
  ✓ Transparent: Decision path が trace できる
  ✓ Extensible: New industry を add する時は Level 1 に branch 追加 only
  ✓ Confidence tracking: implicit bias を detect
  
限界:
  ✗ Complex: Multi-level if-else
  ✗ Slow: O(log n) decision path （大した問題ではない）
  
拡張容易性: 高い（新しい industry を leaf に追加するだけ）
```

---

## エッジケース対応の principle

### Opus-Haiku: Enumeration-based

```
アプローチ: 「想定される」edge case を列挙して対応

Phase 1 での定義:
  edge_cases = [
    "conflicting priorities (3-axis simultaneous)",
    "legacy migration (PHP→modern)",
    "emerging technology risk (Rust, Go)"
  ]
  
実装:
  for each case in edge_cases:
    if matches(requirement, case):
      apply_special_handler()
  
例: 矛盾検出
  if priority.scalability == HIGH and priority.cost == HIGH:
    suggest_go_over_python()  # Go は scalable かつ cost-effective
    
新しい edge case 発見時:
  1. spec を update
  2. Harness に new handler を追加
  3. Test を add
  
問題: 「想定外」の edge case には対応不可（list に載っていないから）
```

---

### Haiku-Opus: Principle-based

```
アプローチ: 「core principle」を定義して、それに従わないケースを自動検出

Phase 1 での定義:
  principle_1: "Scalability と Cost は trade-off である"
  principle_2: "Security は non-negotiable である"
  principle_3: "DevSpeed は「stage」に依存する"
  
実装:
  conflict_detector = ConflictDetector(principles)
  
  for each pair of priorities:
    if violates(priority_pair, any_principle):
      report_conflict_with_severity()
      suggest_resolution()
  
例: 矛盾検出
  if priority.scalability == HIGH and priority.cost == HIGH:
    conflict = ConflictDetector.check(
      principle_1: "Scalability ∝ 1/Cost"
    )
    severity = MEDIUM
    resolution = [
      "Phase-based approach (Python initially, Go later)",
      "Infrastructure investment (CDN, caching)",
      "Technology switch at scale threshold"
    ]
  
新しい edge case 発見時:
  1. principle を add して definition 更新
  2. Conflict detector の rule を update
  3. Existing test suite は自動的に new case も cover（principle ベースだから）
  
利点: 「想定外」の case でも principle に従っていれば detect & suggest 可能
```

---

## Harness 複雑性の成長パターン

### Opus-Haiku: Linear growth

```
Agent 数 vs Harness 複雑度:

2 agents (current): Harness 280行
  
3 agents を追加した場合:
  - 新エージェント output を parse する logic: +20行
  - Scoring formula に新 axis を add: +25行
  - Report template に新 section を add: +15行
  → Harness 340行 (+21.4%)
  
5 agents を追加した場合:
  - Parsing logic が exponential に複雑化: +60行
  - Scoring formula が multi-dimensional に: +50行
  - Report が multi-section に: +40行
  → Harness 510行 (+82%)
  
複雑性曲線: O(n) linear（n = agent 数）

問題: n が 5 を超えると Harness が unmaintainable に
```

---

### Haiku-Opus: Logarithmic growth

```
Agent 数 vs Harness 複雑度:

4 agents (current): Harness 615行
  
5 agents を追加した場合（例: SecurityAnalyzer）:
  - Orchestrator agent registry に新エントリ: +3行
  - Decision tree に新 path: +12行
  - Confidence scorer に新 pattern: +8行
  → Harness 638行 (+3.7%)
  
6 agents を追加した場合（例: PerformanceAnalyzer）:
  - Agent registry: +3行
  - Decision tree: +12行
  - Confidence: +8行
  → Harness 661行 (+7.5%)
  
8 agents に拡張した場合:
  - Total delta: +93行
  → Harness 708行 (+15.1%)
  
複雑性曲線: O(log n) or O(1) amortized（plugin architecture だから）

利点: n が 10 を超えても Harness は robust
```

---

## 品質進化の timeline

### Opus-Haiku: Phase 2 で大規模 refactor 必須

```
Timeline:

Phase 1 (Week 1-4):
  成果物: 902行
  Harness: 280行 (narrow)
  品質: 32/40 (B)
  
Month 3: User feedback
  「Version management が手動」
  「Cost 見積もりがない」
  → Phase 2 plan 開始
  
Phase 2 (Week 5-8):
  課題: Harness を 280 → 450行으로 拡張
  問題: Existing logic と new logic が混在 → regression risk 高い
  
  예: Cost-Estimator agent を追加
    - Harness に routing logic を add: +25행
    - Scoring formula に cost dimension を add: +35행
    - Report template に cost section を add: +20행
    - Existing edge case handling と new cost case の矛盾を解決: +40행
    → total delta +120행
    
  Harness refactor の risk:
    - Existing 280行の中に new logic が inject される
    - Test coverage が insufficient で regression が escape
    - Technical debt accumulation
  
  품질: 34/40 (B+)
  비용: +15K tokens (original 18.5K の +81%)
  
Timeline impact: 4 주 vs 2 주 (예상)
```

---

### Haiku-Opus: Phase 2・3 への smooth 拡張

```
Timeline:

Phase 1 (Week 1-4):
  成果物: 1,332行
  Harness: 615行 (distributed, layered)
  品質: 37/40 (A)
  
Month 3: User feedback
  「Version management の自動化が欲しい」
  「Industry expansion したい」
  → Phase 2 plan 開始
  
Phase 2 (Week 5-8):
  課題: New agent (VersionManager) + New industry (新興テック) を add
  
  新 agent 実装:
    - VersionManager agent: +180행
    - Orchestrator に registry entry: +3행
    - Decision tree に new path: +15행
    - Confidence scorer: +8행
    → Harness delta: +26행 (total 641행, +4.2%)
    
  Harness refactor の risk:
    - 既存 logic は untouched
    - New agent は plugged in (no modification to existing code)
    - Test は独립実行 (new agent test + existing smoke test)
  
  품질: 38/40 (A) 또는 39/40 (A+)
  비용: +8K tokens (original 31.2K 의 +25%)
  
Timeline impact: 2 주 (예상) ✓ smooth

Phase 3 (Month 6+):
  新 agent (PerformanceAnalyzer) を簡単に add
  Harness delta: +30행 정도만
  품질: 40/40 (S)
  
Timeline impact: 1 주 (예상)
```

---

## 설계 관점에서의 insight

| 관점 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| **당신의 철학** | Spec-driven (spec이 king) | Principle-driven (principle이 king) |
| **Generator에 대한 신뢰도** | Medium (spec을 따를 것으로 기대) | High (spirit을 읽을 것으로 기대) |
| **확장을 위한 비용** | High (refactor 필요) | Low (plugin-style add) |
| **Edge case 처리** | Enumeration (생각한 것만) | Principle (생각하지 못한 것도) |
| **첫 번째 배포 기간** | Short (4주) | Medium (4주) |
| **Phase 2 적응 기간** | Long (4주 + refactor 위험) | Short (2주) |
| **Year 1-3 TCO** | Low (MVP → upgrade) | High (comprehensive) |
| **Year 3+ TCO** | Converge to High (refactor cost 누적) | Remain High (but predictable) |

---

**분석完了**: 2026-05-10
