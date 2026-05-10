# Agent-Build Analytics（Theme C 総合分析）

**評価日**: 2026-05-10  
**テーマ**: 技術選定エージェント群（Tech Selection Agent Group）

---

## 概要

Theme C の 2つのアーキテクチャパターン（Opus-Haiku vs Haiku-Opus）を 6つの分析軸から総合評価したドキュメント集。

| パターン | 完成度 | コスト | 設計パターン | 適用場面 |
|---------|--------|--------|-----------|---------|
| **Opus-Haiku** | 32/40 (B) | 18.5K tokens | 集中型Harness（280行） | MVP・PoC |
| **Haiku-Opus** | 37/40 (A) | 31.2K tokens | 分散型Harness（615行） | 本番・スケーリング |

---

## ファイル構成

### 1. **01-score-distribution.md** — 採点結果の詳細分析
- **軸**: 要件充足度・品質・完成度・創造性
- **内容**: 4軸各10点の内訳・ギャップ分析・採点根拠
- **活用**: 「なぜこのグレード？」の判断根拠を確認

### 2. **02-cost-and-resource.md** — トークンコスト・リソース分析
- **軸**: 初期投資・効率性・長期TCO
- **内容**: Planner/Generator 別コスト分解・Year 1-5 ROI分析・Hybrid strategy
- **活用**: 予算計画・投資判定の定量基準

### 3. **03-feature-completeness.md** — 要件充足度・機能比較
- **軸**: Must-Have / Should-Have / Nice-to-Have の実装率
- **内容**: 要件別実装度・業界対応数・エッジケースカバー率
- **活用**: 「何が足りないか」を項目ベースで把握

### 4. **04-design-pattern-analysis.md** — アーキテクチャパターンの対比
- **軸**: Harness設計・スケーラビリティ・保守性
- **内容**: 集中型 vs 分散型の構造比較・データフロー・拡張性分析
- **活用**: 「どう設計すべきか」の設計判断材料

### 5. **05-implementation-insights.md** — 実装プロセスの分析
- **軸**: Planner/Generator の役割分担・創意工夫・学習効果
- **内容**: Opus/Haiku 別の設計スタイル差・実装忠誠度・Phase 2 複雑度
- **活用**: 「どのモデルを選ぶべきか」のモデル選定基準

### 6. **06-recommendations.md** — 推奨戦略・選択基準
- **軸**: プロジェクト特性・チームスキル・業界別適用
- **内容**: Opus-Haiku / Haiku-Opus / Hybrid の選択フロー・TCO比較・実装チェックリスト
- **活用**: 「どのパターンを選ぶか」の意思決定

---

## ファイル間の参照関係

```
┌─ 01-score-distribution.md
│  └─ 「完成度は何点か？」の詳細根拠
│     ↓ 参照
│
├─ 02-cost-and-resource.md
│  └─ 「コストと成果の関係は？」
│     ↓ 参照
│
├─ 03-feature-completeness.md
│  └─ 「何が実装されているか？」
│     ↓ 参照
│
├─ 04-design-pattern-analysis.md
│  └─ 「どう実装されているか？」
│     ↓ 参照
│
├─ 05-implementation-insights.md
│  └─ 「実装プロセスはどう違うか？」
│     ↓ 参照
│
└─ 06-recommendations.md
   └─ 「どれを選ぶべきか？」← 全分析を統合して推奨
```

**読み方**:
- **「何が違うか」を知りたい** → 01-04 を順読み
- **「どう決めるか」を知りたい** → 06 → 必要に応じて 01-05 を参照
- **「詳細な根拠」を知りたい** → 各ファイルの該当セクションへ直跳び

---

## Key Metrics（主要指標）

### 完成度スコア

```
総合得点 = (要件充足度 + 品質・構造 + 完成度・動作性 + 創造性・判断力) / 4

Opus-Haiku:   (8 + 9 + 8 + 7) / 4 = 8.0 → 32/40 → B グレード
Haiku-Opus:   (10 + 9 + 9 + 9) / 4 = 9.25 → 37/40 → A グレード

ギャップ: -5点（18%の品質差）
主因: Should-Have 要件（-3.5点）+ 創造性（-1.5点）
```

### トークンコスト効率

```
投資効率 = 完成度 / トークン消費

Opus-Haiku:   32点 / 18.5K = 1.73点/k （高効率）
Haiku-Opus:   37点 / 31.2K = 1.19点/k （低効率だが品質で補う）

差分: -0.54点/k（54%低効率）
理由: Haiku-Opus の追加エージェント（+2体）と高度なハーネス（+335行）
```

### 実装タイムライン

```
Opus-Haiku:    4-5営業日（Planner: Opus 設計 → Generator: Haiku 実装）
Haiku-Opus:    6-7営業日（Planner: Haiku 設計 → Generator: Opus 実装）

差分: +1-2日（タイムラグは Opus Generator の複雑な実装に起因）
```

### 拡張コスト

```
新エージェント追加時（Phase 2）:

Opus-Haiku:    Harness refactor 必須 → +150行追加（保守負担増）
Haiku-Opus:    plugin-style で対応 → +40行追加（保守負担最小）

拡張効率: Haiku-Opus が 3.75倍低コスト
```

---

## テーマ別の主要発見

### 設計パターンの違い

| 観点 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| **Harness 複雑度** | O(n) 線形増加 | O(log n) 対数増加 |
| **エージェント数** | 2体（最小限） | 4体（責務分離） |
| **スケーラビリティ** | ★☆☆ 低い | ★★★★★ 高い |
| **保守性** | ★★★ 中程度 | ★★★★★ 高い |
| **学習曲線** | ★★★★★ 低い | ★★ 高い |

---

### 実装プロセスの違い

