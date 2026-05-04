---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/appsettings*.json"
---
# C# セキュリティ

> このファイルは [common/security.md](../common/security.md) を C# 固有のコンテンツで拡張します。

## シークレット管理

- ソースコードに API キー、トークン、接続文字列をハードコード化しない
- 環境変数、ローカル開発用のユーザーシークレット、本番環境のシークレットマネージャーを使用
- `appsettings.*.json` を実際の認証情報から自由に保つ

```csharp
// BAD
const string ApiKey = "sk-live-123";

// GOOD
var apiKey = builder.Configuration["OpenAI:ApiKey"]
    ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");
```

## SQL インジェクション防止

- ADO.NET、Dapper、または EF Core でパラメータ化されたクエリを常に使用
- ユーザー入力を SQL 文字列に結合しない
- 動的クエリ合成を使用する前にソートフィールドとフィルタオペレータを検証

```csharp
const string sql = "SELECT * FROM Orders WHERE CustomerId = @customerId";
await connection.QueryAsync<Order>(sql, new { customerId });
```

## 入力検証

- アプリケーション境界で DTO を検証
- データアノテーション、FluentValidation、または明示的なガード句を使用
- ビジネスロジックを実行する前に無効なモデル状態を拒否

## 認証と認可

- カスタムトークン解析の代わりにフレームワーク認証ハンドラーを優先
- エンドポイントまたはハンドラー境界で認可ポリシーを強制
- 生のトークン、パスワード、PII をログに記録しない

## エラーハンドリング

- クライアント向けの安全なメッセージを返す
- サーバー側で詳細な例外を構造化されたコンテキストでログ
- API レスポンスでスタックトレース、SQL テキスト、またはファイルシステムパスを公開しない

## 参照

スキル: `security-review` を参照して、より広いアプリケーションセキュリティレビューチェックリストを確認してください。
