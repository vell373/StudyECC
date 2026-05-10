# Theme B コスト・リソース分析

**評価日**: 2026-05-09  
**テーマ**: ドキュメント自動更新システム

---

## 実装規模の比較

| 指標 | Opus-Haiku | Haiku-Opus | 差分 |
|-----|-----------|-----------|-----|
| **総行数（spec.md）** | 880行 | 1,695行 | +815行 (+93%) |
| **ハーネス行数** | 280行 | 502行 | +222行 (+79%) |
| **エージェント数** | 3体 | 4体 | +1体 |
| **実装ファイル数** | 3 | 7 | +4 |

---

## プランナーコスト推定

### Opus Planner（Opus-Haiku パターン）

**入力**: theme.md（~500文字）  
**出力**: spec.md（880行）  
**推定コスト**: ~15,000 tokens（input-output トータル）

**設計内容**:
- 3エージェント体制の明確化
- JSON I/O スキーマの定義
- 3サンプルシナリオの詳細設計

**特徴**: 詳細で完成度が高く、Haiku Generator が迷わずに実装できる設計書

---

### Haiku Planner（Haiku-Opus パターン）

**入力**: theme.md（~500文字）  
**出力**: spec.md（1,695行）  
**推定コスト**: ~8,000 tokens（input-output トータル）

**設計内容**:
- 4エージェント体制の提案
- Phase 2 Should-Have の詳細要件
- 7サンプルシナリオ（edge case 含む）
- 実装テンプレートと flow diagram

**特徴**: compact で抽象的だが、Opus Generator が主体的に拡張・実装

---

## ジェネレーターコスト推定

### Haiku Generator（Opus-Haiku パターン）

**入力**: spec.md（880行）+ rubric（~300行）  
**出力**: 3エージェント + harness（~800行）  
**推定コスト**: ~22,000 tokens（input-output トータル）

**処理内容**:
- spec に基づいて 3 agent を実装
- JSON I/O validation
- 3 sample tests の実行

**特徴**: spec が詳細なため、迷わずに実装。コスト は moderate

---

### Opus Generator（Haiku-Opus パターン）

**入力**: spec.md（1,695行）+ rubric（~300行）  
**出力**: 4エージェント + harness（~1,200行）  
**推定コスト**: ~35,000 tokens（input-output トータル）

**処理内容**:
- spec の Phase 2 要件を parse
- 4 agent + advanced harness を実装
- 8 edge case tests の実装
- quality visualization logic の設計・実装

**特徴**: spec が comprehensive で、Opus は主体的に feature を追加

---

## トータルコスト比較

| パターン | Planner | Generator | **計** | スコア |
|---------|---------|-----------|-------|--------|
| **Opus-Haiku** | 15,000 | 22,000 | **37,000** | 32/40 |
| **Haiku-Opus** | 8,000 | 35,000 | **43,000** | 37/40 |
| **差分** | -7,000 | +13,000 | **+6,000** | +5点 |

---

## コスト効率分析

### Opus-Haiku: 高品質計画 + 低コスト実装

**強点**:
- Planner のコスト高 (Opus)
- Generator のコスト低 (Haiku)
- 早期完成が可能

**弱点**:
- Must-Have に集中（Should-Have の自動化なし）
- generator が Planner に大きく依存
- 後続 Phase での追加コストが必要

**ROI評価**: 
- **短期（Phase 1）**: 効率的（37k tokens で 32/40）
- **長期（Phase 2+）**: 非効率（追加投資が必要）

---

### Haiku-Opus: 低コスト計画 + 高品質実装

**強点**:
- Planner のコスト低 (Haiku)
- Generator が主体的に拡張（Phase 2 を pre-package）
- 長期的に追加投資が不要

**弱点**:
- Generator のコスト高 (Opus)
- 初期投資が多い
- Planner の spec が compact のため、Generator の負担が増加

**ROI評価**:
- **短期（Phase 1）**: Opus-Haiku より +6k tokens
- **長期（Phase 2+）**: Haiku-Opus が優位（既に Should-Have 実装済み）

---

## トークンあたりの品質効率

| パターン | 投資 tokens | 獲得スコア | **効率** |
|---------|----------|---------|---------|
| Opus-Haiku | 37,000 | 32/40 | **0.86 点/k tokens** |
| Haiku-Opus | 43,000 | 37/40 | **0.86 点/k tokens** |

**結論**: 短期的には **同等の効率**。ただし Phase 2 への追加投資を考慮すると Haiku-Opus が長期的に優位

---

## フェーズド開発での総コスト予測

### シナリオ: Phase 1 + Phase 2 の完全実装

#### Opus-Haiku パターン

| フェーズ | 追加投資 | 累計 tokens | 最終スコア |
|---------|--------|----------|---------|
| Phase 1 | 37,000 | 37,000 | 32/40 |
| Phase 2 | +25,000 | 62,000 | 38/40 (推定) |

#### Haiku-Opus パターン

| フェーズ | 追加投資 | 累計 tokens | 最終スコア |
|---------|--------|----------|---------|
| Phase 1 | 43,000 | 43,000 | 37/40 |
| Phase 2 | +5,000 (微調整) | 48,000 | 39/40 (推定) |

**結論**: Phase 2 を含めると **Haiku-Opus が 14k tokens 削減（23% 削減）** でき、最終品質も +1 点上

---

## 推奨事項

| 制約条件 | 推奨パターン | 理由 |
|---------|----------|------|
| **Phase 1 のみ・コスト優先** | **Opus-Haiku** | 37k tokens で Phase 1 完全達成 |
| **Phase 1 + 2 を視野に** | **Haiku-Opus** | 長期的に 14k tokens 削減、品質 +1 点 |
| **高速納品重視** | **Opus-Haiku** | 計画の詳細化で Generator の迷いが少ない |
| **最終品質重視** | **Haiku-Opus** | 37/40 で Phase 2 大部分が pre-packaged |

---

**分析完了**: 2026-05-09
