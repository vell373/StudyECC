# Theme C Analytics（agent-build 競技）

マルチエージェント技術選定システムの総合評価レポート

**評価対象**: 
- Opus-Haiku パターン: Opus Planner (仕様 629 行) → Haiku Generator (実装 273 行)
- Haiku-Opus パターン: Haiku Planner (仕様 717 行) → Opus Generator (実装 615 行)

**評価日**: 2026-05-10

---

## 📋 ファイル概要

### 01-score-distribution.md（スコア分布分析）
**ページ数**: ~465 行

主要な 4 軸での点数分布を分析：
- 要件充足度（Requirements Fulfillment）: Opus-Haiku 8/10, Haiku-Opus 10/10
- 品質・構造（Quality Structure）: 両者 9/10（同等の建築的優秀性）
- 完成度・動作性（Completeness Functionality）: Opus-Haiku 8/10, Haiku-Opus 9/10
- 創造性・判断力（Creativity Judgment）: Opus-Haiku 7/10, Haiku-Opus 9/10

**総合スコア**:
- Opus-Haiku: **32/40 (80%)** グレード B
- Haiku-Opus: **37/40 (92.5%)** グレード A
- 差分: +5 点（Haiku-Opus 優位）

**主要インサイト**:
- Phase 2 Should-Have の実装有無で -2 点の差が発生
- 業界別ルールの深さ（3 vs 5 業界）で -1 点の差が発生
- 創造的拡張（Cost Estimator, 5-Tier taxonomy）で -2 点の差が発生

---

### 02-cost-and-resource.md（コスト・リソース分析）
**ページ数**: ~480 行

実装規模、Token コスト、ROI、チーム効率を定量分析：

**実装規模**:
- Opus-Haiku: 仕様 629 行 + 実装 273 行 = 計 902 行
- Haiku-Opus: 仕様 717 行 + 実装 615 行 = 計 1,332 行

**Token コスト**:
- Opus-Haiku: 18,500 tokens（Haiku Generator コスト）
- Haiku-Opus: 31,200 tokens（Opus Generator コスト）
- 差分: +12,700 tokens（68% 増加）

**Token 効率（ポイント/Token）**:
- Opus-Haiku: 1.73 pts/K tokens（高効率）
- Haiku-Opus: 1.19 pts/K tokens（低効率）
→ **Opus は短期効率、Haiku は長期価値**

**Year 1 ROI 分析**:
- Opus-Haiku: $339/点（実装コストが低い）
- Haiku-Opus: $83/点（完全性により点数が高い）

**Year 3 累積コスト**:
- Opus-Haiku: $36,880（Phase 2 追加時の総コスト）
- Haiku-Opus: $9,600（既に Phase 2 含まれているため）

**チーム効率**:
- Opus-Haiku: 3 週間（Phase 1 のみ）
- Haiku-Opus: 5.5 週間（Phase 1 + Phase 2）

**推奨**:
- 短期（予算 < $150K）: Opus-Haiku
- 長期（予算 > $300K）: Haiku-Opus
- 最適（リスク分散）: 段階的ハイブリッド

---

### 03-feature-completeness.md（機能完成度分析）
**ページ数**: ~420 行

Must-Have / Should-Have / Nice-to-Have の実装状況を行列分析：

**Must-Have（Phase 1 必須機能）**:
- 2 エージェント設計: 両者 ✓
- Harness オーケストレーション: 両者 ✓
- テスト 3 パターン: 両者 ✓
- **実装度**: Opus-Haiku 100%, Haiku-Opus 100%

**Should-Have（Phase 2 推奨機能）**:
- Cost Estimator Agent: Opus-Haiku ✗, Haiku-Opus ✓
- Market Maturity Scorer フレームワーク: Opus-Haiku 基本版, Haiku-Opus 詳細版
- Learning Curve 分析: Opus-Haiku 簡易版, Haiku-Opus 詳細版
- **実装度**: Opus-Haiku 50%, Haiku-Opus 100%

