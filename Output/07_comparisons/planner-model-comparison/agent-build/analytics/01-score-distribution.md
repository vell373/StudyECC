# Theme C スコア分布分析

**評価日**: 2026-05-10  
**テーマ**: 技術選定エージェント群（Tech Selection Agent Group）

---

## スコア総括

| パターン | 要件充足 | 品質 | 完成度 | 創造性 | **計** | グレード | 評価 |
|---------|--------|------|--------|--------|--------|---------|------|
| Opus-Haiku | 8/10 | 9/10 | 8/10 | 7/10 | **32/40** | **B** (80%) | 良好。要件充足だが改善余地あり |
| Haiku-Opus | 10/10 | 9/10 | 9/10 | 9/10 | **37/40** | **A** (92.5%) | 優秀。ごく微調整で完成 |
| 差分 | -2 | 0 | -1 | -2 | **-5** | **+12.5%** | Haiku-Opus優位 |

---

## 各軸の詳細分析

### 1. 要件充足度（0-10点）

#### Opus-Haiku: 8/10 ✓

**達成要件**:
- ✓ 最低2体エージェント実装（RequirementAnalyzerAgent, TechnologyProposalAgent）
- ✓ Harness実装（基本的な統合・矛盾検出）
- ✓ 0-10スケール統一スコアリング
- ✓ 優位性マトリックス生成
- ✓ トレードオフ分析（◎と××形式）
- ✓ サンプル要件書2件以上（SaaS, Healthcare, IoT = 3件）

**未達成要件** (-2点):
- ✗ Should-Have「3体目エージェント」未実装
  - Cost見積もりエージェント: 不在
  - スコアリングエージェント: Harness統合で対応（独立エージェントではない）

- ✗ Should-Have「複数業界対応」の判別ロジック不十分
  - 3業界テスト実施されたが、業界判別の自動化がない

**評価**: Must-Have は完全達成だが、Should-Have の欠落が2点減

---

#### Haiku-Opus: 10/10 ✓✓

**達成要件** (全Must-Have):
- ✓ 最低2体エージェント実装（RequirementAnalyzerAgent, TechnologyProposalAgent）
- ✓ Harness実装（複雑な統合・3-level contradiction detection）
- ✓ 0-10スケール統一スコアリング（詳細な基準書付）
- ✓ 優位性マトリックス生成（複数形式: 表 + グラフ）
- ✓ トレードオフ分析（詳細な「なぜか」説明付）
- ✓ サンプル要件書5件（SaaS, Healthcare, IoT, Manufacturing, E-commerce）

**達成要件** (Should-Have):
- ✓ 3体目エージェント: cost-estimator完全実装
- ✓ エージェント間協調: requirement → proposal → costing → harness のパイプライン
- ✓ 複数業界対応: 業界判別ロジック（SaaS, Enterprise, Healthcare等 9分類）
- ✓ ドキュメント充実: スコアリング基準ドキュメント + README + cost-estimation.md

**評価**: 全Must-Have + Should-Have 4個を達成

---

### 2. 品質・構造（0-10点）

#### Opus-Haiku: 9/10 ✓

**エージェント設計の明確性**:
- ✓ RequirementAnalyzerAgent: スケール重要度判定（180行）
- ✓ TechnologyProposalAgent: 技術提案（195行）
- ✓ Harness: 統合・スコアリング（280行）
- 責務分離: 明確（3責務, 3エージェント）

**ファイル構成**:
- ✓ kebab-case統一（requirement-analyzer-agent.md等）
- ✓ PascalCase命名統一（RequirementAnalyzerAgent）
- ✓ フォルダ構成: agents/, harness/, samples/ で論理的整理

**コード品質**:
- ✓ エージェント定義: 180-195行（200行以下）
- ✓ 重複ロジック: なし
- ✓ コメント: 「なぜ」を説明（例: "スケール重要度は、『ユーザー数』『アクティブ同時接続数』から判定"）

**評価**: 設計が clean、責務分離が excellent

---

#### Haiku-Opus: 9/10 ✓

**エージェント設計の明確性**:
- ✓ RequirementAnalyzerAgent: 206行（複雑な優先度判定）
- ✓ TechnologyProposalAgent: 311行（詳細な提案ロジック）
- ✓ CostEstimatorAgent: 456行（新規追加、独立判定）
- ✓ HarnessOrchestrator: 615行（複雑な3-level矛盾検出）

**ファイル構成**:
- ✓ 命名規則統一
- ✓ フォルダ構成: agents/ + orchestration/ で分離
- ✓ dependency graph を spec.json で明示

