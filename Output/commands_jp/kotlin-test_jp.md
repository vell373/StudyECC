---
description: Kotlin のテスト駆動開発ワークフローを強制します。Kotest テストを最初に書き、その後実装します。Kover で 80%+ のカバレッジを検証します。
---

# Kotlin TDD コマンド

このコマンドは、Kotest、MockK、Kover を使用してテスト駆動開発の方法論を Kotlin コードに強制します。

## このコマンドの処理

1. **型/インターフェースの定義**: 関数シグネチャをまず定義
2. **Kotest テストの作成**: 包括的なテストスペックを作成（RED）
3. **テストの実行**: 正しい理由でテストが失敗することを検証
4. **コードの実装**: テストを通すための最小限のコードを作成（GREEN）
5. **リファクタリング**: テストが緑のままの状態で改善
6. **カバレッジの確認**: Kover で 80%+ カバレッジを確認

## 使用時機

以下の場合に `/kotlin-test` を使用してください:
- 新しい Kotlin 関数またはクラスを実装する時
- 既存の Kotlin コードにテストカバレッジを追加する時
- バグを修正する時（失敗するテストを最初に作成）
- 重要なビジネスロジックを構築する時
- Kotlin でテスト駆動開発ワークフローを学習する時

## TDD サイクル

```
RED     -> 失敗する Kotest テストを作成
GREEN   -> テストを通すための最小限のコードを実装
REFACTOR -> コードを改善、テストを緑のままに
REPEAT  -> 次のテストケース
```

## セッション例

````text
ユーザー: /kotlin-test ユーザー登録リクエストを検証する関数が必要です

エージェント:
# TDD セッション: 登録検証機

## ステップ 1: インターフェースの定義

```kotlin
// validator/RegistrationValidator.kt
package com.example.validator

data class RegistrationRequest(
    val name: String,
    val email: String,
    val password: String,
)

sealed class ValidationResult {
    data object Valid : ValidationResult()
    data class Invalid(val errors: List<String>) : ValidationResult()
}

fun validateRegistration(request: RegistrationRequest): ValidationResult {
    TODO("not implemented")
}
```

## ステップ 2: Kotest テストの作成（RED）

```kotlin
// validator/RegistrationValidatorTest.kt
package com.example.validator

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf

class RegistrationValidatorTest : FunSpec({
    test("valid registration returns Valid") {
        val request = RegistrationRequest(
            name = "Alice",
            email = "alice@example.com",
            password = "SecureP@ss1",
        )

        val result = validateRegistration(request)

        result.shouldBeInstanceOf<ValidationResult.Valid>()
    }

    test("blank name returns Invalid") {
        val request = RegistrationRequest(
            name = "",
            email = "alice@example.com",
            password = "SecureP@ss1",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors shouldBe listOf("Name is required")
    }

    test("invalid email returns Invalid") {
        val request = RegistrationRequest(
            name = "Alice",
            email = "not-an-email",
            password = "SecureP@ss1",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors shouldBe listOf("Invalid email format")
    }

    test("short password returns Invalid") {
        val request = RegistrationRequest(
            name = "Alice",
            email = "alice@example.com",
            password = "short",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors shouldBe listOf("Password must be at least 8 characters")
    }

    test("multiple errors returns all errors") {
        val request = RegistrationRequest(
            name = "",
            email = "bad",
            password = "short",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors.size shouldBe 3
    }
})
```

## ステップ 3: テストの実行 - 失敗を確認

```bash
$ ./gradlew test

RegistrationValidatorTest > valid registration returns Valid FAILED
  kotlin.NotImplementedError: An operation is not implemented

FAILED (5 tests, 0 passed, 5 failed)
```

✓ テストが予想通り失敗（NotImplementedError）。

## ステップ 4: 最小限のコードを実装（GREEN）

```kotlin
// validator/RegistrationValidator.kt
package com.example.validator

private val EMAIL_REGEX = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
private const val MIN_PASSWORD_LENGTH = 8

fun validateRegistration(request: RegistrationRequest): ValidationResult {
    val errors = buildList {
        if (request.name.isBlank()) add("Name is required")
        if (!EMAIL_REGEX.matches(request.email)) add("Invalid email format")
        if (request.password.length < MIN_PASSWORD_LENGTH) add("Password must be at least $MIN_PASSWORD_LENGTH characters")
    }

    return if (errors.isEmpty()) ValidationResult.Valid
    else ValidationResult.Invalid(errors)
}
```

## ステップ 5: テストの実行 - 成功を確認

```bash
$ ./gradlew test

RegistrationValidatorTest > valid registration returns Valid PASSED
RegistrationValidatorTest > blank name returns Invalid PASSED
RegistrationValidatorTest > invalid email returns Invalid PASSED
RegistrationValidatorTest > short password returns Invalid PASSED
RegistrationValidatorTest > multiple errors returns all errors PASSED

PASSED (5 tests, 5 passed, 0 failed)
```

✓ すべてのテストが成功！

## ステップ 6: カバレッジの確認

```bash
$ ./gradlew koverHtmlReport

Coverage: 100.0% of statements
```

✓ カバレッジ: 100%

## TDD 完了！
````

## テストパターン

### StringSpec（最も簡単）

```kotlin
class CalculatorTest : StringSpec({
    "add two positive numbers" {
        Calculator.add(2, 3) shouldBe 5
    }
})
```

### BehaviorSpec（BDD）

```kotlin
class OrderServiceTest : BehaviorSpec({
    Given("a valid order") {
        When("placed") {
            Then("should be confirmed") { /* ... */ }
        }
    }
})
```

### データ駆動テスト

```kotlin
class ParserTest : FunSpec({
    context("valid inputs") {
        withData("2026-01-15", "2026-12-31", "2000-01-01") { input ->
            parseDate(input).shouldNotBeNull()
        }
    }
})
```

### コルーチンテスト

```kotlin
class AsyncServiceTest : FunSpec({
    test("concurrent fetch completes") {
        runTest {
            val result = service.fetchAll()
            result.shouldNotBeEmpty()
        }
    }
})
```

## カバレッジコマンド

```bash
# テスト実行とカバレッジを含める
./gradlew koverHtmlReport

# カバレッジしきい値を検証
./gradlew koverVerify

# CI 用 XML レポート
./gradlew koverXmlReport

# HTML レポートを開く
open build/reports/kover/html/index.html

# 特定のテストクラスを実行
./gradlew test --tests "com.example.UserServiceTest"

# 詳細な出力で実行
./gradlew test --info
```

## カバレッジターゲット

| コードタイプ | ターゲット |
|------------|-----------|
| 重要なビジネスロジック | 100% |
| 公開 API | 90%+ |
| 一般的なコード | 80%+ |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**実施すること:**
- テスト FIRST を作成、実装前に
- 各変更後にテストを実行
- Kotest マッチャーを使用して表現力豊かなアサーションを実施
- MockK の `coEvery`/`coVerify` を suspend 関数に使用
- 実装の詳細ではなく動作をテスト
- エッジケース（空、null、最大値）を含める

**実施しないこと:**
- テストの前に実装を作成
- RED フェーズをスキップ
- プライベート関数を直接テスト
- コルーチンテストで `Thread.sleep()` を使用
- 不安定なテストを無視

## 関連コマンド

- `/kotlin-build` - ビルドエラーを修正
- `/kotlin-review` - 実装後にコードをレビュー
- `verification-loop` スキル - 完全な検証ループを実行

## 関連

- スキル: `skills/kotlin-testing/`
- スキル: `skills/tdd-workflow/`
