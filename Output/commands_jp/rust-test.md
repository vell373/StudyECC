---
description: "Rust の TDD（テスト駆動開発）サイクルを強制し、Red-Green-Refactor パターンを実行します。rust-test-enforcer エージェントを呼び出します。"
---

# Rust テスト駆動開発

このコマンドは **rust-test-enforcer** エージェントを呼び出して、Rust における TDD サイクルを厳格に実行します。

## このコマンドの機能

1. **Red フェーズ**: 失敗するテストを書く
   - `#[test]` マクロで基本的なユニットテストを生成
   - テストが現在の実装では失敗することを確認
2. **Green フェーズ**: テストを通す最小限の実装
   - 失敗しているテストだけを修正する機能を追加
   - `cargo test` で確認
3. **Refactor フェーズ**: リファクタリング
   - テストが引き続き成功する状態で、コードを改善
   - 重複排除、パフォーマンス最適化を実施
4. **テストフレームワークの統合**:
   - `rstest` - パラメータ化テストおよびフィクスチャ
   - `proptest` - プロパティベーステスト
   - `mockall` - モック生成

## 使用時

以下の場合に `/rust-test` を使用:
- 新しい Rust 機能を実装する前
- バグ修正の前に テストケース を作成する
- 既存コードに テストカバレッジ を追加する
- Rust TDD のベストプラクティスを学ぶ

## 実行される検証コマンド

```bash
# テスト実行（標準）
cargo test 2>&1

# 詳細な失敗ログ
cargo test -- --nocapture 2>&1

# スレッド数を制限（予測可能な実行順序）
cargo test -- --test-threads=1 2>&1

# カバレッジ（Tarpaulin がインストール済みの場合）
if command -v cargo-tarpaulin >/dev/null; then 
  cargo tarpaulin --out Html --output-dir coverage
else 
  echo "cargo-tarpaulin がインストールされていません"
fi
```

## Red-Green-Refactor サイクル

### Red フェーズ: 失敗するテストを書く

```rust
#[test]
fn test_user_creation_with_valid_data() {
    let user = User::new("Alice".into(), "alice@example.com".into());
    assert_eq!(user.name, "Alice");
    assert_eq!(user.email, "alice@example.com");
}
```

実行結果:
```bash
$ cargo test
error[E0425]: cannot find value `User` in this scope
```

### Green フェーズ: 最小限の実装

```rust
pub struct User {
    pub name: String,
    pub email: String,
}

impl User {
    pub fn new(name: String, email: String) -> Self {
        User { name, email }
    }
}
```

実行結果:
```bash
$ cargo test
test test_user_creation_with_valid_data ... ok
```

### Refactor フェーズ: コードを改善

```rust
pub struct User {
    name: String,  // private に変更
    email: String,
}

impl User {
    pub fn new(name: String, email: String) -> Self {
        User { name, email }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn email(&self) -> &str {
        &self.email
    }
}

#[test]
fn test_user_getters() {
    let user = User::new("Alice".into(), "alice@example.com".into());
    assert_eq!(user.name(), "Alice");
    assert_eq!(user.email(), "alice@example.com");
}
```

## テストフレームワーク統合

### rstest - パラメータ化テストおよびフィクスチャ

```rust
use rstest::rstest;

#[rstest]
#[case("valid@example.com", true)]
#[case("invalid-email", false)]
#[case("", false)]
fn test_email_validation(#[case] email: &str, #[case] expected: bool) {
    assert_eq!(is_valid_email(email), expected);
}
```

### proptest - プロパティベーステスト

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_reverse_twice_is_identity(s in ".*") {
        let reversed_twice = reverse(&reverse(&s));
        prop_assert_eq!(s, reversed_twice);
    }
}
```

### mockall - モック生成

```rust
use mockall::predicate::*;
use mockall::mock;

mock! {
    DatabaseClient {
        pub fn get_user(&mut self, id: u32) -> Option<User>;
    }
}

#[test]
fn test_user_service_with_mock() {
    let mut mock_db = MockDatabaseClient::new();
    mock_db
        .expect_get_user()
        .with(eq(1))
        .times(1)
        .returning(|_| Some(User::new("Alice".into(), "alice@example.com".into())));
    
    let service = UserService::new(mock_db);
    assert!(service.find_user(1).is_some());
}
```

## セッション例

````text
ユーザー: /rust-test

エージェント:
# Rust TDD サイクルレポート

## フェーズ 1: Red - 失敗するテスト

テスト を書く:
```rust
#[test]
fn test_calculate_total_price() {
    let items = vec![
        CartItem { price: 10.0, qty: 2 },
        CartItem { price: 5.0, qty: 3 },
    ];
    let total = calculate_total(&items);
    assert_eq!(total, 35.0);
}
```

実行:
```bash
$ cargo test
error[E0425]: cannot find function `calculate_total`
```

## フェーズ 2: Green - 実装

関数 を追加:
```rust
pub fn calculate_total(items: &[CartItem]) -> f64 {
    items.iter().map(|item| item.price * item.qty as f64).sum()
}
```

実行:
```bash
$ cargo test
test test_calculate_total_price ... ok
```

## フェーズ 3: Refactor - 改善

構造 を明確に:
```rust
pub fn calculate_total(items: &[CartItem]) -> f64 {
    items.iter()
        .map(|item| item.subtotal())
        .sum()
}

impl CartItem {
    pub fn subtotal(&self) -> f64 {
        self.price * self.qty as f64
    }
}
```

テスト 再実行:
```bash
$ cargo test
test test_calculate_total_price ... ok
```

## パラメータ化テスト（rstest）

```rust
#[rstest]
#[case(vec![], 0.0)]
#[case(vec![CartItem { price: 10.0, qty: 1 }], 10.0)]
#[case(vec![CartItem { price: 10.0, qty: 2 }], 20.0)]
fn test_calculate_total_parametrized(
    #[case] items: Vec<CartItem>,
    #[case] expected: f64,
) {
    assert_eq!(calculate_total(&items), expected);
}
```

## テスト結果

```bash
$ cargo test
running 4 tests

test test_calculate_total_price ... ok
test test_calculate_total_parametrized[case0] ... ok
test test_calculate_total_parametrized[case1] ... ok
test test_calculate_total_parametrized[case2] ... ok

test result: ok. 4 passed; 0 failed; 0 ignored
```

## サマリー

| メトリック | 値 |
|-----------|-----|
| 新規テスト | 4 |
| パス | 4 |
| 失敗 | 0 |
| スキップ | 0 |
````

## 承認基準

| ステータス | 条件 |
|-----------|------|
| 承認 | すべてのテストがパス |
| リビジョン | テスト失敗あり |
| リファクタリング中 | 機能の再構成中だがすべてのテストがパス |

## 関連コマンド

- `/rust-build` - ビルドエラーを修正
- `/rust-review` - コード品質をレビュー
- `verification-loop` スキル — フル検証ループ

## 関連

- エージェント: `agents/rust-test-enforcer.md`
- スキル: `skills/rust-testing/`, `skills/rust-patterns/`
