# Theme A Analytics フォルダ — 採点分析ガイド

**生成日**: 2026-05-09  
**テーマ**: Theme A - PR Review Automation Harness  
**評価対象**: Opus-Haiku版 vs Haiku-Opus版

---

## フォルダ概要

本フォルダは、Theme A の2つの実装パターンを多面的に分析・比較したドキュメント集です。

**生成ファイル**: 7個  
**総行数**: 約1500行  
**分析視点**: 5軸（要件・品質・強弱・コスト・設計・テスト）

---

## ファイル一覧と読順

### 推奨読順（段階的理解）

#### 1. **01-scores-summary.md**（スコアサマリー）
**所要時間**: 5-10分

**内容**:
- 40点スケール採点結果
- 100点換算表
- 4軸ごとの詳細得点
- スコア動向分析

**何が分かるか**: 「どちらが高スコアか」の全体像

**読むべき人**:
- 意思決定者（マネジャー）
- 短時間で結論を知りたい人

---

#### 2. **02-quality-analysis.md**（品質分析）
**所要時間**: 15-20分

**内容**:
- Must-Have/Should-Have/Nice-to-Have の要件充足表
- ファイルサイズ・複雑度の比較
- 設計パターンの適用状況
- エッジケース対応の網羅性

**何が分かるか**: 「どちらが品質が高いか、なぜか」の詳細根拠

**読むべき人**:
- アーキテクト（設計判断が必要）
- 要件充足度をチェックしたい人

---

#### 3. **03-strengths-weaknesses.md**（強弱分析）
**所要時間**: 15-20分

**内容**:
- Opus-Haiku版の強み・弱み（⭐ 5段階評価）
- Haiku-Opus版の強み・弱み（⭐ 5段階評価）
- 適用パターン別の推奨（シナリオ3選）
- 総合判定表

**何が分かるか**: 「どちらをどの場面で選ぶか」の具体的指針

**読むべき人**:
- プロジェクトマネジャー（導入判断）
- 両者を天秤にかけたい人

---

#### 4. **04-cost-time-analysis.md**（コスト・時間分析）
**所要時間**: 10-15分

**内容**:
- エージェント実行時間の見積もり
- API コスト見積もり（Opus vs Haiku）
- 月間PRレビュー数別のコスト効率
- パターン別最適パッケージ推奨

**何が分かるか**: 「年間いくら差があるか」「スケール別の選択」

**読むべき人**:
- 予算責任者（CFO）
- コスト効率を重視する組織

---

#### 5. **05-design-decisions.md**（設計決定記録）
**所要時間**: 20-25分

**内容**:
- エージェント分割方針の違い（2体 vs 計画的3体化）
- 重要度分類の粒度（Critical-Low vs Immediate-BestPractice）
- エッジケース対応戦略の差分
- エージェント間協調ロジック（Phase 2 vs Phase 1仕様化）

**何が分かるか**: 「どのような設計思想の違いがあるか」「今後の拡張性」

**読むべき人**:
- 設計責任者（アーキテクト）
- Phase 2 計画を策定する人

---

#### 6. **06-test-results.md**（テスト結果）
**所要時間**: 10-15分

**内容**:
- サンプル1（脆弱性検出）の検出結果：100% 合格（実装版）
- サンプル2（品質問題検出）の検出結果：100% 合格（実装版）
- 仕様版の検出精度予測（85-95%）
- エッジケーステスト結果

**何が分かるか**: 「実装版は本番運用できるか」「仕様版は実装可能か」

**読むべき人**:
- QA チーム（品質保証）
- 実装前に検証内容を確認したい人

---

### 参考: 別フォルダ構成

```
theme-a/
├── theme.md                          ← テーマ定義（背景）
├── opus-haiku/
│   ├── spec.md                       ← Opus版の仕様書
│   ├── implementation-summary.md      ← 実装概要
│   └── output/
│       ├── security-reviewer.md       ← セキュリティエージェント
│       ├── quality-reviewer.md        ← 品質エージェント
│       ├── pr-review-harness.md       ← ハーネス
│       ├── expected-report-*.md       ← 期待レポート
│       └── ...
├── haiku-opus/
│   ├── spec.md                       ← Haiku版の仕様書
│   └── ...
├── review/
│   └── comparison-report.md           ← 採点レポート（親ファイル）
└── analytics/                         ← ★このフォルダ
    ├── 01-scores-summary.md
    ├── 02-quality-analysis.md
    ├── 03-strengths-weaknesses.md
    ├── 04-cost-time-analysis.md
    ├── 05-design-decisions.md
    ├── 06-test-results.md
    └── README.md                      ← このファイル
```

---

## 読む前のチェックリスト

- [ ] テーマ定義（`theme.md`）を理解している
- [ ] Opus版仕様（`opus-haiku/spec.md`）を確認している
- [ ] Haiku版仕様（`haiku-opus/spec.md`）を確認している
- [ ] 採点レポート（`review/comparison-report.md`）の概要を理解している

---

## 使用シーン別ガイド

### シーン1: 「どちらを選ぶか決めたい」

