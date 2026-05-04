---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift セキュリティ

> このファイルは [common/security.md](../common/security.md) を Swift 固有のコンテンツで拡張します。

## シークレット管理

- 機密データ（トークン、パスワード、キー）に **Keychain Services** を使用 — `UserDefaults` を決して使用しない
- ビルド時シークレットに環境変数または `.xcconfig` ファイルを使用
- ソースに シークレットをハードコード化しない — 逆コンパイルツールで簡単に抽出される

```swift
let apiKey = ProcessInfo.processInfo.environment["API_KEY"]
guard let apiKey, !apiKey.isEmpty else {
    fatalError("API_KEY not configured")
}
```

## トランスポートセキュリティ

- App Transport Security（ATS）がデフォルトで強制 — 無効にしない
- クリティカルエンドポイントに証明書ピンニングを使用
- すべてのサーバー証明書を検証

## 入力検証

- 注入を防止するため、すべてのユーザー入力を表示前にサニタイズ
- 強制アンラップではなく検証で `URL(string:)` を使用
- 外部ソース（API、ディープリンク、ペーストボード）からのデータを処理前に検証
