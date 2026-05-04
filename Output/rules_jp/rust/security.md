---
paths:
  - "**/*.rs"
---
# Rust セキュリティ

> このファイルは [common/security.md](../common/security.md) を Rust 固有のコンテンツで拡張します。

## シークレット管理

- ソースコードに API キー、トークン、認証情報をハードコード化しない
- 環境変数を使用: `std::env::var("API_KEY")`
- 起動時にシークレット欠落時の高速失敗
- `.env` ファイルを `.gitignore` に保持

```rust
// BAD
const API_KEY: &str = "sk-abc123...";

// GOOD — 早期検証を持つ環境変数
fn load_api_key() -> anyhow::Result<String> {
    std::env::var("PAYMENT_API_KEY")
        .context("PAYMENT_API_KEY must be set")
}
```

## SQL インジェクション防止

- 常にパラメータ化クエリを使用 — ユーザー入力を SQL 文字列にフォーマットしない
- クエリビルダーまたは ORM（sqlx、diesel、sea-orm）をバインドパラメータで使用

```rust
// BAD — フォーマット文字列経由の SQL インジェクション
let query = format!("SELECT * FROM users WHERE name = '{name}'");
sqlx::query(&query).fetch_one(&pool).await?;

// GOOD — sqlx でパラメータ化クエリ
// プレースホルダー構文はバックエンド別: Postgres: $1  |  MySQL: ?  |  SQLite: $1
sqlx::query("SELECT * FROM users WHERE name = $1")
    .bind(&name)
    .fetch_one(&pool)
    .await?;
```

## 入力検証

- 処理前にシステム境界ですべてのユーザー入力を検証
- 型システムを使用して不変式を強制（newtype パターン）
- 検証ではなく解析 — 境界で非構造データを型指定構造体に変換
- 無効な入力を明確なエラーメッセージで拒否

```rust
// 解析、検証ではない — 無効な状態は表現不可能
pub struct Email(String);

impl Email {
    pub fn parse(input: &str) -> Result<Self, ValidationError> {
        let trimmed = input.trim();
        let at_pos = trimmed.find('@')
            .filter(|&p| p > 0 && p < trimmed.len() - 1)
            .ok_or_else(|| ValidationError::InvalidEmail(input.to_string()))?;
        let domain = &trimmed[at_pos + 1..];
        if trimmed.len() > 254 || !domain.contains('.') {
            return Err(ValidationError::InvalidEmail(input.to_string()));
        }
        // 本番環境では検証されたメールクレート（例: `email_address`）を優先
        Ok(Self(trimmed.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

## 不安全コード

- `unsafe` ブロックを最小化 — 安全な抽象化を優先
- すべての `unsafe` ブロックに `// SAFETY:` コメントが必須で不変式を説明
- 便利さのために借用チェッカーをバイパスする `unsafe` を使用しない
- レビュー中にすべての `unsafe` コードを監査 — 正当化がなければレッドフラグ
- C ライブラリの周囲に安全な FFI ラッパーを優先

```rust
// GOOD — セーフティコメントがすべての必須不変式を文書化
let widget: &Widget = {
    // SAFETY: `ptr` はノン null、整列済み、初期化 Widget を指し、
    // そのライフタイム中 mutable 参照や変更は存在しない。
    unsafe { &*ptr }
};

// BAD — セーフティ正当化がない
unsafe { &*ptr }
```

## 依存性セキュリティ

- `cargo audit` を実行して依存関係の既知 CVE をスキャン
- `cargo deny check` でライセンスと勧告コンプライアンスをチェック
- `cargo tree` で推移的依存関係を監査
- 依存関係を更新した状態に保つ — Dependabot または Renovate をセットアップ
- 依存関係カウントを最小化 — 新規クレート追加前に評価

```bash
# セキュリティ監査
cargo audit

# 勧告、重複バージョン、制限ライセンスを拒否
cargo deny check

# 依存関係ツリーを検査
cargo tree
cargo tree -d  # 重複のみを表示
```

## エラーメッセージ

- API レスポンスで内部パス、スタックトレース、データベースエラーを決して公開しない
- 詳細エラーを サーバー側でログ；クライアントに汎用メッセージを返す
- サーバー側ロギングに `tracing` または `log` を使用

```rust
// エラーを適切なステータスコードと汎用メッセージにマップ
// （例は axum を使用；フレームワークに合わせてレスポンス型を適応）
match order_service.find_by_id(id) {
    Ok(order) => Ok((StatusCode::OK, Json(order))),
    Err(ServiceError::NotFound(_)) => {
        tracing::info!(order_id = id, "order not found");
        Err((StatusCode::NOT_FOUND, "Resource not found"))
    }
    Err(e) => {
        tracing::error!(order_id = id, error = %e, "unexpected error");
        Err((StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"))
    }
}
```

## リファレンス

スキル `rust-patterns` で unsafe コードガイドラインと所有権パターンを参照。
スキル `security-review` で一般的なセキュリティチェックリストを参照。
