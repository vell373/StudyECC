# Theme B デザインパターン分析

**評価日**: 2026-05-09  
**テーマ**: ドキュメント自動更新システム

---

## 両パターンの設計パターン比較

### Opus-Haiku パターンの設計アーキテクチャ

#### エージェント責務配置

```
Harness (280行)
├── API Endpoint Parser
│   └── api-doc-agent へ delegate
├── README Locator
│   └── readme-agent へ delegate
└── Contradiction Detector (基本的)
    ├── API追加 ↔ README未更新
    └── 通知・警告の発行
```

**特徴**: 集中型 Harness

- Harness が各エージェント（api-doc-agent、readme-agent）の入出力を管理
- Harness が矛盾検出ロジックを一元制御
- エージェント間の通信は Harness を経由して sync
- JSON I/O スキーマが严格に定義されている

**メリット**:
- デバッグが容易（すべてのロジックが中央集約）
- エージェント間の dependency が明確
- テストが simple（入出力スキーマが固定）

**デメリット**:
- Harness の責務が大きい（Parser + Detector がすべて Harness に）
- 新しい矛盾パターンを追加する際は Harness を修正が必要
- Scalability が低い（4個目のエージェント追加時に Harness 全体を再設計）

---

### Haiku-Opus パターンの設計アーキテクチャ

#### エージェント責務配置

```
Harness (502行)
├── Phase 1: API & README Management
│   ├── agent-api-doc-updater（202行）
│   │   └── breaking change 検出・Swagger 仕様生成
│   └── agent-readme-maintainer（232行）
│       └── Migration Guide 自動生成
│
└── Phase 2: Version Management
    ├── agent-changelog-generator（270行）
    │   └── SemVer 対応・属性推論
    └── Harness Contradiction Detection（3-level）
        ├── Critical: Breaking change, Security
        ├── Warning: API追加, Deprecation
        └── Info: Minor fix
```

**特徴**: 分散型 Harness + 専門エージェント

- 各エージェントが自律的に設計・判断
- Harness は Orchestrator 役（各エージェントの出力を集約・整形）
- 矛盾検出が 3-level に分類（段階的）
- Quality Visualization を Harness が担当

**メリット**:
- エージェント追加が容易（Harness への影響が最小）
- 各エージェントが domain-specific knowledge を持つ
- Phase ごとに increment を追加可能
- Quality report が自動生成される

**デメリット**:
- Harness が複雑（502行）
- エージェント間の通信パターンが多い
- 各エージェントの独立テストが必要

---

## パターン分析：集中型 vs 分散型

| 観点 | Opus-Haiku（集中型） | Haiku-Opus（分散型） |
|-----|------------------|------------------|
| **スケーラビリティ** | 低（新エージェント追加時、全体修正） | 高（新エージェント追加で独立） |
| **デバッグ難度** | 低（全ロジック中央） | 高（各エージェント調査が必要） |
| **初期実装速度** | 速（仕様に従う） | 遅（主体的な拡張が必要） |
| **長期保守性** | 限定（Phase 拡張で負担増） | 高（Increment が独立） |
| **Domain Specialization** | 低（Harness が汎用） | 高（各エージェントが専門） |
| **実装行数** | 少（280 行） | 多（502 行） |

---

## デザインパターンの教訓

### Pattern 1: Orchestrator 型 Harness（Opus-Haiku）

**適用場面**: 
- 初期段階の MVP（最小限の機能）
- 明確に定義されたワークフロー
- スコープが固定されている

**実装上の注意**:
- Harness の責務が大きくならないよう、エージェント数を制限（3-4体まで）
- JSON I/O スキーマを厳密に定義
- 矛盾パターンを事前に enumerate（完全性を確保）

### Pattern 2: Coordinator 型 Harness（Haiku-Opus）

**適用場面**:
- Phase ごとに機能を段階展開
- 複雑な domain ロジック
- 将来の拡張が想定される

**実装上の注意**:
- 各エージェントの output 仕様を明確に
- Harness の report generation logic が肥大化するリスク
- Quality visualization は separate component にすべき

---

## Haiku Planner vs Opus Planner の設計哲学の差

### Opus Planner の設計思想

- **Conservative design**: 仕様に厳密、超過実装を避ける
- **Explicit contractual obligation**: JSON スキーマで完全性を保証
- **Single-layer control**: Harness が全制御を保有
- **Fault tolerance**: 各エージェント失敗時の fallback を明示

### Haiku Planner の設計思想

- **Adaptive design**: Compact spec から Generator が主体的に拡張
- **Implicit flexibility**: Phase transition を容易に
- **Multi-layer autonomy**: 各エージェントが独立判断
- **Progressive enhancement**: Phase 1 で base, Phase 2 で advanced features

---

## 結論：設計パターンの有効性

### Opus-Haiku デザインの評価

**適用性**: **MVP・学習向け**
- シンプルで理解しやすい
- 新規チームメンバーのオンボーディングが容易
- 技術的負債が少ない

**限界**: Phase 2 以降の拡張で Harness 全体を再検討が必要

### Haiku-Opus デザインの評価

**適用性**: **本番・長期運用向け**
- Increment 追加が容易
- Domain 知識の蓄積が各エージェントに
- Version bump など複雑なロジックが独立管理可能

**限界**: 初期実装の複雑性、Harness のメンテナンス負担

---

**分析完了**: 2026-05-09