**読むべき順序**:
1. **01-scores-summary.md** — スコアを確認
2. **03-strengths-weaknesses.md** — 具体的な強弱と推奨シナリオ
3. **04-cost-time-analysis.md** — コスト効率で判断

**所要時間**: 20-30分

---

### シーン2: 「両パターンの設計思想を理解したい」

**読むべき順序**:
1. **02-quality-analysis.md** — 品質構造を理解
2. **05-design-decisions.md** — 設計判断の背景を理解
3. **06-test-results.md** — 検証方法を確認

**所要時間**: 40-50分

---

### シーン3: 「本番運用まで進める」

**読むべき順序**:
1. **06-test-results.md** — 検出精度を確認
2. **04-cost-time-analysis.md** — 月間コストを計算
3. **03-strengths-weaknesses.md** — 選択パターンの弱点対策を確認

**所要時間**: 30-40分

---

### シーン4: 「Phase 2 拡張を計画する」

**読むべき順序**:
1. **05-design-decisions.md** — 設計思想の違いを把握
2. **02-quality-analysis.md** — 拡張性・保守性を確認
3. **03-strengths-weaknesses.md** — 両者のハイブリッド案を参照

**所要時間**: 50-70分

---

## 主要な比較表へのリンク

### スコア比較
→ **01-scores-summary.md** 「採点結果（40点スケール）」

### 要件充足度
→ **02-quality-analysis.md** 「1. 要件充足度の詳細」

### エージェント設計
→ **05-design-decisions.md** 「1. エージェント分割方針の違い」

### 実行時間
→ **04-cost-time-analysis.md** 「1. 実行時間見積もり」

### API コスト
→ **04-cost-time-analysis.md** 「2. API コスト見積もり」

### 強弱分析
→ **03-strengths-weaknesses.md** 「Opus-Haiku版の強み/弱み」「Haiku-Opus版の強み/弱み」

### テスト精度
→ **06-test-results.md** 「4. 検出精度の比較」

---

## よくある質問（FAQ）

### Q1: 「どちらが総合的に優れているか」

**A**: Haiku-Opus版（38/40点）が1点差で優位。ただしコンテキストに依存：
- **今すぐ本番運用**: Opus-Haiku版（実装検証済み）
- **長期保守・拡張**: Haiku-Opus版（拡張性明確）

詳細: **03-strengths-weaknesses.md** 「総合的な判定」

---

### Q2: 「実装版と仕様版の検出精度の差は」

**A**: Opus-Haiku版 100% vs Haiku-Opus版 85-95%（推測）
- 脆弱性: ほぼ同等（95-100%）
- 品質: Opus-Haiku版が優位（85-95% vs 100%）

詳細: **06-test-results.md** 「4. 検出精度の比較」

---

### Q3: 「月間100回のPRレビューを想定すると」

**A**: Haiku-Opus版が約 3 倍コスト効率が良い（年間 $250-300 削減）

詳細: **04-cost-time-analysis.md** 「3. パターン別コスト効率」

---

### Q4: 「Phase 2 で3体目エージェントを追加する場合」

**A**: Haiku-Opus版に従う（5ステップ標準化）。ただし Opus-Haiku版の実装検証も参考に。

詳細: **05-design-decisions.md** 「3. エージェント間協調ロジックの設計差分」

---

### Q5: 「どちらを基盤に選べば後悔しないか」

**A**: ハイブリッド戦略を推奨：
1. **最初**: Opus-Haiku版で安定性確認（3ヶ月）
2. **次期**: Haiku-Opus版の設計を参照、3体目追加
3. **最終**: Haiku-Opus版ベース + Opus-Haiku版の検出ロジック統合

詳細: **04-cost-time-analysis.md** 「4. パターン別最適パッケージ」

---

## キーワード索引

- **採点結果**: 01-scores-summary.md
- **要件充足**: 02-quality-analysis.md
- **強弱分析**: 03-strengths-weaknesses.md
- **コスト**: 04-cost-time-analysis.md
- **実行時間**: 04-cost-time-analysis.md
- **設計**: 05-design-decisions.md
- **拡張性**: 03-strengths-weaknesses.md / 05-design-decisions.md
- **テスト結果**: 06-test-results.md
- **検出精度**: 06-test-results.md
- **推奨**: 03-strengths-weaknesses.md

---

## フィードバック・更新予定

**バージョン**: 1.0  
**初版作成日**: 2026-05-09  
**次回更新予定**: Phase 2 実装後（Haiku-Opus版の実装検証完了時）

---

## 利用ガイドのまとめ

| 役割 | 推奨読み | 所要時間 |
|-----|---------|--------|
| **意思決定者** | 01 → 03 | 15分 |
| **アーキテクト** | 02 → 05 → 03 | 50分 |
| **QA/テスター** | 06 → 02 → 04 | 40分 |
| **プロジェクトマネジャー** | 03 → 04 → 01 | 30分 |
| **開発リーダー** | 05 → 02 → 06 → 03 | 60分 |

---

**README完成日**: 2026-05-09
