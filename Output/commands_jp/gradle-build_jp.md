---
description: Android および KMP プロジェクトの Gradle ビルドエラーを修正
---

# Gradle ビルド修正

Android および Kotlin Multiplatform プロジェクトの Gradle ビルドとコンパイルエラーを段階的に修正します。

## ステップ 1: ビルド構成の検出

プロジェクトタイプを特定し、適切なビルドを実行します:

| インジケーター | ビルドコマンド |
|-------------|-------------|
| `build.gradle.kts` + `composeApp/` (KMP) | `./gradlew composeApp:compileKotlinMetadata 2>&1` |
| `build.gradle.kts` + `app/` (Android) | `./gradlew app:compileDebugKotlin 2>&1` |
| `settings.gradle.kts` でモジュール指定 | `./gradlew assemble 2>&1` |
| Detekt 設定済み | `./gradlew detekt 2>&1` |

また、`gradle.properties` と `local.properties` の構成も確認してください。

## ステップ 2: エラーの解析とグループ化

1. ビルドコマンドを実行して出力をキャプチャ
2. Kotlin コンパイルエラーを Gradle 構成エラーから分離
3. モジュールとファイルパスでグループ化
4. ソート: 構成エラーを最初に、次に依存順でコンパイルエラー

## ステップ 3: 修正ループ

各エラーについて:

1. **ファイルを読む** — エラー行の周囲の完全なコンテキスト
2. **診断** — 一般的なカテゴリー:
   - インポート不足または未解決参照
   - 型の不一致または互換性のない型
   - `build.gradle.kts` 内の依存関係不足
   - 期待/実装の不一致（KMP）
   - Compose コンパイラエラー
3. **最小限の修正** — エラーを解決する最小の変更
4. **ビルドを再実行** — 修正を検証して新しいエラーをチェック
5. **続行** — 次のエラーへ移動

## ステップ 4: ガードレール

以下の場合は停止してユーザーに確認してください:
- 修正が解決したエラーより多くのエラーを導入する場合
- 3 回の試行後も同じエラーが続く場合
- エラーが新しい依存関係の追加またはモジュール構造の変更を必要とする場合
- Gradle 同期自体が失敗する場合（構成フェーズエラー）
- エラーが生成されたコード内にある場合（Room、SQLDelight、KSP）

## ステップ 5: 要約

報告:
- 修正されたエラー（モジュール、ファイル、説明）
- 残存するエラー
- 新たに導入されたエラー（ゼロであるべき）
- 提案される次のステップ

## 一般的な Gradle/KMP 修正

| エラー | 修正 |
|-------|------|
| `commonMain` 内の未解決参照 | 依存関係が `commonMain.dependencies {}` 内にあるかチェック |
| 実装のない Expect 宣言 | 各プラットフォームソースセットに `actual` 実装を追加 |
| Compose コンパイラバージョンミスマッチ | `libs.versions.toml` で Kotlin と Compose コンパイラバージョンを整列 |
| クラス重複 | `./gradlew dependencies` で競合する依存関係をチェック |
| KSP エラー | `./gradlew kspCommonMainKotlinMetadata` を実行して再生成 |
| キャッシュ構成の問題 | シリアル化不可能なタスク入力をチェック |
