---
description: Kotlin/Gradle ビルドエラー、コンパイラ警告、依存関係の問題を段階的に修正。kotlin-build-resolver エージェントを呼び出して、最小限の外科的修正を実行。
---

# Kotlin ビルド修正

このコマンドは **kotlin-build-resolver** エージェントを呼び出して、最小限の変更で Kotlin ビルドエラーを段階的に修正します。

## このコマンドの処理

1. **診断を実行**: `./gradlew build`、`detekt`、`ktlintCheck` を実行
2. **エラーを解析**: ファイル別にグループ化して重大度でソート
3. **段階的に修正**: 一度に1つのエラー
4. **各修正を検証**: 各変更後にビルドを再実行
5. **要約レポート**: 修正されたものと残存するものを表示

## 使用時機

以下の場合に `/kotlin-build` を使用してください:
- `./gradlew build` がエラーで失敗する時
- Kotlin コンパイラがエラーを報告する時
- `./gradlew detekt` が違反を報告する時
- Gradle 依存関係解決が失敗する時
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# プライマリビルドチェック
./gradlew build 2>&1

# 静的解析
./gradlew detekt 2>&1 || echo "detekt not configured"
./gradlew ktlintCheck 2>&1 || echo "ktlint not configured"

# 依存関係の問題
./gradlew dependencies --configuration runtimeClasspath 2>&1 | head -100

# キャッシュまたは依存関係メタデータが疑わしい場合のオプション深くリフレッシュ
./gradlew build --refresh-dependencies
```

## セッション例

````text
ユーザー: /kotlin-build

エージェント:
# Kotlin ビルド解決

## 初期診断

```bash
$ ./gradlew build
e: src/main/kotlin/com/example/service/UserService.kt:25:15 Unresolved reference: UserRepository
e: src/main/kotlin/com/example/routes/UserRoutes.kt:42:9 Type mismatch: inferred type is String but Int was expected
e: src/main/kotlin/com/example/routes/UserRoutes.kt:58:5 'when' expression must be exhaustive
```

エラー検出: 3

## 修正 1: 未解決参照

ファイル: src/main/kotlin/com/example/service/UserService.kt:25
エラー: Unresolved reference: UserRepository
原因: インポート不足

```kotlin
// インポート追加
import com.example.repository.UserRepository
```

```bash
$ ./gradlew build
# 2 エラー残存
```

## 修正 2: 型の不一致

ファイル: src/main/kotlin/com/example/routes/UserRoutes.kt:42
エラー: Type mismatch: inferred type is String but Int was expected

```kotlin
// 変更
val count = call.parameters["count"]
// 以下に
val count = call.parameters["count"]?.toIntOrNull()
    ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid count")
```

```bash
$ ./gradlew build
# 1 エラー残存
```

## 修正 3: 網羅的でない When

ファイル: src/main/kotlin/com/example/routes/UserRoutes.kt:58
エラー: 'when' expression must be exhaustive

```kotlin
// 不足していたブランチを追加
when (user.role) {
    Role.ADMIN -> handleAdmin(user)
    Role.USER -> handleUser(user)
    Role.MODERATOR -> handleModerator(user) // 追加
}
```

```bash
$ ./gradlew build
# ビルド成功！
```

## 最終検証

```bash
$ ./gradlew detekt
# 問題なし

$ ./gradlew test
# すべてのテストが通過
```

## 要約

| メトリック | カウント |
|-----------|---------|
| 修正されたビルドエラー | 3 |
| 修正された detekt 問題 | 0 |
| 修正されたファイル | 2 |
| 残存する問題 | 0 |

ビルドステータス: 成功
````

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|--------|-----------|
| `Unresolved reference: X` | インポートまたは依存関係を追加 |
| `Type mismatch` | 型変換または割り当てを修正 |
| `'when' must be exhaustive` | シールド化されたクラスの不足していたブランチを追加 |
| `Suspend function can only be called from coroutine` | `suspend` 修飾子を追加 |
| `Smart cast impossible` | ローカル `val` または `let` を使用 |
| `None of the following candidates is applicable` | 引数の型を修正 |
| `Could not resolve dependency` | バージョンを修正またはリポジトリを追加 |

## 修正戦略

1. **ビルドエラーを最初に** - コードはコンパイルされなければなりません
2. **Detekt 違反を次に** - コード品質の問題を修正
3. **ktlint 警告を次に** - フォーマットを修正
4. **一度に1つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングしない、修正するだけ

## 停止条件

エージェントは以下の場合に停止して報告します:
- 3 回の試行後も同じエラーが続く
- 修正がより多くのエラーを導入する
- アーキテクチャの変更が必要
- 外部依存関係が見つからない

## 関連コマンド

- `/kotlin-test` - ビルド成功後にテストを実行
- `/kotlin-review` - コード品質をレビュー
- `verification-loop` スキル - 完全な検証ループを実行

## 関連

- エージェント: `agents/kotlin-build-resolver.md`
- スキル: `skills/kotlin-patterns/`
