---
description: AndroidおよびKMPプロジェクト用のGradleビルドエラーを修正します。
---

# Gradleビルド修正

AndroidおよびKotlin Multiplatformプロジェクト用にGradleビルドとコンパイルエラーを段階的に修正します。

## ステップ1: ビルド構成を検出

プロジェクトタイプを特定し、適切なビルドを実行します：

| インジケーター | ビルドコマンド |
|-----------|---------------|
| `build.gradle.kts` + `composeApp/` (KMP) | `./gradlew composeApp:compileKotlinMetadata 2>&1` |
| `build.gradle.kts` + `app/` (Android) | `./gradlew app:compileDebugKotlin 2>&1` |
| `settings.gradle.kts` (モジュール) | `./gradlew assemble 2>&1` |
| Detekt構成 | `./gradlew detekt 2>&1` |

また、`gradle.properties` と `local.properties` 設定を確認してください。

## ステップ2: エラーを解析してグループ化

1. ビルドコマンドを実行して出力をキャプチャ
2. Kotlinコンパイルエラーを Gradle 構成エラーから分離
3. モジュールとファイルパス別にグループ化
4. ソート: 構成エラーを最初に、その後は依存順にコンパイルエラー

## ステップ3: 修正ループ

各エラーについて：

1. **ファイルを読む** — エラー行の周辺のフルコンテキスト
2. **診断** — 一般的なカテゴリ：
   - インポート不足または未解決の参照
   - 型の不一致または互換性のない型
   - `build.gradle.kts` に依存関係が不足
   - 期待/実装の不一致（KMP）
   - Composeコンパイラエラー
3. **最小限に修正** — エラーを解決する最小限の変更
4. **ビルドを再実行** — 修正を確認して新しいエラーをチェック
5. **続行** — 次のエラーに移動

## ステップ4: ガードレール

以下の場合は停止してユーザーに質問：
- 修正により解決以上のエラーが導入
- 同じエラーが3回の試行後も残存
- エラーが新しい依存関係の追加またはモジュール構造の変更を要求
- Gradle同期自体が失敗（構成フェーズエラー）
- エラーが生成されたコード内（Room、SQLDelight、KSP）

## ステップ5: サマリー

レポート：
- 修正されたエラー（モジュール、ファイル、説明）
- 残っているエラー
- 導入された新しいエラー（ゼロであるべき）
- 推奨される次のステップ

## 一般的な Gradle/KMP 修正

| エラー | 修正 |
|-------|-----|
| `commonMain` の未解決の参照 | 依存関係が `commonMain.dependencies {}` にあるかを確認 |
| 実装なしの Expect 宣言 | 各プラットフォームソースセットに `actual` 実装を追加 |
| Compose コンパイラバージョンの不一致 | `libs.versions.toml` で Kotlin と Compose コンパイラバージョンを揃える |
| 重複クラス | `./gradlew dependencies` で依存関係の競合を確認 |
| KSP エラー | `./gradlew kspCommonMainKotlinMetadata` を実行して再生成 |
| 構成キャッシュ問題 | シリアル化不可能なタスク入力を確認 |
