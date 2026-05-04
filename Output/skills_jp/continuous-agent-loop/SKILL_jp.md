---
name: continuous-agent-loop
description: Patterns for continuous autonomous agent loops with quality gates, evals, and recovery controls.
origin: ECC
---

# 継続的エージェントループ

これは v1.8+ の正式なループスキル名です。`autonomous-loops` を引き継ぎつつ、1 リリース分の後方互換性を維持しています。

## ループ選択フロー

```text
開始
  |
  +-- 厳密な CI/PR 制御が必要? -- はい --> continuous-pr
  |
  +-- RFC の分解が必要? -- はい --> rfc-dag
  |
  +-- 探索的な並列生成が必要? -- はい --> infinite
  |
  +-- デフォルト --> sequential
```

## 組み合わせパターン

推奨のプロダクションスタック:
1. RFC の分解 (`ralphinho-rfc-pipeline`)
2. 品質ゲート (`plankton-code-quality` + `/quality-gate`)
3. 評価ループ (`eval-harness`)
4. セッション永続化 (`nanoclaw-repl`)

## 失敗モード

- 進捗のないループのチャーン
- 同じ根本原因での繰り返しリトライ
- マージキューのスタック
- 際限なくエスカレーションし続けるコストのドリフト

## リカバリ

- ループを停止する
- `/harness-audit` を実行する
- スコープを失敗しているユニットに絞る
- 明確な受け入れ基準を定めて再実行する
