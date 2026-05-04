# Git ワークフロー

## コミットメッセージフォーマット
```
<type>: <description>

<optional body>
```

タイプ: feat, fix, refactor, docs, test, chore, perf, ci

注意：属性は ~/.claude/settings.json でグローバルに無効化されています。

## プルリクエストワークフロー

PRを作成するとき:
1. 完全なコミット履歴を分析（最新コミットだけではなく）
2. `git diff [base-branch]...HEAD` を使用してすべての変更を確認
3. 包括的な PR サマリーを作成
4. TODO付きテストプランを含める
5. 新しいブランチの場合は `-u` フラグで プッシュ

> Git操作の前の完全な開発プロセス（計画、TDD、コードレビュー）については
> [development-workflow.md](./development-workflow.md) を参照してください。