**Nice-to-Have（拡張機能）**:
- 5-Tier Technology Taxonomy: Opus-Haiku 未実装, Haiku-Opus 実装
- 業界別ルール表（5 業界 × 7 ルール）: Opus-Haiku 3 業界, Haiku-Opus 完全版
- 予測的制約チェック: Opus-Haiku 未実装, Haiku-Opus 実装
- **実装度**: Opus-Haiku 0%, Haiku-Opus 100%

**運用効率指標**:
- Opus-Haiku: 35 分/案件（97% 自動化）
- Haiku-Opus: 31 分/案件（100% 自動化）

---

### 04-design-pattern-analysis.md（設計パターン分析）
**ページ数**: ~450 行

アーキテクチャ、スケーラビリティ、デバッグ性、長期保守性を比較：

**集約型パターン（Opus-Haiku）**:
- 273 行の TechSelectionHarness クラス に全ロジック集約
- メリット: シンプル、デバッグ容易、初期実装が早い
- デメリット: スケーリング限界、機能追加時の複雑度増加

**分散型パターン（Haiku-Opus）**:
- 4 エージェント（Analyzer / Proposer / Estimator / Orchestrator）に責務分散
- メリット: スケーラブル、機能追加が容易、マイクロサービス化可能
- デメリット: エージェント間の統合複雑性、デバッグが複雑

**設計パターン比較表**:
- スケーラビリティ: 集約 △ vs 分散 ◎
- デバッグ難易度: 集約 容易 vs 分散 困難
- 実装速度: 集約 4 週 vs 分散 5.5 週
- 長期保守性: 集約 4K tokens (Phase 2 時) vs 分散 既に完結

---

### 05-implementation-insights.md（実装インサイト分析）
**ページ数**: ~465 行

Planner と Generator の意思決定、戦略的判断の分析：

**Opus Planner の戦略**:
1. Phase 1 に集中（Phase 2 は将来拡張として明示的に除外）
2. キーワード基盤スコアリング採用（ML 棄却）
3. 3 業界に限定（5 業界の実装コストを回避）

**判断品質**: 8/10（要件充足度）
- 強み: 現実的スコープ管理、実装リスク最小化
- 弱み: 財務分析機能欠落、長期 ROI 見積もり不可

**Haiku Planner の戦略**:
1. Phase 1 + Phase 2 のフル実装（完全な意思決定フレームワーク）
2. 5-Tier Technology Taxonomy 体系化（30+ スタック組み合わせ）
3. 4 段階の紛争解決優先度（制約 > 軸 > トレードオフ > オプション）

**判断品質**: 10/10（要件充足度）
- 強み: 完全な意思決定フレームワーク、長期的価値最大化
- 弱み: 実装複雑度増加、スケジュール圧迫

**Generator の忠誠度分析**:
- Opus Generator（Haiku 出力）: 100% 忠誠（仕様に完全従従）
- Haiku Generator（Opus 出力）: 115% 忠誠（仕様超過の拡張実装）

**Token 効率と実装深度の相関**:
- 高効率（Token 少ない） = 限定スコープ（創造性抑制）
- 低効率（Token 多い） = 拡張スコープ（創造性誘発）

---

### 06-recommendations.md（推奨・応用ガイド）
**ページ数**: ~547 行

実運用シーン別の推奨、チームスキル別ロードマップ、リスク管理：

**利用シーン別推奨**:

| シーン | パターン | 理由 |
|--------|---------|------|
| スタートアップ MVP | **Opus-Haiku** | 4 週間、低コスト、リスク小 |
| エンタープライズ | **Haiku-Opus** | 完全性、財務分析、スケーラビリティ |
| 学習・トレーニング | **Opus-Haiku** | コンパクト性、理解容易性 |

**チームスキル別ロードマップ**:

1. **ジュニアエンジニア**: Opus-Haiku → 段階的拡張（Month 1-8）
2. **ミッドレベル**: Haiku-Opus フル実装（Week 1-12）
3. **シニア/アーキテクト**: Haiku-Opus + 業界カスタマイズ

