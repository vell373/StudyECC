# テスト要件

## 最小テストカバレッジ: 80%

テストタイプ（すべて必須）:
1. **ユニットテスト** - 個別関数、ユーティリティ、コンポーネント
2. **統合テスト** - API エンドポイント、データベース操作
3. **E2E テスト** - 重要なユーザーフロー（言語ごとにフレームワークを選択）

## テスト駆動開発

必須ワークフロー:
1. 最初にテストを書く（RED）
2. テストを実行 - 失敗するはず
3. 最小限の実装を書く（GREEN）
4. テストを実行 - 合格するはず
5. リファクタリング（IMPROVE）
6. カバレッジを確認（80%以上）

## テスト失敗のトラブルシューティング

1. **tdd-guide** エージェントを使用
2. テスト分離を確認
3. モックが正しいことを確認
4. テストではなく実装を修正（テストが間違っている場合を除く）

## エージェントサポート

- **tdd-guide** - 新機能に対して積極的に使用、テスト優先の実装を強制

## テスト構造（AAAパターン）

テストに対してArrange-Act-Assert構造を優先する:

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### テスト命名

テスト対象の動作を説明する説明的な名前を使用する:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```
