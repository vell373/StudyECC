---
description: "Rust ビルドエラー、借用チェッカーの問題、依存関係の問題を段階的に修正します。rust-build-resolver エージェントを呼び出します。"
---

# Rust ビルドと修正

このコマンドは **rust-build-resolver** エージェントを呼び出して、Rust ビルドエラーを最小限の変更で段階的に修正します。

## このコマンドの機能

1. **診断を実行**: `cargo check`、`cargo clippy`、`cargo fmt --check` を実行
2. **エラーを解析**: エラーコードと影響されたファイルを特定
3. **段階的に修正**: 一度に1つのエラー
4. **各修正を検証**: 各変更後に `cargo check` を再実行
5. **サマリーをレポート**: 修正されたもの、残っているものを表示

## 使用時

以下の場合に `/rust-build` を使用:
- `cargo build` または `cargo check` でエラーが失敗
- `cargo clippy` が警告をレポート
- 借用チェッカーまたはライフタイム エラーがコンパイルをブロック
- Cargo 依存関係の解決が失敗
- 変更をプルしたことでビルドが破損した後

## 実行される診断コマンド

```bash
# プライマリビルドチェック
cargo check 2>&1

# Lint と提案
cargo clippy -- -D warnings 2>&1

# フォーマットチェック
cargo fmt --check 2>&1

# 依存関係の問題
cargo tree --duplicates

# セキュリティ監査（利用可能な場合）
if command -v cargo-audit >/dev/null; then cargo audit; else echo "cargo-audit がインストールされていません"; fi
```

## セッション例

````text
ユーザー: /rust-build

エージェント:
# Rust ビルド解決

## 初期診断

```bash
$ cargo check
error[E0502]: cannot borrow `map` as mutable because it is also borrowed as immutable
  --> src/service/cache.rs:25:5
error[E0308]: mismatched types
  --> src/handler/api.rs:42:12
error[E0425]: cannot find value `db` in this scope
  --> src/handler/api.rs:58:9
```

検出エラー数: 3

## 修正1: 借用チェッカーエラー

ファイル: src/service/cache.rs:25
エラー: E0502 — `map` は不可変借用がアクティブなため可変借用できない
原因: 可変挿入の前に不可変借用がアクティブなまま

```rust
// 変更: 可変アクセスの前に不可変借用を終了するよう再構成
if !map.contains_key("key") {
    map.insert("key".into(), default);
}
```

```bash
$ cargo check
# 2 個のエラーが残っている
```

## 修正2: 型の不一致

ファイル: src/handler/api.rs:42
エラー: E0308 — 型の不一致: `usize` を想定、`&str` を取得

```rust
// 変更
let count = params.get("count");
// 次へ
let count: usize = params.get("count")
    .and_then(|s| s.parse().ok())
    .unwrap_or(0);
```

```bash
$ cargo check
# 1 個のエラーが残っている
```

## 修正3: 未解決名

ファイル: src/handler/api.rs:58
エラー: E0425 — スコープ内に値 `db` が見つからない
原因: インポート欠落

```rust
// 追加
use crate::db;
```

```bash
$ cargo check
# ビルド成功!
```

## 最終検証

```bash
$ cargo clippy -- -D warnings
# 警告なし

$ cargo test
6 個のテストを実行
test service::cache::tests::test_insert ... ok
test service::cache::tests::test_get ... ok
test handler::api::tests::test_parse_count ... ok
test handler::api::tests::test_missing_count ... ok
test handler::api::tests::test_db_import ... ok
test handler::api::tests::test_response ... ok

テスト結果: ok. 6 個成功; 0 個失敗; 0 個無視
```

## サマリー

| メトリック | カウント |
|-----------|---------|
| 修正されたビルドエラー | 3 |
| 修正された Clippy 警告 | 0 |
| 修正されたファイル | 2 |
| 残りの問題 | 0 |

ビルド状況: 成功
````

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|--------|-----------|
| `cannot borrow as mutable` | 不可変借用を最初に終了するよう再構成; 正当な場合のみクローン |
| `does not live long enough` | 所有型を使用またはライフタイム注釈を追加 |
| `cannot move out of` | 所有権を取得するよう再構成; 最後の手段としてのみクローン |
| `mismatched types` | `.into()`、`as`、または明示的な変換を追加 |
| `trait X not implemented` | `#[derive(Trait)]` を追加または手動で実装 |
| `unresolved import` | Cargo.toml に追加または `use` パスを修正 |
| `cannot find value` | インポートを追加またはパスを修正 |

## 修正戦略

1. **ビルドエラーを最初に** - コードはコンパイルする必要がある
2. **Clippy 警告を2番目に** - 疑わしい構成を修正
3. **フォーマットを3番目に** - `cargo fmt` コンプライアンス
4. **一度に1つの修正** — 各変更を検証
5. **最小限の変更** — リファクタリングではなく、修正のみ

## 停止条件

エージェントは以下の場合に停止してレポート:
- 3 回の試行後も同じエラーが持続する
- 修正によりさらに多くのエラーが導入される
- アーキテクチャ上の変更が必要
- 借用チェッカーエラーがデータ所有権の再設計を必要とする

## 関連コマンド

- `/rust-test` - ビルド成功後にテストを実行
- `/rust-review` - コード品質をレビュー
- `verification-loop` スキル — フル検証ループ

## 関連

- エージェント: `agents/rust-build-resolver.md`
- スキル: `skills/rust-patterns/`, `skills/rust-testing/`