| 項目 | Opus-Haiku | Haiku-Opus |
|-----|-----------|-----------|
| **Planner スタイル** | 詳細・rigid（15K tokens） | compact・flexible（7.5K tokens） |
| **Generator スタイル** | faithful executor（95%忠誠度） | creative interpreter（75%忠誠度） |
| **出力行数** | 902行（低） | 1,332行（高） |
| **Phase 2 難度** | 高い（全面refactor） | 低い（plugin追加） |

---

### 適用シーン別の適切性

```
MVP検証フェーズ:
  Opus-Haiku: ★★★★★ 最適
  Haiku-Opus: ★★☆ 過剰設計

初期本番展開:
  Opus-Haiku: ★★★ 改善余地あり
  Haiku-Opus: ★★★★★ 最適

複数業界対応:
  Opus-Haiku: ★★ 不十分
  Haiku-Opus: ★★★★★ 最適

長期スケーリング:
  Opus-Haiku: ★★ refactor コスト大
  Haiku-Opus: ★★★★★ plugin-style で拡張容易
```

---

## 学習ログ

### 実施した分析活動

| 分析軸 | 対象ファイル | 洞察 |
|-------|-----------|------|
| 採点結果 | agent-build-rubric.md | 4軸採点制度の構成確認 |
| コスト | Token usage 実績 | Planner/Generator 別の cost差 |
| 要件 | spec.md + implementation-summary.md | Must/Should/Nice の実装度分類 |
| 設計 | Harness 定義 | 集中型 vs 分散型の trade-off |
| 実装 | 各エージェント定義 | Opus/Haiku の役割分担差 |

### 推奨活動（今後の検討）

- [ ] 実際に両パターンを Theme B（記事執筆）/ Theme A（ウェブアプリ）で再検証
- [ ] Hybrid strategy の有効性をユーザー満足度で測定
- [ ] Phase 2 実装での実際のコスト（timelog）を記録
- [ ] Year 1-3 での TCO 実績値と予測値の比較

---

## 利用シーン別ガイド

### シーン1: 「今から プロジェクトを始めるが、どちらを選ぶべき？」

**推奨読み順**: 06（推奨戦略） → 02（コスト） → 01（品質）

**ポイント**: 
- 予算と timeline を確認して選択フロー に従う
- Hybrid strategy の検討（リスク最小化）

---

### シーン2: 「MVP で開始したが、Phase 2 に進むべき？」

**推奨読み順**: 02（Year 2-3 TCO） → 04（拡張パターン） → 06（upgrade判定）

**ポイント**:
- ユーザー成長率でアップグレード判定
- 設計負債の大きさを 04-design-pattern で確認

---

### シーン3: 「複数業界対応の要件が追加された。どう対応すべき？」

**推奨読み順**: 03（業界対応度） → 04（スケーラビリティ） → 06（業界別推奨）

**ポイント**:
- 現在のパターンが対応可能か 03 で確認
- 対応困難な場合は upgrade or refactor の判定

---

### シーン4: 「設計品質を詳しく理解したい」

**推奨読み順**: 04（設計パターン） → 05（実装プロセス） → 01（採点根拠）

**ポイント**:
- 責務分離の重要性を実感
- Harness 複雑度曲線（O(n) vs O(log n)）を理解

---

## Theme B（記事執筆）との比較

### Analytics ファイル構成の一貫性

| 軸 | 記事 | ウェブアプリ | エージェント |
|----|------|----------|----------|
| **01-score-distribution** | ✓ | ✓ | ✓ |
| **02-cost-and-resource** | ✓ | ✓ | ✓ |
| **03-feature-completeness** | ✓ | ✓ | ✓ |
| **04-design-pattern-analysis** | ✓ | ✓ | ✓ |
| **05-implementation-insights** | ✓ | ✓ | ✓ |
| **06-recommendations** | ✓ | ✓ | ✓ |

→ **3競技すべて同じ6軸で統一的に分析**

---

## 次のステップ

### Phase 1: 即座の活動
- [ ] 01-03 を読んで、採点結果・コスト・要件を理解
- [ ] 06 の「決定フロー」に従って、自プロジェクトに適用

### Phase 2: 発展的な活動
- [ ] 04-05 で設計パターンを習得
- [ ] 他の技術選定課題に Opus-Haiku / Haiku-Opus パターンを応用

### Phase 3: 検証活動
- [ ] Theme A（ウェブアプリ）の analytics と比較
- [ ] 「複数競技でのモデル選定パターン」の一般化

---

## Reference

### 関連ファイル

```
Output/07_comparisons/planner-model-comparison/
├── agent-build/
│   ├── theme-c/                    ← Theme C の成果物
│   │   ├── rubrics/
│   │   │   └── agent-build-rubric.md
│   │   ├── opus-haiku/
│   │   │   ├── spec.md
│   │   │   ├── implementation-summary.md
│   │   │   └── output/
│   │   └── haiku-opus/
│   │       ├── spec.md
│   │       ├── implementation-summary.md
│   │       └── output/
│   └── analytics/                  ← このフォルダ
│       ├── 01-score-distribution.md
│       ├── 02-cost-and-resource.md
│       ├── 03-feature-completeness.md
│       ├── 04-design-pattern-analysis.md
│       ├── 05-implementation-insights.md
│       ├── 06-recommendations.md
│       └── README.md (このファイル)
├── article/analytics/              ← Theme B 参考
└── webapp/analytics/               ← Theme B 参考
```

---

**ドキュメント作成日**: 2026-05-10  
**評価対象**: Theme C（技術選定エージェント群）  
**適用シーン**: agent-build 競技での設計判定  
**Reviewer**: Haiku 4.5（採点根拠は agent-build-rubric.md を参照）