**段階的実装（最推奨）**:
- Month 1-4: Opus パターンで MVP リリース（80% 品質）
- Month 5-8: Phase 2 追加実装
- Month 9-12: 5 業界対応 + 本番化

**メリット**:
- 早期リリース（Month 4）
- リスク分散（問題は小さいうちに検出）
- 顧客フィードバックを Phase 2 に活かす

**リスク管理**:
- Opus パターン: Phase 2 要件急出現への対応、スケーリング限界
- Haiku パターン: スコープ蔓延、統合複雑性

---

## 🎯 読む順序のガイド

### 管理層向け（10 分で理解）
1. このファイル（README）
2. **01-score-distribution.md**（スコアだけ見ればよい）
3. **06-recommendations.md**（意思決定チャートだけ見ればよい）

### 技術リード向け（30 分で理解）
1. このファイル（README）
2. **01-score-distribution.md**（詳細は不要、サマリ部分）
3. **04-design-pattern-analysis.md**（建築的違いを理解）
4. **05-implementation-insights.md**（Planner と Generator の戦略）
5. **06-recommendations.md**（リスク管理セクション）

### 実装エンジニア向け（1 時間で深掘り）
1. このファイル（README）
2. **02-cost-and-resource.md**（Token コスト、チーム効率）
3. **03-feature-completeness.md**（実装する機能の洗い出し）
4. **04-design-pattern-analysis.md**（アーキテクチャの選択）
5. **05-implementation-insights.md**（実装の判断根拠）
6. **06-recommendations.md**（プロジェクト計画）

### 学習者向け（2-3 時間で学習）
全 6 ファイルを順序に読む：
1. スコア分布を理解（評価軸の意味）
2. 設計パターンで建築を学ぶ
3. 実装インサイトで判断プロセスを学ぶ
4. 推奨で応用シーンを理解

---

## 📊 主要数字まとめ

### スコア
```
Opus-Haiku:  32/40 (80%)  グレード B
Haiku-Opus:  37/40 (92.5%) グレード A
差分: +5 点 (+12.5%)
```

### 実装規模
```
Opus-Haiku:  902 行（仕様 629 + 実装 273）
Haiku-Opus: 1,332 行（仕様 717 + 実装 615）
差分: +47%
```

### Token コスト
```
Opus-Haiku:  18,500 tokens
Haiku-Opus:  31,200 tokens
差分: +68%
```

### 実装期間
```
Opus-Haiku:  4 週間（Phase 1 のみ）
Haiku-Opus:  5.5 週間（Phase 1 + 2）
差分: +1.5 週間
```

### Token 効率
```
Opus-Haiku:  1.73 点/K tokens（高効率）
Haiku-Opus:  1.19 点/K tokens（完全性重視）
```

### Year 1 ROI
```
Opus-Haiku:  $339/点
Haiku-Opus:  $83/点
（Haiku は高絶対点だが、相対 ROI は低い）
```

### Year 3 累積コスト
```
Opus-Haiku:  $36,880（Phase 2 追加時の総額）
Haiku-Opus:  $9,600（既に含まれている）
→ Year 3 では Haiku が有利
```

---

## 🔑 キーインサイト

### 1. 「品質構造」は同等だが「完全性」で差がつく
- 両パターンとも建築的優秀性（9/10）
- Opus は MVP 品質の徹底、Haiku は全機能実装を選択
- **→ 短期 vs 長期のトレードオフ**

### 2. 「創造性」は「スコープの豊かさ」から生まれる
- Opus Generator が限定的創造性（7/10）なのは、仕様が Phase 1 に限定されているため
- Haiku Generator が高度な創造性（9/10）なのは、仕様が Phase 1 + 2 を含むため
- **→ スコープが広いほど、Generator の創造性が引き出される**

### 3. Token 効率と完全性は相反する
- Opus: 18.5K tokens で 32 点 = 高効率
- Haiku: 31.2K tokens で 37 点 = 低効率だが完全性重視
- **→ 予算制約なら Haiku、速度重視なら Opus**

