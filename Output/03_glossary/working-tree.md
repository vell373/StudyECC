# working-tree

**分類**: config / concept

## 定義
Claude Code（`claude` CLI）が現在アクセス・操作を許可されているローカルファイルの実体、およびその範囲のこと。Git のワーキングツリー（チェックアウトされたファイル群）とほぼ同義だが、Claude にとっては「コンテキストの境界」としての意味が強い。

## ECC での使われ方
Claude CLI を起動したディレクトリ配下がワーキングツリーとして認識される。Claude はこの範囲内のファイルを `read_file` や `grep` で探索し、必要に応じて直接編集を行う。`.claudeignore` や `.gitignore` で指定されたファイルは、このワーキングツリーの認識範囲から除外され、Claude のセッションからは隠蔽される。

## 他の用語との関係
- [tool](tool.md) — ワーキングツリー内のファイルやディレクトリを操作（読み書き・検索）するための手段。
- [e2e](e2e.md) — ワーキングツリー上のコードが期待通りに動作するかを検証するテスト手法。

## 参照
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)
- Git Working Tree 概念
