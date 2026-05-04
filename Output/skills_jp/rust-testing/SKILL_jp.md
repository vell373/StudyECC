---
name: rust-testing
description: ユニットテスト・統合テスト・モック・プロパティベーステストを含むRustのTDDワークフロー。Rustコードのテストやrust-testingに関する質問があるときに使う。
origin: ECC
---

# RustテストワークフローとTDD

## ユニットテスト

```rust
// src/calculator.rs
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative_numbers() {
        assert_eq!(add(-2, -3), -5);
    }

    #[test]
    fn test_divide_success() {
        let result = divide(10.0, 2.0).unwrap();
        assert!((result - 5.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_divide_by_zero() {
        let result = divide(10.0, 0.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Division by zero");
    }

    #[test]
    #[should_panic(expected = "index out of bounds")]
    fn test_panic() {
        let v = vec![1, 2, 3];
        let _ = v[10];
    }
}
```

## 統合テスト

```rust
// tests/integration_test.rs
use my_crate::{UserService, Database};

#[test]
fn test_create_and_find_user() {
    let db = Database::new_in_memory();
    let service = UserService::new(db);
    
    let user_id = service.create_user("alice@example.com").unwrap();
    let user = service.find_user(user_id).unwrap();
    
    assert_eq!(user.email, "alice@example.com");
}
```

## 非同期テスト（Tokio）

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_operation() {
        let result = fetch_data("https://httpbin.org/get").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_timeout() {
        let result = tokio::time::timeout(
            std::time::Duration::from_millis(100),
            slow_operation()
        ).await;
        assert!(result.is_err()); // タイムアウトを期待
    }
}
```

## rstest によるパラメータ化テスト

```rust
use rstest::rstest;

#[rstest]
#[case(1, 2, 3)]
#[case(0, 0, 0)]
#[case(-1, -2, -3)]
#[case(i32::MAX, 0, i32::MAX)]
fn test_add_parametrized(#[case] a: i32, #[case] b: i32, #[case] expected: i32) {
    assert_eq!(add(a, b), expected);
}

#[rstest]
#[case("hello world", 11)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}

// フィクスチャを使用
#[rstest]
fn test_with_fixture(#[from(create_test_user)] user: User) {
    assert!(user.is_valid());
}

#[fixture]
fn create_test_user() -> User {
    User { name: "Test".to_string(), email: "test@example.com".to_string() }
}
```

## プロパティベーステスト（proptest）

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_add_commutative(a in any::<i32>(), b in any::<i32>()) {
        // オーバーフローを防ぐためにi64を使用
        let a = a as i64;
        let b = b as i64;
        prop_assert_eq!(a + b, b + a);
    }

    #[test]
    fn test_string_reverse_twice(s in ".*") {
        let reversed: String = s.chars().rev().collect();
        let double_reversed: String = reversed.chars().rev().collect();
        prop_assert_eq!(s, double_reversed);
    }

    #[test]
    fn test_sort_idempotent(mut v in prop::collection::vec(any::<i32>(), 0..100)) {
        v.sort();
        let sorted = v.clone();
        v.sort();
        prop_assert_eq!(v, sorted);
    }
}
```

## mockallによるモック

```rust
use mockall::{automock, predicate::*};

#[automock]
trait EmailService {
    fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String>;
}

#[automock]
trait UserRepository {
    fn find_by_id(&self, id: u32) -> Option<User>;
    fn save(&mut self, user: &User) -> Result<(), String>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_send_welcome_email() {
        let mut mock_email = MockEmailService::new();
        
        mock_email
            .expect_send_email()
            .with(eq("user@example.com"), eq("Welcome!"), always())
            .times(1)
            .returning(|_, _, _| Ok(()));

        let service = UserService::new(mock_email);
        service.register_user("user@example.com").unwrap();
    }

    #[test]
    fn test_user_not_found() {
        let mut mock_repo = MockUserRepository::new();
        
        mock_repo
            .expect_find_by_id()
            .with(eq(999u32))
            .returning(|_| None);

        let service = UserService::new(mock_repo);
        let result = service.get_user(999);
        assert!(result.is_err());
    }
}
```

## ドキュメンテーションテスト

```rust
/// 2つの整数を加算して結果を返す
///
/// # 例
///
/// ```
/// use my_crate::add;
///
/// let result = add(2, 3);
/// assert_eq!(result, 5);
/// ```
///
/// ```
/// use my_crate::add;
///
/// // 負の数
/// assert_eq!(add(-1, 1), 0);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// JSONをパースして構造体に変換する
///
/// # 例
///
/// ```
/// use my_crate::parse_config;
///
/// let json = r#"{"host": "localhost", "port": 8080}"#;
/// let config = parse_config(json).unwrap();
/// assert_eq!(config.host, "localhost");
/// assert_eq!(config.port, 8080);
/// ```
pub fn parse_config(json: &str) -> Result<Config, serde_json::Error> {
    serde_json::from_str(json)
}
```

## Criterionベンチマーク

```rust
// benches/benchmarks.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 1,
        1 => 1,
        n => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn criterion_benchmark(c: &mut Criterion) {
    c.bench_function("fib 20", |b| b.iter(|| fibonacci(black_box(20))));
    
    let mut group = c.benchmark_group("fibonacci");
    for i in [10u64, 20u64, 30u64].iter() {
        group.bench_with_input(format!("fib {}", i), i, |b, &n| {
            b.iter(|| fibonacci(black_box(n)))
        });
    }
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
```

## cargo-llvm-covによるカバレッジ

```bash
# cargo-llvm-covをインストール
cargo install cargo-llvm-cov

# カバレッジを実行してターミナルに表示
cargo llvm-cov

# HTML形式でカバレッジレポートを生成
cargo llvm-cov --html

# ターゲットカバレッジを確認（例: 80%）
cargo llvm-cov --fail-under-lines 80

# 特定のパッケージのみ
cargo llvm-cov -p my_package
```

## テストの構成

```
src/
├── lib.rs              # ユニットテストはソースファイル内
├── calculator.rs       # 対応するテストが #[cfg(test)] ブロック内にある
└── user/
    ├── mod.rs
    └── service.rs

tests/                  # 統合テストはここ
├── integration_test.rs
└── common/
    └── mod.rs          # テスト用共有ユーティリティ

benches/
└── benchmarks.rs       # パフォーマンスベンチマーク
```

## テストの実行

```bash
# すべてのテストを実行
cargo test

# 特定のテストを実行
cargo test test_add

# 名前にフィルタをかけて実行
cargo test calculator

# テスト出力を表示
cargo test -- --nocapture

# ドキュメンテーションテストのみ実行
cargo test --doc

# 統合テストのみ実行
cargo test --test integration_test

# ベンチマークを実行
cargo bench
```
