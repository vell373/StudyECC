---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust フック

> このファイルは [common/hooks.md](../common/hooks.md) を Rust 固有のコンテンツで拡張します。

## PostToolUse フック

`~/.claude/settings.json` で設定:

- **cargo fmt**: 編集後に `.rs` ファイルを自動フォーマット
- **cargo clippy**: Rust ファイル編集後にリントチェックを実行
- **cargo check**: 変更後にコンパイル検証（`cargo build` より高速）
