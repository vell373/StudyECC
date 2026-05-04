---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C# パターン

> このファイルは [common/patterns.md](../common/patterns.md) を C# 固有のコンテンツで拡張します。

## API レスポンスパターン

```csharp
public sealed record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Error = null,
    object? Meta = null);
```

## リポジトリパターン

```csharp
public interface IRepository<T>
{
    Task<IReadOnlyList<T>> FindAllAsync(CancellationToken cancellationToken);
    Task<T?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<T> CreateAsync(T entity, CancellationToken cancellationToken);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
```

## オプションパターン

設定の強型オプションを使用し、コードベース全体で生の文字列を読み取る代わりに使用します。

```csharp
public sealed class PaymentsOptions
{
    public const string SectionName = "Payments";
    public required string BaseUrl { get; init; }
    public required string ApiKeySecretName { get; init; }
}
```

## 依存性注入

- サービス境界でインターフェースに依存
- コンストラクタを焦点を絞る; サービスが多くの依存関係を必要とする場合は責務を分割
- ライフタイムを意図的に登録: シングルトンはステートレス/共有サービス、スコープはリクエストデータ、トランジエントは軽量純粋なワーカー
