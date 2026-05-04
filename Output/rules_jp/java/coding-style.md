---
paths:
  - "**/*.java"
---
# Java コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Java 固有のコンテンツで拡張します。

## フォーマット

- **google-java-format** または **Checkstyle**（Google または Sun スタイル）で強制
- 1 つのパブリックトップレベル型はファイルごと
- 一貫したインデント: 2 または 4 スペース（プロジェクト標準に合わせる）
- メンバー順序: 定数、フィールド、コンストラクタ、パブリックメソッド、プロテクト、プライベート

## イミュータビリティ

- 値型に `record` を優先（Java 16+）
- デフォルトでフィールドを `final` にマーク — ミューテーション状態が必要な場合のみ使用
- パブリック API から防御的なコピーを返す: `List.copyOf()`、`Map.copyOf()`、`Set.copyOf()`
- コピーオンライト: 既存のものを変更するのではなく、新しいインスタンスを返す

```java
// GOOD — 不変値型
public record OrderSummary(Long id, String customerName, BigDecimal total) {}

// GOOD — 最終フィールド、セッターなし
public class Order {
    private final Long id;
    private final List<LineItem> items;

    public List<LineItem> getItems() {
        return List.copyOf(items);
    }
}
```

## 命名

標準 Java 規則に従う:
- クラス、インターフェース、レコード、列挙型に `PascalCase`
- メソッド、フィールド、パラメータ、ローカル変数に `camelCase`
- `static final` 定数に `SCREAMING_SNAKE_CASE`
- パッケージ: すべて小文字、逆ドメイン（`com.example.app.service`）

## モダン Java フィーチャー

明確性を改善するモダンな言語フィーチャーを使用:
- DTO と値型に **Records**（Java 16+）
- 閉じた型階層に **Sealed classes**（Java 17+）
- `instanceof` でのパターンマッチング — 明示的なキャスト なし（Java 16+）
- マルチラインの文字列に **Text blocks** — SQL、JSON テンプレート（Java 15+）
- アロー構文による **Switch expressions**（Java 14+）
- **パターンマッチング in switch** — 網羅的なシール型処理（Java 21+）

```java
// パターンマッチング instanceof
if (shape instanceof Circle c) {
    return Math.PI * c.radius() * c.radius();
}

// シール型階層
public sealed interface PaymentMethod permits CreditCard, BankTransfer, Wallet {}

// Switch 式
String label = switch (status) {
    case ACTIVE -> "Active";
    case SUSPENDED -> "Suspended";
    case CLOSED -> "Closed";
};
```

## Optional 使用法

- 結果がない可能性のある ファインダーメソッドから `Optional<T>` を返す
- `map()`、`flatMap()`、`orElseThrow()` を使用 — `isPresent()` なしで `get()` を呼び出さない
- `Optional` をフィールド型またはメソッドパラメータとして使用しない

```java
// GOOD
```
