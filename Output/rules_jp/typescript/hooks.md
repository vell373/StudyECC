---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript フック

> このファイルは [common/hooks.md](../common/hooks.md) を TypeScript/JavaScript 固有のコンテンツで拡張します。

## PostToolUse フック

`~/.claude/settings.json` で設定:

- **Prettier**: 編集後に JS/TS ファイルを自動フォーマット
- **TypeScript check**: `.ts`/`.tsx` ファイル編集後に `tsc` を実行
- **console.log warning**: 編集されたファイルで `console.log` について警告

## Stop フック

- **console.log audit**: セッション終了前に変更されたすべてのファイルを `console.log` についてチェック
