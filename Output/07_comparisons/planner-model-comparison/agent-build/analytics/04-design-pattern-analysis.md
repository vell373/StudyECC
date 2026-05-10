# Theme C デザインパターン比較

**評価日**: 2026-05-10  
**テーマ**: 技術選定エージェント群

---

## アーキテクチャパターンの対比

### Opus-Haiku: 集中型ハーネス

```
構成図:

  ┌─ RequirementAnalyzer
  │
  ├─ TechnologyProposal
  │
  └─> Harness (280行)
      ├─ orchestrator
      ├─ scoring logic（暗黙的）
      └─ report generator
```

**特徴**:
- 2体エージェント + 1つの統合ハーネス
- Harness が全責務を担当（orchestration, scoring, reporting）
- エージェント定義: 合計300行
- ハーネス定義: 280行

---

### Haiku-Opus: 分散型ハーネス

```
構成図:

  ┌─ RequirementAnalyzer
  │
  ├─ TechnologyProposal
  │
  ├─ CostEstimator (新規)
  │
  ├─ QualityVisualizer (新規)
  │
  └─> Harness (615行)
      ├─ orchestrator (200行)
      ├─ decision tree engine (150行)
      ├─ visualization layer (100行)
      └─ confidence scorer (165行)
```

**特徴**:
- 4体エージェント + 層別型ハーネス
- 責務が明確に分離（analyzer → proposer → estimator → visualizer）
- エージェント定義: 合計610行
- ハーネス定義: 615行

---

## スケーラビリティ分析

### Opus-Haiku の拡張可能性

```
現在の構成 (2 agents):
  Harness 複雑度: O(n) （n = エージェント数）
  
  Harness 内部:
    - hardcoded な agent 呼び出し
    - if-elif で scoring logic 分岐
    - reporting が monolithic
  
新しいエージェント追加時:
  1. 新エージェント定義（150行）
  2. Harness に呼び出しコード追加（15-20行）
  3. Scoring logic を修正（20-30行）
  4. Report template を更新（10-15行）
  
  追加コスト: 195-215行 per エージェント
  
問題点:
  - Harness が肥大化（280行 → 500-600行に）
  - Scoring logic の consistency が保ちにくい
  - テストが複雑化（全ケース combination に対応）
```

**スケーラビリティ: 低い（3体目以降が辛くなる）**

---

### Haiku-Opus の拡張可能性

```
現在の構成 (4 agents):
  Harness 複雑度: O(log n) (n = エージェント数)
  
  Harness の層別設計:
    - Orchestrator: agent discovery + I/O routing
    - Decision tree: scoring logic (plugin-style)
    - Visualizer: output formatting
    - Confidence scorer: 独立した logic
  
新しいエージェント追加時:
  1. 新エージェント定義（120-150行）
  2. Orchestrator に agent registry エントリ追加（3-5行）
  3. Scoring logic は既存 decision tree を reuse（0行 in most cases）
  
  追加コスト: 120-155行 per エージェント
  
利点:
  - Harness 複雑度が線形増加に止まらない
  - Scoring logic の consistency が protocol で保証
  - テストが独立化（各 layer を separate に test）
```

**スケーラビリティ: 高い（5体以上でも robust）**

---

## Harness内部の制御フロー

### Opus-Haiku のフロー

```
Input (requirement spec)
  ↓
[RequirementAnalyzer]
  ↓ outputs: priority weights
[TechnologyProposal]
  ↓ outputs: tech candidates
[Harness Orchestrator]
  ├─ if candidate_type == "language":
  │   score = (weight.scalability × lang_scalability_score)
  │         + (weight.security × lang_security_score)
  │         + ...
  │
  ├─ if candidate_type == "framework":
  │   score = (weight.devspeed × fw_devspeed_score)
  │         + ...
  │
  └─ Report generation (hardcoded template)
      ↓
Output (markdown report)

特徴: 
  - Linear evaluation
  - Hardcoded scoring formula
  - No feedback loop
```

---

### Haiku-Opus のフロー

