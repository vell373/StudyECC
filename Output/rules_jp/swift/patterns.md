---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Swift 固有のコンテンツで拡張します。

## プロトコル指向設計

小さくフォーカスされたプロトコルを定義。プロトコル拡張を共有デフォルトに使用:

```swift
protocol Repository: Sendable {
    associatedtype Item: Identifiable & Sendable
    func find(by id: Item.ID) async throws -> Item?
    func save(_ item: Item) async throws
}
```

## 値型

- データ転送オブジェクトとモデルに struct を使用
- 明確な状態をモデル化するのに関連値を持つ enum を使用:

```swift
enum LoadState<T: Sendable>: Sendable {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}
```

## アクターパターン

ロックまたはディスパッチキューの代わりに、共有 mutable 状態にアクターを使用:

```swift
actor Cache<Key: Hashable & Sendable, Value: Sendable> {
    private var storage: [Key: Value] = [:]

    func get(_ key: Key) -> Value? { storage[key] }
    func set(_ key: Key, value: Value) { storage[key] = value }
}
```

## 依存性注入

デフォルトパラメータでプロトコルを注入 — 本番はデフォルトを使用、テストはモックを注入:

```swift
struct UserService {
    private let repository: any UserRepository

    init(repository: any UserRepository = DefaultUserRepository()) {
        self.repository = repository
    }
}
```

## リファレンス

スキル `swift-actor-persistence` でアクターベース永続性パターンを参照。
スキル `swift-protocol-di-testing` でプロトコルベース DI とテストを参照。
