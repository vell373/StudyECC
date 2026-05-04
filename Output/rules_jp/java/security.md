---
paths:
  - "**/*.java"
---
# Java セキュリティ

> このファイルは [common/security.md](../common/security.md) を Java 固有のコンテンツで拡張します。

## シークレット管理

- ソースコードに API キー、トークン、認証情報をハードコード化しない
- 環境変数を使用: `System.getenv("API_KEY")`
- 本番環境シークレット用にシークレットマネージャーを使用（Vault、AWS Secrets Manager）
- シークレット付きローカル設定ファイルを `.gitignore` に保持

```java
// BAD
private static final String API_KEY = "sk-abc123...";

// GOOD — 環境変数
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY must be set");
```

## SQL インジェクション防止

- パラメータ化されたクエリを常に使用 — ユーザー入力を SQL に連結しない
- `PreparedStatement` またはフレームワークのパラメータ化されたクエリ API を使用
- ネイティブクエリで使用される入力を検証およびサニタイズ

```java
// BAD — SQL インジェクション（文字列連結）
Statement stmt = conn.createStatement();
String sql = "SELECT * FROM orders WHERE name = '" + name + "'";
stmt.executeQuery(sql);

// GOOD — PreparedStatement（パラメータ化されたクエリ）
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE name = ?");
ps.setString(1, name);

// GOOD — JDBC テンプレート
jdbcTemplate.query("SELECT * FROM orders WHERE name = ?", mapper, name);
```

## 入力検証

- 処理前にシステム境界ですべてのユーザー入力を検証
- Bean Validation（`@NotNull`、`@NotBlank`、`@Size`）を検証フレームワーク使用時に DTO で使用
- ファイルパスと ユーザー提供文字列をサニタイズ（使用前）
- 検証が失敗した入力を明確なエラーメッセージで拒否

```java
// プレーン Java で手動検証
public Order createOrder(String customerName, BigDecimal amount) {
    if (customerName == null || customerName.isBlank()) {
        throw new IllegalArgumentException("Customer name is required");
    }
    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException("Amount must be positive");
    }
    return new Order(customerName, amount);
}
```

## 認証と認可

- カスタム認証暗号を実装しない — 確立されたライブラリを使用
- bcrypt または Argon2 でパスワードを保存、MD5/SHA1 では保存しない
- サービス境界で認可チェックを強制
- ログから機密データをクリア — パスワード、トークン、PII をログに記録しない

## 依存性セキュリティ

- `mvn dependency:tree` または `./gradlew dependencies` を実行して推移的な依存関係を監査
- OWASP Dependency-Check または Snyk を使用して既知の CVE をスキャン
- 依存関係を更新した状態に保つ — Dependabot または Renovate をセットアップ

## エラーメッセージ

- API レスポンスでスタックトレース、内部パス、SQL エラーを公開しない
