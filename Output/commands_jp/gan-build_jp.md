---
description: 実装タスクのジェネレーター/エバリュエータービルドループを、制限されたイテレーションとスコアリングで実行する。
---

$ARGUMENTS から以下を解析する:
1. `brief` — 構築するものについてのユーザーの一行説明
2. `--max-iterations N` — （オプション、デフォルト 15）ジェネレーター-エバリュエーターサイクルの最大数
3. `--pass-threshold N` — （オプション、デフォルト 7.0）通過するための重み付きスコア
4. `--skip-planner` — （オプション）プランナーをスキップし、spec.md がすでに存在することを前提とする
5. `--eval-mode MODE` — （オプション、デフォルト "playwright"）playwright、screenshot、code-only のいずれか

## GAN スタイルハーネスビルド

このコマンドは Anthropic の 2026 年 3 月のハーネス設計論文にインスパイアされた三エージェントビルドループをオーケストレーションする。

### Phase 0: セットアップ
1. プロジェクトルートに `gan-harness/` ディレクトリを作成する
2. サブディレクトリを作成する: `gan-harness/feedback/`、`gan-harness/screenshots/`
3. まだ初期化されていない場合は git を初期化する
4. 開始時間と設定をログに記録する

### Phase 1: 計画（プランナーエージェント）
`--skip-planner` が設定されていない場合:
1. Task ツールでユーザーのブリーフとともに `gan-planner` エージェントを起動する
2. `gan-harness/spec.md` と `gan-harness/eval-rubric.md` を生成するのを待つ
3. ユーザーにスペックの概要を表示する
4. Phase 2 に進む

### Phase 2: ジェネレーター-エバリュエーターループ
```
iteration = 1
while iteration <= max_iterations:

    # GENERATE
    Task ツールで gan-generator エージェントを起動する:
    - spec.md を読む
    - iteration > 1 の場合: feedback/feedback-{iteration-1}.md を読む
    - アプリケーションを構築/改善する
    - 開発サーバーが起動していることを確認する
    - 変更をコミットする

    # ジェネレーターの終了を待つ

    # EVALUATE
    Task ツールで gan-evaluator エージェントを起動する:
    - eval-rubric.md と spec.md を読む
    - ライブアプリケーションをテストする（モード: playwright/screenshot/code-only）
    - ルーブリックに対してスコアリングする
    - feedback/feedback-{iteration}.md にフィードバックを書く

    # エバリュエーターの終了を待つ

    # スコアを確認する
    feedback/feedback-{iteration}.md を読む
    重み付き合計スコアを抽出する

    if score >= pass_threshold:
        "PASSED at iteration {iteration} with score {score}" をログに記録する
        Break

    if iteration >= 3 and score has not improved in last 2 iterations:
        "PLATEAU detected — stopping early" をログに記録する
        Break

    iteration += 1
```

### Phase 3: サマリー
1. すべてのフィードバックファイルを読む
2. 最終スコアとイテレーション履歴を表示する
3. スコアの進捗を表示する: `iteration 1: 4.2 → iteration 2: 5.8 → ... → iteration N: 7.5`
4. 最終評価からの残っている問題をリストアップする
5. 総時間と推定コストを報告する

### 出力

```markdown
## GAN Harness Build Report

**Brief:** [original prompt]
**Result:** PASS/FAIL
**Iterations:** N / max
**Final Score:** X.X / 10

### Score Progression
| Iter | Design | Originality | Craft | Functionality | Total |
|------|--------|-------------|-------|---------------|-------|
| 1 | ... | ... | ... | ... | X.X |
| 2 | ... | ... | ... | ... | X.X |
| N | ... | ... | ... | ... | X.X |

### Remaining Issues
- [最終評価からの問題]

### Files Created
- gan-harness/spec.md
- gan-harness/eval-rubric.md
- gan-harness/feedback/feedback-001.md through feedback-NNN.md
- gan-harness/generator-state.md
- gan-harness/build-report.md
```

完全なレポートを `gan-harness/build-report.md` に書き込む。
