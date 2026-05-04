---
description: "専門化されたエージェントを使用して、プルリクエストを包括的にレビューします。"
---

# プルリクエストレビュー

マルチパースペクティブのアプローチでプルリクエストを包括的にレビューします。

## 使用方法

`/review-pr [PR番号またはURL] [--focus=comments|tests|errors|types|code|simplify]`

PR が指定されない場合は、現在のブランチの PR をレビュー。focus が指定されない場合は、フルレビュースタックを実行します。

## ステップ

1. PR を特定:
   - `gh pr view` を使用して PR 詳細、変更ファイル、diff を取得
2. プロジェクトガイダンスを検出:
   - `CLAUDE.md`、lint コンフィグ、TypeScript コンフィグ、リポジトリ規約を検索
3. 専門化されたレビューエージェントを実行:
   - `code-reviewer`
   - `comment-analyzer`
   - `pr-test-analyzer`
   - `silent-failure-hunter`
   - `type-design-analyzer`
   - `code-simplifier`
4. 結果を集約:
   - 重複する検出を削除
   - 重大度でランク付け
5. 重大度でグループ化して検出結果をレポート

## 信頼度ルール

信頼度 >= 80 の問題のみをレポート:

- Critical: バグ、セキュリティ、データロス
- Important: テスト不足、品質の問題、スタイル違反
- Advisory: 明示的にリクエストされた場合のみ提案
