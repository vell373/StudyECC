---
description: Flutter/Dart のテストを実行し、失敗を報告し、テストの問題を段階的に修正する。ユニット、ウィジェット、ゴールデン、インテグレーションテストをカバーする。
---

# Flutter Test

このコマンドは Flutter テストスイートを実行して結果を報告する。失敗が発生した場合、問題を段階的に診断して修正する。

## このコマンドが行うこと

1. **テストを実行する**: `flutter test` を実行する（または変更されたファイルにスコープを絞る）
2. **失敗を解析する**: 失敗したテストをタイプと原因で特定する
3. **段階的に修正する**: 可能な場合は一度に 1 つの失敗
4. **検証する**: 各修正後に再実行する
5. **報告する**: カバレッジサマリーと残っている失敗を表示する

## 使用する場面

`/flutter-test` を使用する場合:
- 機能を実装した後に何も壊れていないことを確認する
- テストが通ることを確認するために `/flutter-build` を実行した後
- 新しいコードのテストカバレッジを確認する
- 特定のテストファイルが失敗している場合
- PR を提出する前

## 実行されるコマンド

```bash
# すべてのテストを実行する
flutter test 2>&1

# カバレッジ付きで実行する
flutter test --coverage 2>&1

# 特定のテストファイルを実行する
flutter test test/unit/domain/usecases/get_user_test.dart 2>&1

# 名前パターンに合致するテストを実行する
flutter test --name "CartBloc" 2>&1

# インテグレーションテストを実行する（デバイス/エミュレーターが必要）
flutter test integration_test/ 2>&1

# 意図的なビジュアル変更が行われた場合にゴールデンファイルを更新する
flutter test --update-goldens 2>&1
```

## セッション例

````text
User: /flutter-test

Agent:
# Flutter Test Run

## Test Execution

```
$ flutter test
00:05 +42 -2: Some tests failed.

FAILED: test/unit/data/user_repository_test.dart
  UserRepository getById
    returns null when user not found
    Expected: null
    Actual: User(id: 'test-id', name: 'Test User')

FAILED: test/widget/cart_page_test.dart
  CartPage
    shows empty state when cart is empty
    Expected: exactly one widget with text 'Your cart is empty'
    Found: no widget with text 'Your cart is empty'
```

## Fix 1: Repository Test

File: test/unit/data/user_repository_test.dart
Failure: `getById` returns a user when it should return null for missing ID

Root cause: Test setup adds a user with ID 'test-id' but queries with 'missing-id'.
Fix: Updated test to query with 'missing-id' — setup was correct, query was wrong.

```
$ flutter test test/unit/data/user_repository_test.dart
1 test passed.
```

## Fix 2: Widget Test

File: test/widget/cart_page_test.dart
Failure: Empty state text widget not found

Root cause: Empty state message was renamed from 'Your cart is empty' to 'Cart is empty' in the widget.
Fix: Updated test string to match current widget copy.

```
$ flutter test test/widget/cart_page_test.dart
1 test passed.
```

## Final Run

```
$ flutter test --coverage
All 44 tests passed.
Coverage: 84.2% (target: 80%)
```

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 44 |
| Passed | 44 |
| Failed | 0 |
| Coverage | 84.2% |

Test Status: PASS ✓
````

## 一般的なテスト失敗

| 失敗 | 典型的な修正 |
|---------|-------------|
| `Expected: <X> Actual: <Y>` | アサーションを更新するか実装を修正する |
| `Widget not found` | ファインダーセレクターを修正するかウィジェットのリネーム後にテストを更新する |
| `Golden file not found` | `flutter test --update-goldens` を実行して生成する |
| `Golden mismatch` | diff を確認する; 変更が意図的なら `--update-goldens` を実行する |
| `MissingPluginException` | テストセットアップでプラットフォームチャンネルをモックする |
| `LateInitializationError` | `setUp()` で `late` フィールドを初期化する |
| `pumpAndSettle timed out` | 明示的な `pump(Duration)` 呼び出しに置き換える |

## 関連コマンド

- `/flutter-build` — テストを実行する前にビルドエラーを修正する
- `/flutter-review` — テストが通った後にコードをレビューする
- `tdd-workflow` スキル — テスト駆動開発ワークフロー

## 関連

- エージェント: `agents/flutter-reviewer.md`
- エージェント: `agents/dart-build-resolver.md`
- スキル: `skills/flutter-dart-code-review/`
- ルール: `rules/dart/testing.md`
