---
description: Flutter/Dart テストを実行し、失敗を報告し、テスト問題を段階的に修正します。ユニット、ウィジェット、ゴールデン、統合テストをカバーします。
---

# Flutter テスト

このコマンドは Flutter テストスイートを実行して結果を報告します。障害が発生した場合、問題を診断して段階的に修正します。

## このコマンドが行うこと

1. **テストを実行**: `flutter test` を実行（または変更されたファイルにスコープ）
2. **失敗を解析**: タイプと原因別に失敗したテストを特定
3. **段階的に修正**: 可能な場合は一度に 1 つの失敗
4. **検証**: 各修正後に再実行
5. **報告**: カバレッジサマリーと残っている失敗を表示

## いつ使うか

以下の場合に `/flutter-test` を使用：
- フィーチャーを実装した後に何も破損していないかを確認
- `/flutter-build` を実行した後にテストがパスすることを確認
- 新しいコードのテストカバレッジを確認
- 特定のテストファイルが失敗している場合
- PR を提出する前に

## 実行されるコマンド

```bash
# すべてのテストを実行
flutter test 2>&1

# カバレッジ付きでテストを実行
flutter test --coverage 2>&1

# 特定のテストファイルを実行
flutter test test/unit/domain/usecases/get_user_test.dart 2>&1

# 名前パターンにマッチするテストを実行
flutter test --name "CartBloc" 2>&1

# 統合テストを実行（デバイス/エミュレーターが必要）
flutter test integration_test/ 2>&1

# 意図的なビジュアル変更が加えられた時にゴールデンファイルを更新
flutter test --update-goldens 2>&1
```

## セッション例

````text
ユーザー: /flutter-test

エージェント:
# Flutter テスト実行

## テスト実行

```
$ flutter test
00:05 +42 -2: いくつかのテストが失敗しました。

失敗: test/unit/data/user_repository_test.dart
  UserRepository getById
    ユーザーが見つからない場合は null を返す
    期待値: null
    実際: User(id: 'test-id', name: 'Test User')

失敗: test/widget/cart_page_test.dart
  CartPage
    カートが空の場合に空状態を表示
    期待値: 「Your cart is empty」というテキストのウィジェットが正確に 1 つ
    見つかった: 「Your cart is empty」というテキストのウィジェットはなし
```

## 修正 1: リポジトリテスト

ファイル: test/unit/data/user_repository_test.dart
失敗: `getById` が不足している ID に対して null を返すはずのときにユーザーを返す

根本原因: テストセットアップが ID 'test-id' でユーザーを追加しますが、'missing-id' でクエリします。
修正: テストを 'missing-id' でクエリするようにアップデートしました — セットアップは正しかったです、クエリが間違っていました。

```
$ flutter test test/unit/data/user_repository_test.dart
1 テストがパス。
```

## 修正 2: ウィジェットテスト

ファイル: test/widget/cart_page_test.dart
失敗: 空状態テキストウィジェットが見つかりません

根本原因: 空状態メッセージが「Your cart is empty」からウィジェット内の「Cart is empty」に名前が変更されました。
修正: テスト文字列を現在のウィジェットコピーに一致させるようにアップデートしました。

```
$ flutter test test/widget/cart_page_test.dart
1 テストがパス。
```

## 最終実行

```
$ flutter test --coverage
すべての 44 テストがパスしました。
カバレッジ: 84.2%（目標: 80%）
```

## サマリー

| 指標 | 値 |
|--------|-------|
| 合計テスト | 44 |
| パス | 44 |
| 失敗 | 0 |
| カバレッジ | 84.2% |

テストステータス: PASS ✓
````

## 一般的なテスト失敗

| 失敗 | 典型的な修正 |
|---------|-------------|
| `期待値: <X> 実際: <Y>` | アサーションをアップデートまたは実装を修正 |
| `ウィジェットが見つかりません` | ファインダーセレクタを修正またはウィジェット名変更後にテストをアップデート |
| `ゴールデンファイルが見つかりません` | `flutter test --update-goldens` を実行して生成 |
| `ゴールデン不一致` | diff を検査します。変更が意図的な場合は `--update-goldens` を実行 |
| `MissingPluginException` | テストセットアップでプラットフォームチャネルをモック |
| `LateInitializationError` | `setUp()` で `late` フィールドを初期化 |
| `pumpAndSettle タイムアウト` | `pump(Duration)` 呼び出しに置き換えます |

## 関連コマンド

- `/flutter-build` — テストを実行する前にビルドエラーを修正
- `/flutter-review` — テストがパス後にコードをレビュー
- `tdd-workflow` スキル — テスト駆動開発ワークフロー

## 関連

- エージェント: `agents/flutter-reviewer.md`
- エージェント: `agents/dart-build-resolver.md`
- スキル: `skills/flutter-dart-code-review/`
- ルール: `rules/dart/testing.md`
