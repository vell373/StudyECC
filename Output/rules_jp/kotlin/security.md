---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Kotlin セキュリティ

> このファイルは [common/security.md](../common/security.md) を Kotlin および Android/KMP 固有のコンテンツで拡張します。

## シークレット管理

- API キー、トークン、認証情報をソースコードにハードコード化しない
- ローカル開発シークレットに `local.properties`（git 無視対象）を使用
- リリースビルド用 CI シークレットから生成される `BuildConfig` フィールドを使用
- ランタイムシークレット保存に `EncryptedSharedPreferences`（Android）または Keychain（iOS）を使用

```kotlin
// BAD
val apiKey = "sk-abc123..."

// GOOD — BuildConfig から（ビルド時に生成）
val apiKey = BuildConfig.API_KEY

// GOOD — ランタイムのセキュアストレージから
val token = secureStorage.get("auth_token")
```

## ネットワークセキュリティ

- HTTPS のみを使用 — `network_security_config.xml` で平文を禁止
- OkHttp `CertificatePinner` または Ktor 相当で機密エンドポイント用に証明書をピン留め
- すべての HTTP クライアントにタイムアウトを設定 — デフォルト（無限の場合あり）を使用しない
- サーバーレスポンスをすべて検証・サニタイズしてから使用

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```

## 入力検証

- ユーザー入力をすべて処理前に検証、API に送信前に検証
- Room/SQLDelight に正規化クエリを使用 — ユーザー入力を SQL に連結しない
- ユーザー入力からのファイルパスをサニタイズしてパストラバーサルを防止

```kotlin
// BAD — SQL インジェクション
@Query("SELECT * FROM items WHERE name = '$input'")

// GOOD — 正規化
@Query("SELECT * FROM items WHERE name = :input")
fun findByName(input: String): List<ItemEntity>
```

## データ保護

- Android の機密キーバリューデータに `EncryptedSharedPreferences` を使用
- 明示的フィールド名を持つ `@Serializable` を使用 — 内部プロパティ名を漏らさない
- 不要になった機密データをメモリからクリア
- シリアライズクラスに `@Keep` または ProGuard ルールを使用して名前マングリングを防止

## 認証

- トークンをセキュアストレージに保存、平文 SharedPreferences に保存しない
- 適切な 401/403 ハンドリングでトークンリフレッシュを実装
- ログアウト時にすべての認証状態をクリア（トークン、キャッシュユーザーデータ、Cookie）
- 機密操作に生体認証（`BiometricPrompt`）を使用

## ProGuard / R8

- すべてのシリアライズモデルキープルール（`@Serializable`、Gson、Moshi）
- リフレクション系ライブラリのキープルール（Koin、Retrofit）
- リリースビルドをテスト — オブスケーション（難読化）はシリアライゼーションを無声で破壊できます

## WebView セキュリティ

- JavaScript を無効化（明示的に必要でない限り）: `settings.javaScriptEnabled = false`
- WebView で読み込む前に URL を検証
- 機密データにアクセスする `@JavascriptInterface` メソッドを決して公開しない
- `WebViewClient.shouldOverrideUrlLoading()` でナビゲーション制御
