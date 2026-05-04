# ECC におけるコンテキスト管理とフィードバックループの設計

**日付**: 2026-05-04
**関連解析**: → [../01_analysis/cursor/cursor_overview.md]
**関連ECC**: 
- `ECC/skills/gan-style-harness/SKILL.md`
- `ECC/skills/agent-introspection-debugging/SKILL.md`
- `ECC/skills/gateguard/SKILL.md`
- `ECC/commands/learn-eval.md`
- `ECC/skills/continuous-learning/SKILL.md`
- `ECC/hooks/hooks.json`

## やり取りした内容（事実のみ）

- **コンテキストとメモリの永続化**: 
  - ECCはステートレスセッションを前提とし、記憶はLLMのメモリ空間ではなく、プレーンテキストファイル（`relationships.md` 等）に書き出してGitでバージョン管理・永続化する仕組みを取っている。

- **フィードバックと自己修繕の基本思想**:
  - LLM単体による「自己評価（Self-evaluation）」は信用できない（問題を正当化して見逃す傾向がある）という前提で設計されている。
  - そのため、以下の手法で修繕と品質管理のループを回している：
    1. **GAN-style Harness**: 生成エージェントと評価エージェントを完全に分離し、敵対的な評価ループ（テスト→フィードバック→修正）を回す。
    2. **Agent Introspection Debugging**: エラー時の盲目的なリトライを禁止し、「障害の記録→原因診断→局所的な修繕→レポート出力」の自律デバッグフローを強制する。
    3. **GateGuard**: アクション前の自己評価の代わりに、PreToolUse フックを使ってファイルの依存関係などの「具体的な事実の調査」を強制する。

- **ルール学習と自己評価（Learn-Eval / Continuous Learning）**:
  - 新しいルールを抽出・保存する際は、チェックリストと全体判断（Save / Improve then Save / Absorb / Drop）による品質ゲートを通す。
  - **実行タイミング（Stop フック）**: この学習・評価プロセスは、対話ごとの遅延（レイテンシ）を避け、セッションの全トランスクリプトを利用するため、セッション終了時（チャットプロセスを閉じたタイミング）に自動で発火する。
  - **コンパクションとの違い**: コンパクション（`/compact`）はセッションを維持したままコンテキストを圧縮する処理であり、Stopフックは呼ばれない。代わりに `PreCompact` フックで情報の退避等が行われる。

## 次に調べること
- 特になし（調査結果の事実確認完了）
