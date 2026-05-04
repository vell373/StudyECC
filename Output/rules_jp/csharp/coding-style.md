---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C# コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を C# 固有のコンテンツで拡張します。

## 標準

- 現在の .NET 規則に従い、null 許容参照型を有効化
- 公開 API と内部 API に明示的なアクセス修飾子を使用
- ファイルを定義する主要な型と一致させる

## 型とモデル

- 不変値型モデルには `record` または `record struct` を優先
- ID とライフサイクルを持つエンティティまたは型には `class` を使用
- サービス境界と抽象化には `interface` を使用
- アプリケーションコードで `dynamic` を避ける; ジェネリクスまたは明示的なモデルを優先

```csharp
public sealed record UserDto(Guid Id, string Email);

public interface IUserRepository
{
    Task<UserDto?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
}
```

## イミュータビリティ

- 共有状態には `init` セッター、コンストラクタパラメータ、不変コレクションを優先
- 更新状態を生成する際は入力モデルを就地で変更しない

```csharp
public sealed record UserProfile(string Name, string Email);

public static UserProfile Rename(UserProfile profile, string name) =>
    profile with { Name = name };
```

## 非同期とエラーハンドリング

- `.Result` や `.Wait()` のようなブロッキングコール上で `async`/`await` を優先
- パブリック非同期 API を通じて `CancellationToken` を渡す
- 特定の例外をスロー し、構造化プロパティでログを記録

```csharp
public async Task<Order> LoadOrderAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    try
    {
        return await repository.FindAsync(orderId, cancellationToken)
            ?? throw new InvalidOperationException($"Order {orderId} was not found.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to load order {OrderId}", orderId);
        throw;
    }
}
```

## フォーマット

- フォーマットとアナライザー修正に `dotnet format` を使用
- `using` ディレクティブを整理し、未使用のインポートを削除
- 式の本体メンバーは読みやすく保つ場合のみを優先
