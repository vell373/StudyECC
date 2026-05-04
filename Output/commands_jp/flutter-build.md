---
description: Dart アナライザーエラーと Flutter ビルド失敗を段階的に修正します。最小限で外科的修正のために dart-build-resolver エージェントを呼び出します。
---

# Flutter ビルドと修正

このコマンドは、**dart-build-resolver** エージェントを呼び出して、最小限の変更で Dart/Flutter ビルドエラーを段階的に修正します。

## このコマンドが行うこと

1. **診断を実行**: `flutter analyze`、`flutter pub get` を実行
2. **エラーを解析**: ファイル別にグループ化し、重大度別にソート
3. **段階的に修正**: 一度に 1 つのエラー
4. **各修正を検証**: 各変更後に解析を再実行
5. **概要を報告**: 何が修正され、何が残っているかを表示

## いつ使うか

以下の場合に `/flutter-build` を使用：
- `flutter analyze` がエラーを報告
- `flutter build` がいかなるプラットフォームでも失敗
- `dart pub get` / `flutter pub get` がバージョン競合で失敗
- `build_runner` がコード生成に失敗
- 変更を pull した後でビルドが破損

## 実行される診断コマンド

```bash
# 解析
flutter analyze 2>&1

# 依存関係
flutter pub get 2>&1

# コード生成（プロジェクトが build_runner を使用する場合）
dart run build_runner build --delete-conflicting-outputs 2>&1

# プラットフォームビルド
flutter build apk 2>&1
flutter build web 2>&1
```

## セッション例

````text
ユーザー: /flutter-build

エージェント:
# Flutter ビルド解決

## 初期診断

```
$ flutter analyze
プロジェクトを解析しています...

  error • lib/features/user/data/user_repository_impl.dart:34:16 •
    型 'String?' の値を型 'String' の変数に割り当てることはできません。 •
    invalid_assignment

  error • lib/features/cart/presentation/cart_page.dart:58:5 •
    メソッド 'add' は型 'List<Item>' に対して定義されていません。
    名前を既存メソッドの名前に修正するか、'add' という名前のメソッドを定義してください。 •
    undefined_method

2 つのエラーが見つかりました。
```

## 修正 1: Null Safety

ファイル: lib/features/user/data/user_repository_impl.dart:34
エラー: 型 'String?' の値を型 'String' に割り当てられない

変更:
```dart
final id = response.id;
```

対象:
```dart
final id = response.id ?? '';
```

```
$ flutter analyze
1 つのエラーが見つかりました。
```

## 修正 2: イミュータブルリスト

ファイル: lib/features/cart/presentation/cart_page.dart:58
エラー: メソッド 'add' は型 'List<Item>' に対して定義されていません
原因: State がイミュータブルリストを保持しています。ミューテーション は Cubit を通じて行われます

変更:
```dart
state.items.add(item);
```

対象:
```dart
context.read<CartCubit>().addItem(item);
// 注記: Cubit は名前付きメソッド (addItem, removeItem) を公開します。
// .add(event) は BLoC イベント API です - 混在させないでください。
```

```
$ flutter analyze
問題が見つかりません！
```

## 最終検証

```
$ flutter test
すべてのテストがパスしました。
```

## サマリー

| 指標 | カウント |
|--------|-------|
| 修正された解析エラー | 2 |
| 変更されたファイル | 2 |
| 残っている問題 | 0 |

ビルドステータス: PASS ✓
````

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `型 'X?' の値を 'X' に割り当てられない` | `?? default` を追加または null ガードを追加 |
| `名前 'X' が定義されていません` | インポートを追加またはタイプミスを修正 |
| `非 null インスタンスフィールドは初期化する必要があります` | イニシャライザーまたは `late` を追加 |
| `バージョン解決に失敗` | pubspec.yaml のバージョン制約を調整 |
| `'X' の具体的な実装がありません` | インターフェースメソッドの実装を追加 |
| `build_runner: X の部分が必要です` | 古い `.g.dart` を削除してリビルド |

## 修正戦略

1. **解析エラー最初** - コードは無エラーである必須
2. **警告トリアージ次** - ランタイムバグを引き起こす可能性のある警告を修正
3. **pub 競合三番目** - 依存関係の解決を修正
4. **一度に 1 つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく、修正のみ

## 停止条件

以下の場合はエージェントは停止して報告：
- 同じエラーが 3 回の試行後も残存
- 修正により多くのエラーが導入
- アーキテクチャの変更が必須
- パッケージアップグレード競合がユーザーの決定を必要

## 関連コマンド

- `/flutter-test` - ビルド成功後にテストを実行
- `/flutter-review` - コード品質を確認
- `verification-loop` スキル - 完全な検証ループ

## 関連

- エージェント: `agents/dart-build-resolver.md`
- スキル: `skills/flutter-dart-code-review/`
