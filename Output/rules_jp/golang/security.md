---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go セキュリティ

> このファイルは [common/security.md](../common/security.md) を Go 固有のコンテンツで拡張します。

## シークレット管理

```go
apiKey := os.Getenv("OPENAI_API_KEY")
if apiKey == "" {
    log.Fatal("OPENAI_API_KEY not configured")
}
```

## セキュリティスキャン

- 静的セキュリティ分析に **gosec** を使用:
  ```bash
  gosec ./...
  ```

## コンテキストとタイムアウト

常にタイムアウト制御に `context.Context` を使用:

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
```
