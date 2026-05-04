---
paths:
  - "**/*.rs"
---
# Rust テスト

> このファイルは [common/testing.md](../common/testing.md) を Rust 固有のコンテンツで拡張します。

## テストフレームワーク

- **`#[test]`** と `#[cfg(test)]` モジュール（ユニットテスト）
- **rstest** パラメータ化テストとフィクスチャ
- **proptest** プロパティベーステスト
- **mockall** トレイトベースモック
- **`#[tokio::test]`** 非同期テスト

## テスト組織

```text
my_crate/
├── src/
│   ├── lib.rs           # #[cfg(test)] モジュールのユニットテスト
│   ├── auth/
│   │   └── mod.rs       # #[cfg(test)] mod tests { ... }
│   └── orders/
│       └── service.rs   # #[cfg(test)] mod tests { ... }
├── tests/               # 統合テスト（各ファイル = 別バイナリ）
│   ├── api_test.rs
│   ├── db_test.rs
│   └── common/          # 共有テストユーティリティ
│       └── mod.rs
└── benches/             # Criterion ベンチマーク
    └── benchmark.rs
```

ユニットテストは同じファイルの `#[cfg(test)]` モジュール内。統合テストは `tests/` へ。

## ユニットテストパターン

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_user_with_valid_email() {
        let user = User::new("Alice", "alice@example.com").unwrap();
        assert_eq!(user.name, "Alice");
    }

    #[test]
    fn rejects_invalid_email() {
        let result = User::new("Bob", "not-an-email");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("invalid email"));
    }
}
```

## パラメータ化テスト

```rust
use rstest::rstest;

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}
```

## 非同期テスト

```rust
#[tokio::test]
async fn fetches_data_successfully() {
    let client = TestClient::new().await;
    let result = client.get("/data").await;
    assert!(result.is_ok());
}
```

## mockall でのモック

本番コードでトレイトを定義；テストモジュールでモックを生成:

```rust
// 本番トレイト — 統合テストがインポート可能な pub
pub trait UserRepository {
    fn find_by_id(&self, id: u64) -> Option<User>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::eq;

    mockall::mock! {
        pub Repo {}
        impl UserRepository for Repo {
            fn find_by_id(&self, id: u64) -> Option<User>;
        }
    }

    #[test]
    fn service_returns_user_when_found() {
        let mut mock = MockRepo::new();
        mock.expect_find_by_id()
            .with(eq(42))
            .times(1)
            .returning(|_| Some(User { id: 42, name: "Alice".into() }));

        let service = UserService::new(Box::new(mock));
        let user = service.get_user(42).unwrap();
        assert_eq!(user.name, "Alice");
    }
}
```

## テスト命名

シナリオを説明する説明的な名前を使用:
- `creates_user_with_valid_email()`
- `rejects_order_when_insufficient_stock()`
- `returns_none_when_not_found()`

## カバレッジ

- 80%+ 行カバレッジをターゲット
- カバレッジ報告に **cargo-llvm-cov** を使用
- ビジネスロジックに焦点 — 生成コードと FFI バインディングを除外

```bash
cargo llvm-cov                       # 概要
cargo llvm-cov --html                # HTML レポート
cargo llvm-cov --fail-under-lines 80 # しきい値以下で失敗
```

## テストコマンド

```bash
cargo test                       # すべてのテストを実行
cargo test -- --nocapture        # println 出力を表示
cargo test test_name             # パターンマッチテストを実行
cargo test --lib                 # ユニットテストのみ
cargo test --test api_test       # 特定統合テスト（tests/api_test.rs）
cargo test --doc                 # ドックテストのみ
```

## リファレンス

スキル `rust-testing` でプロパティベーステスト、フィクスチャ、Criterion ベンチマークを含む包括的なテストパターンを参照。
