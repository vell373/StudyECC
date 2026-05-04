---
description: Dart アナライザーのエラーと Flutter ビルドの失敗を段階的に修正する。最小限の外科的な修正のために dart-build-resolver エージェントを呼び出す。
---

# Flutter Build and Fix

このコマンドは **dart-build-resolver** エージェントを呼び出して、最小限の変更で Dart/Flutter のビルドエラーを段階的に修正する。

## このコマンドが行うこと

1. **診断を実行する**: `flutter analyze`、`flutter pub get` を実行する
2. **エラーを解析する**: ファイルでグループ化して重大度でソートする
3. **段階的に修正する**: 一度に 1 つのエラー
4. **各修正を検証する**: 各変更後に解析を再実行する
5. **サマリーを報告する**: 修正されたものと残っているものを表示する

## 使用する場面

`/flutter-build` を使用する場合:
- `flutter analyze` がエラーを報告する
- `flutter build` が任意のプラットフォームで失敗する
- `dart pub get` / `flutter pub get` がバージョンの競合で失敗する
- `build_runner` がコードの生成に失敗する
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# 解析
flutter analyze 2>&1

# 依存関係
flutter pub get 2>&1

# コード生成（プロジェクトが build_runner を使用している場合）
dart run build_runner build --delete-conflicting-outputs 2>&1

# プラットフォームビルド
flutter build apk 2>&1
flutter build web 2>&1
```

## セッション例

````text
User: /flutter-build

Agent:
# Flutter Build Resolution

## Initial Diagnostics

```
$ flutter analyze
Analyzing project...

  error • lib/features/user/data/user_repository_impl.dart:34:16 •
    A value of type 'String?' can't be assigned to a variable of type 'String'. •
    invalid_assignment

  error • lib/features/cart/presentation/cart_page.dart:58:5 •
    The method 'add' isn't defined for the type 'List<Item>'.
    Try correcting the name to the name of an existing method, or defining a method named 'add'. •
    undefined_method

2 errors found.
```

## Fix 1: Null Safety

File: lib/features/user/data/user_repository_impl.dart:34
Error: A value of type 'String?' can't be assigned to type 'String'

Changed:
```dart
final id = response.id;
```
To:
```dart
final id = response.id ?? '';
```

```
$ flutter analyze
1 error found.
```

## Fix 2: Immutable List

File: lib/features/cart/presentation/cart_page.dart:58
Error: The method 'add' isn't defined for the type 'List<Item>'
Cause: State holds an unmodifiable list; mutation goes through Cubit

Changed:
```dart
state.items.add(item);
```
To:
```dart
context.read<CartCubit>().addItem(item);
// Note: Cubit exposes named methods (addItem, removeItem);
// .add(event) is the BLoC event API — don't mix them.
```

```
$ flutter analyze
No issues found!
```

## Final Verification

```
$ flutter test
All tests passed.
```

## Summary

| Metric | Count |
|--------|-------|
| Analysis errors fixed | 2 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS ✓
````

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `A value of type 'X?' can't be assigned to 'X'` | `?? default` またはヌルガードを追加する |
| `The name 'X' isn't defined` | インポートを追加するかタイポを修正する |
| `Non-nullable instance field must be initialized` | 初期化子を追加するか `late` を使用する |
| `Version solving failed` | pubspec.yaml のバージョン制約を調整する |
| `Missing concrete implementation of 'X'` | 欠けているインターフェースメソッドを実装する |
| `build_runner: Part of X expected` | 古い `.g.dart` を削除して再ビルドする |

## 修正戦略

1. **解析エラーを最初に** — コードはエラーフリーでなければならない
2. **警告トリアージを次に** — ランタイムバグを引き起こす可能性がある警告を修正する
3. **pub の競合を三番目に** — 依存関係の解決を修正する
4. **一度に 1 つの修正** — 各変更を確認する
5. **最小限の変更** — リファクタリングせず、修正するだけ

## 停止条件

以下の場合、エージェントは停止して報告する:
- 同じエラーが 3 回試みた後も解決しない
- 修正がより多くのエラーを引き起こす
- アーキテクチャの変更が必要
- パッケージのアップグレードの競合にユーザーの判断が必要

## 関連コマンド

- `/flutter-test` — ビルドが成功した後にテストを実行する
- `/flutter-review` — コードの品質をレビューする
- `verification-loop` スキル — 完全な検証ループ

## 関連

- エージェント: `agents/dart-build-resolver.md`
- スキル: `skills/flutter-dart-code-review/`
