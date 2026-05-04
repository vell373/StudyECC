---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Go 固有のコンテンツで拡張します。

## フォーマット

- **gofmt** と **goimports** は必須 — スタイル議論なし

## 設計原則

- インターフェースを受け入れ、構造体を返す
- インターフェースは小さく保つ（1-3 メソッド）

## エラーハンドリング

常にエラーをコンテキストでラップ:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## リファレンス

スキル: `golang-patterns` を参照して、包括的な Go のイディオムとパターンを確認してください。