```
Input (requirement spec)
  ↓
[RequirementAnalyzer]
  ↓ outputs: {priority: {...}, industry: "...", constraints: {...}}
[TechnologyProposal]
  ↓ outputs: {candidates: [{...}, {...}], alternatives: [{...}]}
[CostEstimator]
  ↓ outputs: {cost_matrix: {...}, roi: {...}, payback_period: "..."}
[Harness Orchestrator]
  ├─ Dependency validation (CostEstimator requires TechProposal)
  ├─ Conflict detection (contradictory priorities)
  └─ Priority resolution (multi-level decision tree)
      ↓
[Harness Decision Engine]
  ├─ Level 1: Industry classifier → {SaaS|Healthcare|IoT|Fintech|Media}
  ├─ Level 2: Priority axis resolver → {Scalability|Security|...}
  ├─ Level 3: Tech candidate matcher → {Python|Go|Rust|...}
  ├─ Candidate scoring (weighted by industry + priority)
  └─ Confidence calculator (based on pattern match history)
      ↓
[QualityVisualizer]
  ├─ Generate scoring matrix (markdown table)
  ├─ Generate decision tree visualization
  ├─ Generate confidence badges
  └─ Format tradeoff analysis
      ↓
[Report Generator]
  └─ Render complete markdown report with all visualizations
      ↓
Output (comprehensive markdown report with metadata)

特徴:
  - Multi-level orchestration
  - Plugin-style scoring registry
  - Confidence tracking throughout
  - Feedback-aware visualization
```

---

## エージェント間のデータフロー

### Opus-Haiku のインタフェース

```
RequirementAnalyzer → Harness:
  {
    "scalability_weight": 0.4,
    "security_weight": 0.3,
    "performance_weight": 0.2,
    "devspeed_weight": 0.1
  }

TechnologyProposal → Harness:
  {
    "candidates": [
      {
        "type": "language",
        "name": "Python",
        "scores": {
          "scalability": 6,
          "security": 8,
          "performance": 5,
          "devspeed": 9
        }
      },
      ...
    ]
  }

問題点:
  - Schema が loosely defined
  - Optional fields の扱いが曖昧
  - Error handling が不明
```

---

### Haiku-Opus のインタフェース

```
Version 1.0 Agent Interface Contract

[Agent: RequirementAnalyzer]
Output Schema:
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["priority", "industry", "timeline"],
    "properties": {
      "priority": {
        "type": "object",
        "properties": {
          "scalability": {"type": "number", "minimum": 0, "maximum": 1},
          "security": {"type": "number"},
          "performance": {"type": "number"},
          "devspeed": {"type": "number"},
          "cost": {"type": "number"}
        }
      },
      "industry": {"enum": ["SaaS", "Healthcare", "IoT", "Fintech", "Media"]},
      "timeline": {"enum": ["urgent", "normal", "flexible"]},
      "constraints": {"type": "array", "items": {"type": "string"}},
      "team_skills": {"type": "array", "items": {"enum": ["Python", "Go", "Java", ...]}}
    }
  }

[Agent: TechnologyProposal]
Input Schema: (RequirementAnalyzer output)
Output Schema:
  {
    "candidates": [
      {
        "category": {"enum": ["language", "framework", "database"]},
        "name": "Python",
        "rationale": "High DevSpeed for MVP",
        "scores": {...},
        "maturity": {"enum": ["mature", "stable", "emerging"]},
        "ecosystem_size": {"enum": ["large", "medium", "small"]}
      }
    ]
  }

[Agent: CostEstimator]
Input Schema: (TechnologyProposal output)
Output Schema:
  {
    "cost_analysis": {
      "development_cost": {number},
      "infrastructure_cost": {number},
      "maintenance_cost": {number},
      "payback_period": {string}
      "roi_vs_alternative": {number} (%)
    }
  }

利点:
  - JSON Schema で contract を明示
  - Optional vs required が明確
  - Type validation が可能
  - Error handling が prescribed
```

---

## 複雑性曲線

### トークン消費の複雑性

