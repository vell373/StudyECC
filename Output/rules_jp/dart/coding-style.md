---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Dart/Flutter コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Dart および Flutter 固有のコンテンツで拡張します。

## フォーマット

- すべての `.dart` ファイルに **dart format** を使用 — CI で強制（`dart format --set-exit-if-changed .`）
- 行長: 80 文字（dart format デフォルト）
- マルチラインの引数/パラメータリストの末尾にカンマを付けて、差分とフォーマットを改善

## イミュータビリティ

- ローカル変数に `final` を、コンパイル時定数に `const` を優先
- すべてのフィールドが `final` の場合は `const` コンストラクタを使用
- パブリック API から不変コレクションを返す（`List.unmodifiable`、`Map.unmodifiable`）
- 不変状態クラスの状態ミューテーションに `copyWith()` を使用

```dart
// BAD
var count = 0;
List<String> items = ['a', 'b'];

// GOOD
final count = 0;
const items = ['a', 'b'];
```

## 命名

Dart 規則に従う:
- 変数、パラメータ、名前付きコンストラクタに `camelCase`
- クラス、列挙型、型定義、拡張機能に `PascalCase`
- ファイル名とライブラリ名に `snake_case`
- トップレベルで `const` で宣言された定数に `SCREAMING_SNAKE_CASE`
- プライベートメンバーに `_` プレフィックスを付ける
- 拡張機能名は拡張機能の型を説明: `StringExtensions`、`MyHelpers` ではなく

## Null セーフティ

- `!`（バング演算子）を避ける — `?.`、`??`、`if (x != null)`、または Dart 3 パターンマッチングを優先; `!` は null 値がプログラミングエラーの場合のみ予約
- `late` を避ける — 初期化が最初の使用前に保証される場合を除く（null 許容または コンストラクタ初期化を優先）
- 常に提供する必要があるコンストラクタパラメータに `required` を使用

```dart
// BAD — ユーザーが null の場合は実行時にクラッシュ
final name = user!.name;

// GOOD — null 対応演算子
final name = user?.name ?? 'Unknown';

// GOOD — Dart 3 パターンマッチング（網羅的、コンパイラチェック）
final name = switch (user) {
  User(:final name) => name,
  null => 'Unknown',
};

// GOOD — 早期リターン null ガード
String getUserName(User? user) {
  if (user == null) return 'Unknown';
  return user.name; // ガード後に null 許容でない状態に昇格
}
```

## シール型とパターンマッチング（Dart 3+）

シール型クラスを使用して、閉じた状態階層をモデル化:

```dart
sealed class AsyncState<T> {
  const AsyncState();
}

final class Loading<T> extends AsyncState<T> {
  const Loading();
```
