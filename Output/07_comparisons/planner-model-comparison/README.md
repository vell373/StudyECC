# モデルコスト最適化実験プロジェクト

## 目的

Xで見かけた「プランナーフェーズはHaikuで行い、実装フェーズはSonnet/Opusを使うとトークンコストが最適になる」という主張を、実際に検証するマルチエージェント実験。

## 実験構成

### 2つの実装パターン

| | Planner（設計） | Generator（実装） |
|---|---|---|
| **パターンA: Opus-Haiku** | claude-opus | claude-haiku |
| **パターンB: Haiku-Opus** | claude-haiku | claude-opus |

各パターンで同じお題に取り組み、最終成果物の品質をSonnet Reviewerが採点。

### 3種競技 × 3テーマ

各競技に3つのテーマがあり、両パターンで全てを実施。最後に平均スコアで比較。

#### 競技1: 記事執筆（3テーマ）
- **theme-a**: 「Claude Code のサブエージェントを使ってコードレビューを自動化する方法」
- **theme-b**: 「コンテキストエンジニアリング入門：プロンプトより強力な設計技術」
- **theme-c**: 「マルチエージェントハーネスの設計パターン：GANスタイルで品質を最大化する」

**要件**: 2000～3000文字、コード例2つ以上、Markdown形式

#### 競技2: ウェブアプリ開発（3テーマ）
- **theme-a**: マークダウンライブプレビューエディター（HTML/CSS/JS単体）
- **theme-b**: ポモドーロタイマー + タスク管理（HTML/CSS/JS、LocalStorage）
- **theme-c**: シンプルな習慣トラッカー（チェックイン・連続日数カウント）

**要件**: HTML/CSS/JS のみ、ブラウザで直接起動可能

#### 競技3: エージェント構築（3テーマ）
- **theme-a**: 「PRレビュー自動化ハーネス」（コード差分を受け取り複数観点でレビュー）
- **theme-b**: 「ドキュメント自動更新システム」（コード変更を検知してREADMEを更新）
- **theme-c**: 「技術選定エージェント群」（要件から技術スタックを提案・比較・決定）

**要件**: Claude Code エージェント形式（.md + frontmatter）、最低2体

---

## ディレクトリ構造

```
planner-model-comparison/
├── README.md (このファイル)
├── rubrics/                          ← Sonnet が事前生成する共通採点基準
│   ├── article-rubric.md
│   ├── webapp-rubric.md
│   └── agent-rubric.md
├── article/                          ← 競技1：記事執筆
│   ├── theme-a/
│   │   ├── theme.md                  ← テーマの定義（両パターン共通）
│   │   ├── opus-haiku/               ← パターンA（Opus Planner + Haiku Generator）
│   │   │   ├── spec.md               ← Opus Planner が生成
│   │   │   ├── implementation-summary.md  ← Haiku Generator が生成
│   │   │   └── output/               ← Haiku Generator の成果物
│   │   ├── haiku-opus/               ← パターンB（Haiku Planner + Opus Generator）
│   │   │   ├── spec.md
│   │   │   ├── implementation-summary.md
│   │   │   └── output/
│   │   └── review/                   ← Sonnet が採点結果を生成
│   │       ├── scores.json
│   │       └── comparison-report.md
│   ├── theme-b/ (同じ構造)
│   └── theme-c/ (同じ構造)
├── webapp/                           ← 競技2：ウェブアプリ開発
│   └── [theme-a, theme-b, theme-c の同じ構造]
├── agent-build/                      ← 競技3：エージェント構築
│   └── [theme-a, theme-b, theme-c の同じ構造]
└── final-report.md                   ← 3競技を集約した最終レポート（実験完了後）
```

---

## 実行フロー

### Step 0: ルーブリック策定（先行実施）

Sonnet Reviewer が各競技のルーブリックを策定：
```
@reviewer（ルーブリック策定モード）
入力: article/theme-a/theme.md, ...
出力: rubrics/article-rubric.md, rubrics/webapp-rubric.md, rubrics/agent-rubric.md
```

### Step 1～N: 各テーマの実施（競技ごと）

**例: 記事 theme-a の実行**

1. **Opus Planner** → spec.md 生成
   ```
   @planner-opus
   入力: /path/to/article/theme-a/theme.md
   出力: /path/to/article/theme-a/opus-haiku/spec.md
   ```

2. **Haiku Generator** → 実装
   ```
   @generator-haiku
   入力: /path/to/article/theme-a/opus-haiku/spec.md + rubrics/article-rubric.md
   出力: /path/to/article/theme-a/opus-haiku/output/ + implementation-summary.md
   ```

3. **Haiku Planner** → spec.md 生成（同じテーマ）
   ```
   @planner-haiku
   入力: /path/to/article/theme-a/theme.md
   出力: /path/to/article/theme-a/haiku-opus/spec.md
   ```

4. **Opus Generator** → 実装
   ```
   @generator-opus
   入力: /path/to/article/theme-a/haiku-opus/spec.md + rubrics/article-rubric.md
   出力: /path/to/article/theme-a/haiku-opus/output/ + implementation-summary.md
   ```

5. **Sonnet Reviewer** → 採点
   ```
   @reviewer（採点モード）
   入力: 両パターンの成果物 + rubrics/article-rubric.md
   出力: /path/to/article/theme-a/review/scores.json + comparison-report.md
   ```

6. **繰り返し**: theme-b, theme-c を同様に実施

---

## 採点基準

Sonnet が策定した共通ルーブリックに基づく 4 軸採点（各 0-10 点、合計 0-40 点）：

1. **要件充足度** — spec.md の Must-Have 要件がどれだけ達成されたか
2. **品質・構造** — コード品質、モジュール分割、命名規則の統一度
3. **完成度・動作性** — 実際に動作するか、エラーハンドリングの充実度
4. **創造性・判断力** — 仕様の曖昧な部分をどう解決したか、UX への工夫

---

## 結果の見方

### scores.json
各テーマの両パターンのスコア差を記録。

### comparison-report.md
スコア差が生まれた理由の定性分析。

### final-report.md（実験完了後）
3競技9テーマ分のスコアを集約し、以下をまとめる：
- 各競技での平均スコア比較
- 全体平均スコア
- Opus-Haiku vs Haiku-Opus どちらが有効か
- コスト効率の試算

---

## エージェント一覧

| エージェント | モデル | 役割 |
|---|---|---|
| `planner-opus.md` | opus | 要件定義・設計仕様書 |
| `planner-haiku.md` | haiku | 同上（指示は同一） |
| `generator-opus.md` | opus | spec.md から実装 |
| `generator-haiku.md` | haiku | 同上（指示は同一） |
| `reviewer.md` | sonnet | ルーブリック策定 + 採点 |

すべて `.claude/agents/` に配置。