### 4. 段階的実装が最適
- Opus で MVP リリース（Month 4）
- Haiku の経験を Phase 2 に活かす（Month 5-8）
- **→ リスク分散 + 段階的品質向上**

---

## 📈 比較マトリックス

| 評価軸 | Opus-Haiku | Haiku-Opus | 勝者 |
|--------|-----------|-----------|------|
| スコア | 32/40 (80%) | 37/40 (92.5%) | Haiku |
| 実装期間 | 4 週間 | 5.5 週間 | Opus |
| Token 効率 | 1.73 pts/K | 1.19 pts/K | Opus |
| 完全性 | 60% | 100% | Haiku |
| Year 3 総コスト | $36.9K | $9.6K | Haiku |
| チーム要件 | ジュニア〜 | ミッド〜 | Opus |
| スケーラビリティ | △ | ◎ | Haiku |
| デバッグ性 | ◎ | △ | Opus |
| 学習効果 | ◎ | △ | Opus |

---

## 🚀 推奨アクション

### すぐに実行可能な判断

**予算 < $150K / 期限 < 8 週間**:
→ **Opus-Haiku を採用、Month 4 にリリース**

**予算 > $300K / 期限 12+ 週間**:
→ **Haiku-Opus を採用、本番グレード構築**

**予算 $150-300K / リスク最小化重視**:
→ **段階的実装（Opus → Haiku）を採用**

### ファイルを参照する前に確認すべき観点

1. **予算**: Token コスト（02-cost-and-resource.md）
2. **期限**: 実装期間（02-cost-and-resource.md）
3. **チームスキル**: ロードマップ（06-recommendations.md）
4. **長期価値**: Year 3 ROI（02-cost-and-resource.md）
5. **拡張性**: 設計パターン（04-design-pattern-analysis.md）

---

## 📚 関連ファイル

**同 theme-c 内**:
- `opus-haiku/spec.md` - Opus Planner の仕様書
- `opus-haiku/output/harness-scorer.py` - Haiku Generator の実装コード
- `haiku-opus/spec.md` - Haiku Planner の仕様書
- `haiku-opus/output/` - Opus Generator の仕様書群

**Theme B 参考資料**（同じ評価フレームワーク）:
- `/agent-build/theme-b/analytics/01-score-distribution.md`
- `/agent-build/theme-b/analytics/02-cost-and-resource.md`

---

## ❓ よくある質問

**Q1: どちらを選べばいい？**
A: 予算と期限で判断。詳細は 06-recommendations.md の「意思決定チャート」を参照。

**Q2: なぜ Haiku-Opus は点数が高いのに、Token が多くかかる？**
A: Phase 2 を含む完全な実装のため。詳細は 02-cost-and-resource.md の「Token 効率」セクション。

**Q3: Opus を選んだ場合、後から Phase 2 に拡張できる？**
A: はい。段階的実装パターンを参照（06-recommendations.md）。

**Q4: 5 業界ではなく 3 業界で十分？**
A: シーンによる。詳細は 03-feature-completeness.md の「運用効率指標」セクション。

**Q5: チームが小さい場合は？**
A: Opus-Haiku を推奨。詳細は 06-recommendations.md の「チームスキル別」セクション。

---

## 📋 更新履歴

| 日付 | 内容 | 作成者 |
|------|------|--------|
| 2026-05-10 | 6 ファイル + README 初版作成 | Claude Code |
| - | - | - |

---

**このレポートについて質問がある場合**:
- 01-score-distribution.md: スコアの根拠
- 02-cost-and-resource.md: コスト・効率の詳細
- 03-feature-completeness.md: 機能実装の詳細
- 04-design-pattern-analysis.md: アーキテクチャの詳細
- 05-implementation-insights.md: 意思決定プロセスの詳細
- 06-recommendations.md: 実装ロードマップの詳細

---

**Analytics 生成日**: 2026-05-10  
**評価フレームワーク**: agent-build-rubric.md v1.0  
**評価対象**: Theme C（Opus-Haiku vs Haiku-Opus）

