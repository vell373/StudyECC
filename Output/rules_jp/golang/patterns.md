---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Go 固有のコンテンツで拡張します。

## 関数型オプション

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## 小さいインターフェース

インターフェースを実装される場所ではなく、使用される場所で定義します。

## 依存性注入

コンストラクタ関数を使用して依存関係を注入:

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

## リファレンス

スキル: `golang-patterns` を参照して、並行性、エラーハンドリング、パッケージ組織を含む包括的な Go パターンを確認してください。
