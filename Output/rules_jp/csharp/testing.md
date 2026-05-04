---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
---
# C# テスト

> このファイルは [common/testing.md](../common/testing.md) を C# 固有のコンテンツで拡張します。

## テストフレームワーク

- ユニットテストと統合テストに **xUnit** を優先
- 読みやすいアサーションに **FluentAssertions** を使用
- 依存関係のモック化に **Moq** または **NSubstitute** を使用
- 統合テストが実際のインフラストラクチャを必要とする場合に **Testcontainers** を使用

## テスト構成

- `src/` 構造を `tests/` の下で反映
- ユニット、統合、エンドツーエンド カバレッジを明確に分離
- 実装の詳細ではなく、動作でテストに名前を付ける

```csharp
public sealed class OrderServiceTests
{
    [Fact]
    public async Task FindByIdAsync_ReturnsOrder_WhenOrderExists()
    {
        // Arrange
        // Act
        // Assert
    }
}
```

## ASP.NET Core 統合テスト

- API 統合カバレッジに `WebApplicationFactory<TEntryPoint>` を使用
- ミドルウェアをバイパスするのではなく、HTTP を通じて認証、検証、シリアル化をテスト

## カバレッジ

- 80% 以上のライン カバレッジを目指す
- ドメイン ロジック、検証、認証、失敗パスにカバレッジを焦点化
- カバレッジ収集が有効な場所で CI で `dotnet test` を実行