**コード品質**:
- ✓ エージェント定義: 200-600行（複雑性が高いため）
- ✓ 重複ロジック: 「Phase 1/2 transition」で明確に分離
- ✓ コメント: 「なぜ」を説明（例: "Breaking change の検出は SemVer の major bump に基づく"）

**-1点の理由**: Harness が615行で Opus-Haiku より複雑（保守負担増）

---

### 3. 完成度・動作性（0-10点）

#### Opus-Haiku: 8/10 ✓

**実装の完成度**:
- ✓ 2体エージェント正常動作
- ✓ Harness が複数エージェント結果をマージ
- ✓ 推奨テック スタック確実に出力

**エラーハンドリング**:
- ✓ 不正な入力への例外処理（スペル誤字等）
- ✓ エラーメッセージが実用的（「何が問題か」を示唆）

**エッジケース対応**:
- ✓ 要件矛盾の優先度付け: 実装
- ✓ レガシー移行の学習コスト: 考慮
- ✓ 新興技術判定（Rust・Go）: リスク評価実施
- ✗ 予算制約厳しい場合の対応: 部分的（cost-estimator 未統合）

**再現性**:
- ✓ 同じ要件で同じ推奨結果
- ✓ 環境依存なし

**テスト実施**:
- ✓ サンプル3件（SaaS, Healthcare, IoT）で実行確認
- ✓ 異なる優先軸に対して異なる推奨結果を出力確認
- ✓ テスト結果ドキュメント化

**-2点の理由**: edge case のカバレッジが限定（3パターン）、複数優先軸同時の矛盾解決が基本的

---

#### Haiku-Opus: 9/10 ✓✓

**実装の完成度**:
- ✓ 4体エージェント正常動作
- ✓ Harness が複数結果を3-level分類
- ✓ 推奨テック スタック + コスト見積もり + confidence score を出力

**エラーハンドリング**:
- ✓ 不正な入力への例外処理（詳細）
- ✓ エラーメッセージ: 「何が問題か」「どう修正するか」を両方示唆

**エッジケース対応**:
- ✓ 要件矛盾の優先度付け: 優先度ツリーで解決
- ✓ レガシー移行: 学習曲線推定と migration path を提供
- ✓ 新興技術判定: リスク評価 + 採用リスク定量化
- ✓ 予算制約: Cost-estimator で「コスト優先の提案」を実施
- ✓ 複数優先軸同時: Weighted scoring で優先度自動調整

**再現性**:
- ✓ 同じ要件で同じ推奨結果（confidence score も同一）
- ✓ 環境依存なし（ダミー予算で動作可能）

**テスト実施**:
- ✓ サンプル5件（SaaS, Healthcare, IoT, Manufacturing, E-commerce）で実行
- ✓ 異なる優先軸で異なる推奨結果を出力確認
- ✓ 複雑な矛盾パターン（複数優先軸+予算制約等）で追加テスト
- ✓ テスト結果と confidence score を全ドキュメント化

**-1点の理由**: Harness の複雑性（615行）により edge case の追跡が難（保守コスト）

---

### 4. 創造性・判断力（0-10点）

#### Opus-Haiku: 7/10 ✓

**仕様の解釈・補完**:
- ✓ スコアリングの0-10点定義を設定（「GitHub stars の popularity」等の客観基準）
- ✓ 優位性マトリックスを工夫的に設計（要件軸 × 技術軸の2次元表）
- 仕様の曖昧な部分は basic な解釈に留める

**スコアリングロジックの説得力**:
- ✓ 「なぜこの技術に10点か」が説明可能（業界標準に基づく）
- ロジック: 比較的シンプル（初期段階）

**トレードオフ分析の深さ**:
- ✓ 「◎と××の列挙」で対立軸を明示
- △ 「どちらを選ぶべきか」の判断基準は基本的（「ビジネス優先か技術優先か」程度）
- △ 複数業界パターンで異なるトレードオフを示現していない

**ユーザー体験への工夫**:
- △ 「学習曲線の推定」: なし
- △ 「チームオンボーディング時間」: なし
- ✓ レポート形式: 読みやすい（表 + 説明文）

**拡張性・再利用可能性**:
- △ 実装が「3種類の優先軸」に固定化している
- △ Phase 2への拡張は新しい agents追加が必要（既存エージェントの refactor負担大）

**評価**: 基本的な工夫はあるが、超過実装（Should-Have以上）がない

---

#### Haiku-Opus: 9/10 ✓✓

**仕様の解釈・補完**:
- ✓ スコアリングの0-10点を6カテゴリー（scalability, security, performance, maintainability, cost, learning-curve）で詳細定義
- ✓ 優位性マトリックスを複数形式で設計（表 + radar chart + heatmap の3種類）
- ✓ 仕様の曖昧な部分を「業界判別ロジック」として主体的に補完

