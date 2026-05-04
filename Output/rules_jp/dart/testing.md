---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Dart/Flutter テスト

> このファイルは [common/testing.md](../common/testing.md) を Dart および Flutter 固有のコンテンツで拡張します。

## テストフレームワーク

- **flutter_test** / **dart:test** — 組み込みテストランナー
- **mockito**（`@GenerateMocks` 付き）または **mocktail**（コード生成なし）でモック化
- BLoC/Cubit ユニットテストに **bloc_test**
- ユニットテストで時間を制御するための **fake_async**
- エンドツーエンドデバイステストに **integration_test**

## テストタイプ

| タイプ | ツール | 場所 | 書くタイミング |
|--------|--------|------|--|
| ユニット | `dart:test` | `test/unit/` | すべてのドメイン ロジック、状態管理、リポジトリ |
| ウィジェット | `flutter_test` | `test/widget/` | 意味のある動作を持つすべてのウィジェット |
| ゴールデン | `flutter_test` | `test/golden/` | デザイン批判的な UI コンポーネント |
| 統合 | `integration_test` | `integration_test/` | 実際のデバイス/エミュレータ上の重要なユーザーフロー |

## ユニットテスト: 状態管理

### BLoC と `bloc_test`

```dart
group('CartBloc', () {
  late CartBloc bloc;
  late MockCartRepository repository;

  setUp(() {
    repository = MockCartRepository();
    bloc = CartBloc(repository);
  });

  tearDown(() => bloc.close());

  blocTest<CartBloc, CartState>(
    'emits updated items when CartItemAdded',
    build: () => bloc,
    act: (b) => b.add(CartItemAdded(testItem)),
    expect: () => [CartState(items: [testItem])],
  );

  blocTest<CartBloc, CartState>(
    'emits empty cart when CartCleared',
    seed: () => CartState(items: [testItem]),
    build: () => bloc,
    act: (b) => b.add(CartCleared()),
    expect: () => [const CartState()],
  );
});
```

### Riverpod と `ProviderContainer`

```dart
test('usersProvider loads users from repository', () async {
  final container = ProviderContainer(
    overrides: [userRepositoryProvider.overrideWithValue(FakeUserRepository())],
  );
  addTearDown(container.dispose);

  final result = await container.read(usersProvider.future);
  expect(result, isNotEmpty);
});
```

## ウィジェットテスト

```dart
testWidgets('CartPage shows item count badge', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
```
