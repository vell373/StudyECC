---
description: Kotlin言語の慣用的パターン、null安全性、コルーチン安全性、セキュリティに関する包括的なコードレビュー。kotlin-reviewerエージェントを呼び出します。
---

# Kotlin コードレビュー

このコマンドは、**kotlin-reviewer** エージェントを呼び出してKotlin固有のコードレビューを実施します。

## このコマンドが行うこと

1. **Kotlin変更を特定**: `git diff` で変更された `.kt` と `.kts` ファイルを検出
2. **ビルドと静的解析を実行**: `./gradlew build`、`detekt`、`ktlintCheck` を実行
3. **セキュリティスキャン**: SQLインジェクション、コマンドインジェクション、ハードコードされたシークレットを確認
4. **Null安全性レビュー**: `!!` の使用、プラットフォーム型処理、アンセーフなキャストを解析
5. **コルーチンレビュー**: 構造化並行処理、ディスパッチャー使用法、キャンセルを確認
6. **レポート生成**: 問題を重大度別に分類

## いつ使うか

以下の場合に `/kotlin-review` を使用：
- Kotlinコードを書いた後または変更した後
- Kotlin変更をコミットする前
- Kotlinコードを含むプルリクエストをレビュー
- 新しいKotlinコードベースにオンボード
- 慣用的なKotlinパターンを学習

## レビューカテゴリ

### CRITICAL（修正必須）
- SQLインジェクション/コマンドインジェクション脆弱性
- 正当化なしの強制アンラップ `!!`
- プラットフォーム型null安全性違反
- GlobalScope 使用（構造化並行処理違反）
- ハードコードされた認証情報
- アンセーフなデシリアライゼーション

### HIGH（修正推奨）
- イミュータブルで十分な場所のミューテーション状態
- コルーチンコンテキスト内のブロッキング呼び出し
- 長いループ内のキャンセルチェック不足
- シールド型の `when` で非網羅的
- 大きな関数（>50行）
- 深いネスト（>4レベル）

### MEDIUM（検討推奨）
- 非慣用的なKotlin（Java形式パターン）
- 末尾のコンマ不足
- スコープ関数の誤用またはネスト
- 大規模なコレクションチェーンのシーケンス不足
- 冗長な明示的な型

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

## レビュー対象ファイル
- src/main/kotlin/com/example/service/UserService.kt（変更）
- src/main/kotlin/com/example/routes/UserRoutes.kt（変更）

## 静的解析結果
✓ ビルド: 成功
✓ detekt: 問題なし
警告: ktlint: 2フォーマット警告

## 検出された問題

[CRITICAL] 強制アンラップ Null 安全性
ファイル: src/main/kotlin/com/example/service/UserService.kt:28
問題: nullable リポジトリ結果に対して !! を使用
```kotlin
val user = repository.findById(id)!!  // NPEリスク
```
修正: エラーハンドリング付きで安全な呼び出しを使用
```kotlin
val user = repository.findById(id)
    ?: throw UserNotFoundException("User $id not found")
```

[HIGH] GlobalScope 使用
ファイル: src/main/kotlin/com/example/routes/UserRoutes.kt:45
問題: GlobalScope の使用は構造化並行処理を破る
```kotlin
GlobalScope.launch {
    notificationService.sendWelcome(user)
}
```
修正: 呼び出しのコルーチンスコープを使用
```kotlin
launch {
    notificationService.sendWelcome(user)
}
```

## サマリー
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨: FAIL: CRITICAL問題が修正されるまでマージをブロック
````

## 承認基準

| ステータス | 条件 |
|----------|------|
| PASS: 承認 | CRITICAL/HIGH 問題なし |
| WARNING: 警告 | MEDIUM 問題のみ（注意してマージ） |
| FAIL: ブロック | CRITICAL/HIGH 問題が見つかった |

## 他のコマンドとの統合

- `/kotlin-test` を最初に実行してテストがパスすることを確認
- ビルドエラーが発生した場合は `/kotlin-build` を使用
- コミット前に `/kotlin-review` を使用
- Kotlin固有でない懸念事項については `/code-review` を使用

## 関連

- エージェント: `agents/kotlin-reviewer.md`
- スキル: `skills/kotlin-patterns/`、`skills/kotlin-testing/`
