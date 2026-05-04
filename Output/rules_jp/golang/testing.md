---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go テスト

> このファイルは [common/testing.md](../common/testing.md) を Go 固有のコンテンツで拡張します。

## フレームワーク

**テーブル駆動テスト** を使用した標準 `go test` を使用します。

## レース検出

常に `-race` フラグで実行:

```bash
go test -race ./...
```

## カバレッジ

```bash
go test -cover ./...
```

## リファレンス

スキル: `golang-testing` を参照して、詳細な Go テストパターンとヘルパーを確認してください。
