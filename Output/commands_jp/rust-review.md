---
description: "所有権、ライフタイム、エラーハンドリング、unsafe の使用、idiom パターンに関する包括的な Rust コードレビュー。rust-reviewer エージェントを呼び出します。"
---

# Rust コードレビュー

このコマンドは **rust-reviewer** エージェントを呼び出して、Rust 固有のコードレビューを包括的に実行します。

## このコマンドの機能

1. **自動チェックを検証**: `cargo check`、`cargo clippy -- -D warnings`、`cargo fmt --check`、`cargo test` を実行し、失敗時は停止
2. **Rust 変更を特定**: `git diff HEAD~1` 経由で修正された `.rs` ファイルを検出（PR の場合は `git diff main...HEAD`）
3. **セキュリティ監査を実行**: 利用可能な場合 `cargo audit` を実行
4. **セキュリティスキャン**: unsafe の使用、コマンドインジェクション、ハードコードされたシークレットをチェック
5. **所有権レビュー**: 不要なクローン、ライフタイムの問題、借用パターンを解析
6. **レポートを生成**: 重大度別に問題を分類

## 使用時

以下の場合に `/rust-review` を使用:
- Rust コードの作成・修正後
- Rust 変更をコミットする前
- Rust コードを含むプルリクエストをレビュー
- 新しい Rust コードベースにオンボーディング
- Rust idiom パターンを学ぶ

## レビュー カテゴリ

### CRITICAL（必ず修正）
- 本番環境のコードパスでの未チェック `unwrap()`/`expect()`
- `// SAFETY:` コメントなしの `unsafe` — 不変条件を文書化
- クエリ内の文字列補間経由 SQL インジェクション
- `std::process::Command` の未検証入力経由のコマンドインジェクション
- ハードコードされたクレデンシャル
- raw ポインタ経由の use-after-free

### HIGH（修正すべき）
- 借用チェッカーを満たすための不要な `.clone()`
- `&str` または `impl AsRef<str>` で十分な箇所での `String` パラメータ
- 非同期コンテキストでのブロッキング（`std::thread::sleep`, `std::fs`）
- 共有型での欠落 `Send`/`Sync` バウンド
- ビジネス上重要な enum での ワイルドカード `_ =>` マッチ
- 大きな関数（> 50 行）

### MEDIUM（検討）
- ホットパス内での不要なアロケーション
- サイズが既知の場合の欠落 `with_capacity`
- 正当化のない抑制 clippy 警告
- `///` ドキュメントなしの公開 API
- 値を無視する可能性がある non-`must_use` 戻り値型で `#[must_use]` を検討

## 実行される自動チェック

```bash
# ビルドゲート（レビュー前に成功する必要がある）
cargo check

# Lint と提案
cargo clippy -- -D warnings

# フォーマット
cargo fmt --check

# テスト
cargo test

# セキュリティ監査（利用可能な場合）
if command -v cargo-audit >/dev/null; then cargo audit; else echo "cargo-audit がインストールされていません"; fi
```

## 使用例

````text
ユーザー: /rust-review

エージェント:
# Rust コードレビューレポート

## レビュー対象ファイル
- src/service/user.rs（修正）
- src/handler/api.rs（修正）

## 静的解析結果
- ビルド: 成功
- Clippy: 警告なし
- フォーマット: 成功
- テスト: すべて成功

## 検出された問題

[CRITICAL] 本番環境パスでのチェックなし unwrap
ファイル: src/service/user.rs:28
問題: データベースクエリ結果の `.unwrap()` を使用
```rust
let user = db.find_by_id(id).unwrap();  // ユーザーがいない場合 panic
```
修正: エラーを context で伝播
```rust
let user = db.find_by_id(id)
    .context("failed to fetch user")?;
```

[HIGH] 不要なクローン
ファイル: src/handler/api.rs:45
問題: 借用チェッカーを満たすために String をクローン
```rust
let name = user.name.clone();
process(&user, &name);
```
修正: クローンを避けるよう再構成
```rust
let result = process_name(&user.name);
use_user(&user, result);
```

## サマリー
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨: CRITICAL 問題が修正されるまで merge をブロック
````

## 承認基準

| ステータス | 条件 |
|-----------|------|
| 承認 | CRITICAL または HIGH の問題なし |
| 警告 | MEDIUM 問題のみ（注意してマージ） |
| ブロック | CRITICAL または HIGH の問題が見つかった |

## 他のコマンドとの統合

- `/rust-test` を最初に使用してテストが成功することを確認
- ビルドエラーが発生した場合は `/rust-build` を使用
- コミット前に `/rust-review` を使用
- Rust 以外の問題については `/code-review` を使用

## 関連

- エージェント: `agents/rust-reviewer.md`
- スキル: `skills/rust-patterns/`, `skills/rust-testing/`
