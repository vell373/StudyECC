---
paths:
  - "**/*.rs"
---
# Rust コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Rust 固有のコンテンツで拡張します。

## フォーマット

- **rustfmt** で強制 — コミット前に常に `cargo fmt` を実行
- **clippy** リント — `cargo clippy -- -D warnings`（警告をエラーとして扱う）
- 4 スペースインデント（rustfmt デフォルト）
- 最大行幅: 100 文字（rustfmt デフォルト）

## イミュータビリティ

Rust 変数はデフォルトで不変 — これを受け入れる:

- デフォルトで `let` を使用；変更が必要な場合のみ `let mut` を使用
- インプレース変更より新しい値を返すことを優先
- 関数がメモリ割り当てが必要かどうか分からない場合は `Cow<'_, T>` を使用

```rust
use std::borrow::Cow;

// GOOD — デフォルト不変、新しい値を返す
fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))
    } else {
        Cow::Borrowed(input)
    }
}

// BAD — 不必要な変更
fn normalize_bad(input: &mut String) {
    *input = input.replace(' ', "_");
}
```

## 命名

標準 Rust 規約に従う:
- 関数、メソッド、変数、モジュール、クレートに `snake_case`
- 型、トレイト、列挙型、型パラメータに `PascalCase`（UpperCamelCase）
- 定数と static に `SCREAMING_SNAKE_CASE`
- ライフタイム: 短い小文字（`'a`、`'de`）— 複雑なケースに説明的名前（`'input`）

## 所有権と借用

- デフォルトで借用（`&T`）；所有権が必要な場合のみ取得
- 根本原因を理解せず借用チェッカーを満たすためにクローンしない
- 関数パラメータで `String` より `&str`、`Vec<T>` より `&[T]` を受け入れ
- `String` を所有する必要があるコンストラクタに `impl Into<String>` を使用

```rust
// GOOD — 所有権が不要な場合は借用
fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

// GOOD — コンストラクタで Into 経由で所有権を取得
fn new(name: impl Into<String>) -> Self {
    Self { name: name.into() }
}

// BAD — &str で十分な場合 String を取得
fn word_count_bad(text: String) -> usize {
    text.split_whitespace().count()
}
```

## エラーハンドリング

- `Result<T, E>` と `?` を使用して伝播 — 本番コードで `unwrap()` を使用しない
- **ライブラリ**: `thiserror` で型エラーを定義
- **アプリケーション**: 柔軟なエラーコンテキストに `anyhow` を使用
- `.with_context(|| format!("failed to ..."))?` でコンテキストを追加
- テストと真に到達不可能な状態に `unwrap()` / `expect()` を予約

```rust
// GOOD — thiserror を持つライブラリエラー
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("failed to read config: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid config format: {0}")]
    Parse(String),
}

// GOOD — anyhow を持つアプリケーションエラー
use anyhow::Context;

fn load_config(path: &str) -> anyhow::Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read {path}"))?;
    toml::from_str(&content)
        .with_context(|| format!("failed to parse {path}"))
}
```

## イテレーター vs ループ

変換はイテレーターチェーンを優先；複雑な制御フローはループを使用:

```rust
// GOOD — 宣言的で構成可能
let active_emails: Vec<&str> = users.iter()
    .filter(|u| u.is_active)
    .map(|u| u.email.as_str())
    .collect();

// GOOD — 早期リターンを持つ複雑ロジック用ループ
for user in &users {
    if let Some(verified) = verify_email(&user.email)? {
        send_welcome(&verified)?;
    }
}
```

## モジュール組織

型ではなく、ドメインで整理:

```text
src/
├── main.rs
├── lib.rs
├── auth/           # ドメインモジュール
│   ├── mod.rs
│   ├── token.rs
│   └── middleware.rs
├── orders/         # ドメインモジュール
│   ├── mod.rs
│   ├── model.rs
│   └── service.rs
└── db/             # インフラストラクチャ
    ├── mod.rs
    └── pool.rs
```

## 可視性

- プライベートをデフォルト；内部共有に `pub(crate)` を使用
- クレート公開 API の一部である場合のみ `pub` マーク
- `lib.rs` から公開 API を再エクスポート

## リファレンス

スキル `rust-patterns` で包括的な Rust idiom とパターンを参照。
