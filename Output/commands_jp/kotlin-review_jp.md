---
description: Kotlin コードの慣用的パターン、null 安全性、コルーチン安全性、セキュリティを包括的にレビュー。kotlin-reviewer エージェントを呼び出す。
---

# Kotlin コードレビュー

このコマンドは **kotlin-reviewer** エージェントを呼び出して、Kotlin に特化した包括的なコードレビューを実行します。

## このコマンドの処理

1. **Kotlin 変更の検出**: `git diff` を使用して修正された `.kt` と `.kts` ファイルを検出
2. **ビルドと静的解析を実行**: `./gradlew build`、`detekt`、`ktlintCheck` を実行
3. **セキュリティスキャン**: SQL インジェクション、コマンドインジェクション、ハードコードされたシークレットをチェック
4. **Null 安全性レビュー**: `!!` 使用法、プラットフォーム型の処理、安全でないキャストを解析
5. **コルーチンレビュー**: 構造化された並行処理、ディスパッチャー使用法、キャンセルをチェック
6. **レポート生成**: 問題を重大度ごとに分類

## 使用時機

以下の場合に `/kotlin-review` を使用してください:
- Kotlin コードを書いたまたは修正した後
- Kotlin の変更をコミットする前
- Kotlin コードを含むプルリクエストをレビューする時
- 新しい Kotlin コードベースへのオンボーディング時
- 慣用的な Kotlin パターンを学習する時

## レビューカテゴリー

### CRITICAL（必ず修正）
- SQL/コマンドインジェクション脆弱性
- 正当化なしの強制アンラップ `!!`
- プラットフォーム型の null 安全性違反
- GlobalScope 使用（構造化された並行処理違反）
- ハードコードされた認証情報
- 安全でないデシリアライゼーション

### HIGH（修正すべき）
- 不変で十分なところの可変状態
- コルーチンコンテキスト内のブロッキングコール
- 長いループでのキャンセルチェック不足
- シール化型の網羅的でない `when`
- 大きな関数（>50行）
- 深いネスト（>4レベル）

### MEDIUM（検討）
- 非慣用的な Kotlin（Java スタイルパターン）
- 末尾コンマ不足
- スコープ関数の誤用またはネスト
- 大きなコレクションチェーンでのシーケンス不足
- 冗長な明示的型

## 実行される自動チェック

```bash
# ビルドチェック
./gradlew build

# 静的解析
./gradlew detekt

# フォーマットチェック
./gradlew ktlintCheck

# テスト
./gradlew test
```

## 使用例

````text
ユーザー: /kotlin-review

エージェント:
# Kotlin コードレビューレポート

## レビューされたファイル
- src/main/kotlin/com/example/service/UserService.kt (修正)
- src/main/kotlin/com/example/routes/UserRoutes.kt (修正)

## 静的解析結果
✓ ビルド: 成功
✓ detekt: 問題なし
警告: ktlint: 2 フォーマット警告

## 発見された問題

[CRITICAL] 強制アンラップ Null 安全性
ファイル: src/main/kotlin/com/example/service/UserService.kt:28
問題: nullable なリポジトリ結果で !! を使用
```kotlin
val user = repository.findById(id)!!  // NPE リスク
```
修正: セーフコールとエラーハンドリングを使用
```kotlin
val user = repository.findById(id)
    ?: throw UserNotFoundException("User $id not found")
```

[HIGH] GlobalScope 使用
ファイル: src/main/kotlin/com/example/routes/UserRoutes.kt:45
問題: GlobalScope を使用して構造化された並行処理が破壊
```kotlin
GlobalScope.launch {
    notificationService.sendWelcome(user)
}
```
修正: コールのコルーチンスコープを使用
```kotlin
launch {
    notificationService.sendWelcome(user)
}
```

## 要約
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨事項: 失敗: CRITICAL 問題が修正されるまでマージをブロック
````

## 承認基準

| ステータス | 条件 |
|-----------|------|
| 承認 | CRITICAL または HIGH 問題なし |
| 警告 | MEDIUM 問題のみ（注意してマージ） |
| ブロック | CRITICAL または HIGH 問題が見つかった |

## 他のコマンドとの統合

- 最初に `/kotlin-test` を使用してテストが通ることを確認
- ビルドエラーが発生した場合は `/kotlin-build` を使用
- コミット前に `/kotlin-review` を使用
- Kotlin 固有ではない懸念事項については `/code-review` を使用

## 関連

- エージェント: `agents/kotlin-reviewer.md`
- スキル: `skills/kotlin-patterns/`、`skills/kotlin-testing/`