```
Opus-Haiku:
  エージェント: 300行 × 2 = 600行
  Harness: 280行
  合計: 880行
  
  実装フェーズ Token Cost: 18.5K
  複雑性スコア: 4/10 (simple)

Haiku-Opus:
  エージェント: 610行 × 4 = 2440行
  Harness: 615行
  合計: 3055行
  
  実装フェーズ Token Cost: 31.2K
  複雑性スコア: 7/10 (sophisticated)

複雑性 vs Cost ratio:
  Opus-Haiku: 4 complexity / 18.5K = 0.22
  Haiku-Opus: 7 complexity / 31.2K = 0.22
  
結論: 単位複雑度あたりのコストは同等
```

---

### メンテナンス複雑性

```
Opus-Haiku:
  Change Impact:
    - 1エージェント修正 → Harness に 2-3 影響
    - Scoring logic 修正 → 全テストケース再実行
    - New edge case 対応 → Harness 10-15行 追加
  
  Regression Risk: 高い（因果関係が implicit）

Haiku-Opus:
  Change Impact:
    - 1エージェント修正 → Harness に 0-1 影響（contract に従っていれば）
    - Scoring logic 修正 → 該当 layer のテストのみ
    - New edge case 対応 → Decision tree に 5-8行 追加
  
  Regression Risk: 低い（因果関係が explicit）
```

---

## 設計哲学の違い

### Opus-Haiku: 「シンプリシティ重視」

```
設計原則:
  1. 「今必要なもの」だけを実装
  2. エージェント数は最小限（2体）
  3. ハーネスは薄い統合層（単なる glue）
  4. 拡張は後で考える

メリット:
  - 学習曲線が低い
  - 初期実装が高速（1-2週間）
  - コード行数が少ない（880行）

デメリット:
  - 拡張時に refactor が必須
  - Harness の責務が曖昧
  - Phase 2 での technical debt

適用場面:
  - MVP・PoC
  - チーム学習
  - 単一業界・単一優先軸
```

---

### Haiku-Opus: 「スケーラビリティ重視」

```
設計原則:
  1. 「将来の拡張」を見据えた設計
  2. 各責務を独立したエージェントに分離
  3. ハーネスは decision engine（知的層）
  4. Plugin-style で new agents を追加可能

メリット:
  - Phase 2・3 への拡張が low cost
  - 各エージェントが独立可能
  - テストが独立化（層別テスト）
  - 責務が明確（no confusion）

デメリット:
  - 初期実装がやや重い（3-4週間）
  - コード行数が多い（3055行）
  - 初心者向けでない

適用場面:
  - 本番システム
  - 複数業界・複数優先軸
  - Long-term maintenance が必須
  - Phase-based roadmap
```

---

## ハーネス設計パターンのトレードオフ

| 観点 | 集中型（Opus-Haiku） | 分散型（Haiku-Opus） |
|-----|-----------------|-----------------|
| **初期実装速度** | ★★★★★ 高速 | ★★★ 中程度 |
| **コード行数** | ★★★★★ 少ない (280行) | ★★☆ 多い (615行) |
| **学習難度** | ★★★★★ 簡単 | ★★ 難しい |
| **拡張性** | ★☆ 低い | ★★★★★ 高い |
| **テスト独立性** | ★★ 低い | ★★★★★ 高い |
| **責務明確性** | ★★ 曖昧 | ★★★★★ 明確 |
| **本番利用可能** | ★★★ 改善必須 | ★★★★★ Ready |

---

## 結論: パターン選択の判定基準

### Opus-Haiku パターンを選ぶべき

```
条件:
  ✓ MVP・PoC で短期勝負
  ✓ 業界・優先軸が単純（1-2パターン）
  ✓ チームが agent 設計の初心者
  ✓ Phase 1 のみで十分
  
効果:
  - 1-2週間で実装完了
  - 学習曲線が低い
  - コード理解が容易
```

---

### Haiku-Opus パターンを選ぶべき

```
条件:
  ✓ 本番利用・長期運用
  ✓ 複数業界・複数優先軸 に対応
  ✓ Phase 2・3 の拡張が予想される
  ✓ チームが設計経験豊富
  
効果:
  - 3-4週間で本番 ready
  - 拡張コストが低い（per agent 155行）
  - テスト・保守性が高い
  - Plugin-style で new logic を safe に追加
```

---

**分析完了**: 2026-05-10