**スコアリングロジックの説得力**:
- ✓ 「なぜこの技術に10点か」が定量的に説明可能
- ✓ 各スコアの根拠が「GitHub stars, npm downloads, security audit logs, community size」等の客観データに基づく
- ✓ Confidence score（0.0-1.0）を導入し、スコアの確度を明示

**トレードオフ分析の深さ**:
- ✓ 「◎と××の対立」を「なぜか」定量的に説明
  - 例: "Node.js: scalability ◎（水平スケーリング容易）vs security ××（全クライアント側のバリデーション必須）"
- ✓ 複数業界（SaaS, Healthcare, IoT等）でトレードオフが異なることを具体的に示現
  - 例: "SaaS は scalability 重視 → Node.js推奨、Healthcare は security 重視 → Java推奨"

**ユーザー体験への工夫**:
- ✓ 「学習曲線の推定」: language/framework ごとに "Months to 80% productivity" を計算
- ✓ 「チームオンボーディング時間」: 「Opus-Haiku では5-15分、Haiku-Opus では30秒」と実測値提供
- ✓ 「この推奨に従った場合、3年後のリスク」:技術寿命予測（例: Python EOL, Node LTS schedule）
- ✓ レポート形式: 複数フォーマット（Markdown表, YAML, JSON）で提供

**拡張性・再利用可能性**:
- ✓ 業界判別ロジックが「SaaS/Enterprise/Healthcare」等で汎用化（プラグイン可能）
- ✓ Phase 2（cost-estimator）の追加が既存エージェントへの修正を最小化
- ✓ 他の技術選定ケース（データベース選定、クラウドプラットフォーム選定等）に流用可能な構造

**-1点の理由**: Harness の複雑性が feature-richness を損なう可能性

---

## グレード判定の詳細

### Opus-Haiku: B グレード（80%）

```
総合得点 = (8 + 9 + 8 + 7) / 4 = 32 / 4 = 8.0

グレード: 6.0 ≤ 8.0 < 8.0 → B（良好）
評価: 「良好。要件充足だが改善余地あり」
```

**判定根拠**:
- Must-Have は完全達成 ✓
- Should-Have の欠落（Cost Estimator, 業界判別ロジック）が-2点
- エッジケース対応が基本的（-1点）
- 創造性に工夫がない（-2点）

**推奨用途**: MVP・学習向け（初期段階での実装）

---

### Haiku-Opus: A グレード（92.5%）

```
総合得点 = (10 + 9 + 9 + 9) / 4 = 37 / 4 = 9.25

グレード: 8.0 ≤ 9.25 < 9.0 → A（優秀）
評価: 「優秀。ごく微調整で完成」
```

**判定根拠**:
- Must-Have + Should-Have 完全達成 ✓
- エッジケース対応が comprehensive（8パターン）
- 創造性が高い（業界判別ロジック、cost-estimator, confidence score等）
- Harness 複雑性が-1点のみ

**推奨用途**: 本番運用・長期メンテナンス向け

---

## 差分分析

### なぜ -5点か

| 原因 | 点数 | 影響範囲 |
|-----|------|--------|
| Should-Have実装度差（Cost Estimator 未実装） | -2 | 要件充足度 |
| エッジケースカバレッジ（3 vs 8パターン） | -1 | 完成度・動作性 |
| 創造性・判断力の差（工夫量） | -2 | 創造性・判断力 |

### パターン別ギャップ

```
Opus-Haiku          Haiku-Opus          ギャップ
─────────          ──────────          ───────
要件充足: 8点      要件充足: 10点      Phase 2への準備度の差
品質構造: 9点      品質構造: 9点       設計品質は同等 ✓
完成度:   8点      完成度:   9点       Edge case coverage差
創造性:   7点      創造性:   9点       超過実装（Should-Have）
```

---

## 結論

**スコア差 -5 点（80% vs 92.5%）の本質**:

1. **設計哲学の違い**
   - Opus-Haiku: "Specification fidelity"（仕様に忠実）→ Must-Have完全実装
   - Haiku-Opus: "Adaptive expansion"（主体的拡張）→ Should-Have先読み実装

2. **エージェント数の影響**
   - 2体（Opus-Haiku）vs 4体（Haiku-Opus）
   - Cost Estimator の追加がスコアリングの信頼性を大きく向上

3. **複雑性とのトレードオフ**
   - Opus-Haiku: シンプル（保守容易）だが限定的
   - Haiku-Opus: 複雑（保守負担）だが完全

**推奨**: 初期段階は Opus-Haiku、成熟段階は Haiku-Opus への段階的アップグレード

---

**分析完了**: 2026-05-10
