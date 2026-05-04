---
description: Kotlinビルドエラー、コンパイラ警告、依存関係の問題を段階的に修正します。最小限で外科的修正のためにkotlin-build-resolverエージェントを呼び出します。
---

# Kotlin ビルドと修正

このコマンドは、**kotlin-build-resolver** エージェントを呼び出して、最小限の変更でKotlinビルドエラーを段階的に修正します。

## このコマンドが行うこと

1. **診断を実行**: `./gradlew build`、`detekt`、`ktlintCheck` を実行
2. **エラーを解析**: ファイル別にグループ化し、重大度別にソート
3. **段階的に修正**: 一度に1つのエラー
4. **各修正を検証**: 各変更後にビルドを再実行
5. **概要を報告**: 何が修正され、何が残っているかを表示

## いつ使うか

以下の場合に `/kotlin-build` を使用：
- `./gradlew build` がエラーで失敗
- Kotlinコンパイラがエラーを報告
- `./gradlew detekt` が違反を報告
- Gradle依存関係解決が失敗
- 変更をプルした後でビルドが破損

## 実行される診断コマンド

```bash
# プライマリビルドチェック
./gradlew build 2>&1

# 静的解析
./gradlew detekt 2>&1 || echo "detekt not configured"
./gradlew ktlintCheck 2>&1 || echo "ktlint not configured"

# 依存関係の問題
./gradlew dependencies --configuration runtimeClasspath 2>&1 | head -100

# キャッシュまたは依存関係メタデータが疑わしい場合の深刻な更新
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

見つかったエラー: 3

## 修正 1: 未解決の参照

ファイル: src/main/kotlin/com/example/service/UserService.kt:25
エラー: Unresolved reference: UserRepository
原因: インポート不足

```kotlin
// インポートを追加
import com.example.repository.UserRepository
```

```bash
$ ./gradlew build
# 2つのエラーが残っている
```

## 修正 2: 型の不一致

ファイル: src/main/kotlin/com/example/routes/UserRoutes.kt:42
エラー: Type mismatch: inferred type is String but Int was expected

```kotlin
// 変更
val count = call.parameters["count"]
// 対象
val count = call.parameters["count"]?.toIntOrNull()
    ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid count")
```

```bash
$ ./gradlew build
# 1つのエラーが残っている
```

## 修正 3: 非網羅的な When

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
# すべてのテストがパス
```

## サマリー

| 指標 | カウント |
|--------|-------|
| 修正されたビルドエラー | 3 |
| 修正された Detekt 問題 | 0 |
| 変更されたファイル | 2 |
| 残っている問題 | 0 |

ビルドステータス: PASS: SUCCESS
````

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `Unresolved reference: X` | インポートまたは依存関係を追加 |
| `Type mismatch` | 型変換またはアサインメントを修正 |
| `'when' must be exhaustive` | 不足しているシールクラスブランチを追加 |
| `Suspend function can only be called from coroutine` | `suspend` 修飾子を追加 |
| `Smart cast impossible` | ローカル `val` または `let` を使用 |
| `None of the following candidates is applicable` | 引数型を修正 |
| `Could not resolve dependency` | バージョンを修正またはリポジトリを追加 |

## 修正戦略

1. **ビルドエラー最初** - コードはコンパイルする必須
2. **Detekt 違反次** - コード品質の問題を修正
3. **ktlint 警告三番目** - フォーマットを修正
4. **一度に1つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく、修正のみ

## 停止条件

以下の場合はエージェントは停止して報告：
- 同じエラーが3回の試行後も残存
- 修正により多くのエラーが導入
- アーキテクチャの変更が必須
- 外部依存関係が不足

## 関連コマンド

- `/kotlin-test` - ビルド成功後にテストを実行
- `/kotlin-review` - コード品質を確認
- `verification-loop` スキル - 完全な検証ループ

## 関連

- エージェント: `agents/kotlin-build-resolver.md`
- スキル: `skills/kotlin-patterns/`
