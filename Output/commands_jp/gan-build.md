---
description: 実装タスク用にジェネレーター/エバリュエーター構築ループを実行し、反復回数とスコアリングを制限します。
---

$ARGUMENTS から以下を解析：
1. `brief` — ユーザーが構築することについて説明する 1 行の説明
2. `--max-iterations N` — （オプション、デフォルト 15）最大ジェネレーター-エバリュエーターサイクル
3. `--pass-threshold N` — （オプション、デフォルト 7.0）パスするための加重スコア
4. `--skip-planner` — （オプション）プランナーをスキップ、spec.md が既に存在していると想定
5. `--eval-mode MODE` — （オプション、デフォルト "playwright"）playwright、screenshot、code-only のいずれか

## GAN スタイルハーネス構築

このコマンドは、Anthropic の 2026 年 3 月ハーネス設計ペーパーに触発された 3 エージェント構築ループを調整します。

### フェーズ 0: セットアップ
1. プロジェクトルートに `gan-harness/` ディレクトリを作成
2. サブディレクトリを作成: `gan-harness/feedback/`、`gan-harness/screenshots/`
3. git を初期化（まだ初期化されていない場合）
4. 開始時刻と設定をログに記録

### フェーズ 1: 計画（プランナーエージェント）
`--skip-planner` が設定されていない限り：
1. ユーザーの brief を使用して `gan-planner` エージェントを Task ツール経由で起動
2. `gan-harness/spec.md` と `gan-harness/eval-rubric.md` を生成するまで待機
3. ユーザーに spec サマリーを表示
4. フェーズ 2 へ進む

### フェーズ 2: ジェネレーター-エバリュエーターループ
```
iteration = 1
while iteration <= max_iterations:

    # 生成
    Task ツール経由で gan-generator エージェントを起動：
    - spec.md を読む
    - iteration > 1 の場合: feedback/feedback-{iteration-1}.md を読む
    - アプリケーションを構築/改善
    - 開発サーバーが実行されていることを確認
    - 変更をコミット

    # ジェネレーターの終了を待つ

    # 評価
    Task ツール経由で gan-evaluator エージェントを起動：
    - eval-rubric.md と spec.md を読む
    - ライブアプリケーションをテスト（モード: playwright/screenshot/code-only）
    - rubric に対してスコア
    - feedback を feedback/feedback-{iteration}.md に書き込む

    # エバリュエーターの終了を待つ

    # スコアを確認
    feedback/feedback-{iteration}.md を読む
    加重合計スコアを抽出

    if score >= pass_threshold:
        「PASSED at iteration {iteration} with score {score}」をログに記録
        Break

    if iteration >= 3 and スコアが最後の 2 回の反復で改善されていない:
        「PLATEAU detected — stopping early」をログに記録
        Break

    iteration += 1
```

### フェーズ 3: サマリー
1. すべてのフィードバックファイルを読む
2. 最終スコアと反復履歴を表示
3. スコア進行を表示: `iteration 1: 4.2 → iteration 2: 5.8 → ... → iteration N: 7.5`
4. 最終評価から残っている問題をリスト
5. 合計時間と推定コストを報告

### 出力

```markdown
## GAN ハーネス構築レポート

**Brief:** [元のプロンプト]
**結果:** PASS/FAIL
**反復:** N / max
**最終スコア:** X.X / 10

### スコア進行
| 反復 | デザイン | オリジナリティ | 工芸 | 機能性 | 合計 |
|------|--------|-------------|-------|---------------|-------|
| 1 | ... | ... | ... | ... | X.X |
| 2 | ... | ... | ... | ... | X.X |
| N | ... | ... | ... | ... | X.X |

### 残っている問題
- [最終評価から何か問題]

### 作成されたファイル
- gan-harness/spec.md
- gan-harness/eval-rubric.md
- gan-harness/feedback/feedback-001.md through feedback-NNN.md
- gan-harness/generator-state.md
- gan-harness/build-report.md
```

完全なレポートを `gan-harness/build-report.md` に書き込みます。
