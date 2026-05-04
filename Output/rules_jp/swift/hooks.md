---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift フック

> このファイルは [common/hooks.md](../common/hooks.md) を Swift 固有のコンテンツで拡張します。

## PostToolUse フック

`~/.claude/settings.json` で設定:

- **SwiftFormat**: 編集後に `.swift` ファイルを自動フォーマット
- **SwiftLint**: `.swift` ファイル編集後にリントチェックを実行
- **swift build**: 編集後に変更されたパッケージをタイプチェック

## 警告

`print()` ステートメントにフラグを立てる — 本番コードでは `os.Logger` または構造化ログを代わりに使用
