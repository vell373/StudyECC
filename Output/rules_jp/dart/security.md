---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/AndroidManifest.xml"
  - "**/Info.plist"
---
# Dart/Flutter セキュリティ

> このファイルは [common/security.md](../common/security.md) を Dart、Flutter、およびモバイル固有のコンテンツで拡張します。

## シークレット管理

- Dart ソースに API キー、トークン、認証情報をハードコード化しない
- コンパイル時設定に `--dart-define` または `--dart-define-from-file` を使用（値は本当のシークレット ではありません — サーバー側シークレットにはバックエンドプロキシを使用）
- `flutter_dotenv` または同等を使用し、`.env` ファイルを `.gitignore` にリスト化
- ランタイムシークレットをプラットフォーム統合ストレージに保存: `flutter_secure_storage`（iOS の Keychain、Android の EncryptedSharedPreferences）

```dart
// BAD
const apiKey = 'sk-abc123...';

// GOOD — コンパイル時設定（シークレットではなく、構成可能）
const apiKey = String.fromEnvironment('API_KEY');

// GOOD — セキュアストレージからのランタイムシークレット
final token = await secureStorage.read(key: 'auth_token');
```

## ネットワークセキュリティ

- HTTPS を強制 — 本番環境で `http://` コールなし
- Android `network_security_config.xml` を設定して、クリアテキストトラフィックをブロック
- `Info.plist` で `NSAppTransportSecurity` を設定して、任意の読み込みを許可しない
- すべての HTTP クライアントでリクエストタイムアウトを設定 — デフォルトのままにしない
- 高セキュリティエンドポイント用に証明書ピンニングを検討

```dart
// タイムアウトと HTTPS 強制付き Dio
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 30),
));
```

## 入力検証

- API またはストレージに送信する前に、すべてのユーザー入力を検証およびサニタイズ
- SQL クエリに非サニタイズ入力を渡さない — パラメータ化されたクエリを使用（sqflite、drift）
- ナビゲーション前に深いリンク URL をサニタイズ — スキーム、ホスト、パスパラメータを検証
- ナビゲーション前に `Uri.tryParse` を使用し、検証

```dart
// BAD — SQL インジェクション
await db.rawQuery("SELECT * FROM users WHERE email = '$userInput'");

// GOOD — パラメータ化
await db.query('users', where: 'email = ?', whereArgs: [userInput]);

// BAD — 検証されていない深いリンク
final uri = Uri.parse(incomingLink);
context.go(uri.path); // 任意のルートにナビゲートできます

// GOOD — 検証された深いリンク
final uri = Uri.tryParse(incomingLink);
if (uri != null && uri.host == 'myapp.com' && _allowedPaths.contains(uri.path)) {
  context.go(uri.path);
}
```

## データ保護

- トークン、PII、認証情報を `flutter_secure_storage` にのみ保存
- `SharedPreferences` またはローカルファイルにプレーンテキストで機密データを書き込まない
- ログアウト時に認証状態をクリア: トークン、キャッシュされたユーザーデータ、クッキー
- 機密操作に生体認証（`local_auth`）を使用
- 機密データのログを避ける — `print(token)` または `debugPrint(password)` なし

## Android 固有
