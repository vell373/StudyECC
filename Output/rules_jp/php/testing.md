---
paths:
  - "**/*.php"
  - "**/phpunit.xml"
  - "**/phpunit.xml.dist"
  - "**/composer.json"
---
# PHP テスト

> このファイルは [common/testing.md](../common/testing.md) を PHP 固有のコンテンツで拡張します。

## フレームワーク

デフォルトテストフレームワークとして **PHPUnit** を使用。**Pest** がプロジェクトで設定されている場合、新規テストに Pest を優先し、フレームワークの混在を避ける。

## カバレッジ

```bash
vendor/bin/phpunit --coverage-text
# または
vendor/bin/pest --coverage
```

CI で **pcov** または **Xdebug** を優先し、カバレッジしきい値を部族知識ではなく CI で保持。

## テスト組織

- 高速ユニットテストをフレームワーク/データベース統合テストから分離。
- 大規模手書きアレイではなく、フィクスチャ用ファクトリー/ビルダーを使用。
- HTTP/コントローラーテストを転送と検証に焦点；ビジネスルールをサービスレベルテストに移動。

## Inertia

プロジェクトが Inertia.js を使用する場合、生 JSON アサーション代わりにコンポーネント名と props を検証する `assertInertia` で `AssertableInertia` を優先。

## リファレンス

スキル `tdd-workflow` でリポジトリ全体 RED → GREEN → REFACTOR ループを参照。
スキル `laravel-tdd` で Laravel 固有テストパターン（PHPUnit と Pest）を参照。
