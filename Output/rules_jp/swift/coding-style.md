---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Swift 固有のコンテンツで拡張します。

## フォーマット

- **SwiftFormat** で自動フォーマット、**SwiftLint** でスタイル強制
- `swift-format` は Xcode 16+ にバンドルされる代替案

## イミュータビリティ

- `let` を `var` より優先 — すべてを `let` として定義し、コンパイラが必要な場合のみ `var` に変更
- デフォルトで値セマンティクスを持つ `struct` を使用；識別性または参照セマンティクスが必要な場合のみ `class` を使用

## 命名

[Apple API デザインガイドライン](https://www.swift.org/documentation/api-design-guidelines/) に従う:

- 使用時の明確性 — 不要な単語を省略
- メソッドとプロパティをそれらの型ではなく役割で命名
- グローバル定数より `static let` を定数として使用

## エラーハンドリング

型付きスロー（Swift 6+）とパターンマッチングを使用:

```swift
func load(id: String) throws(LoadError) -> Item {
    guard let data = try? read(from: path) else {
        throw .fileNotFound(id)
    }
    return try decode(data)
}
```

## 並行処理

Swift 6 厳格並行処理チェックを有効化。以下を優先:

- 分離境界を越えるデータのための `Sendable` 値型
- 共有 mutable 状態に対するアクター
- 非構造化 `Task {}` より構造化並行処理（`async let`, `TaskGroup`）
