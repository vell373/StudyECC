---
description: Kotlin用のテスト駆動開発（TDD）ワークフローを強制します。Kotestテストを最初に書き、その後に実装します。Koverで80%以上のカバレッジを確認します。
---

# Kotlin TDDコマンド

このコマンドは、Kotest、MockK、Koverを使用してKotlin用のテスト駆動開発方法論を強制します。

## このコマンドが行うこと

1. **型/インターフェースを定義**: 関数シグネチャを最初にスカフォルド
2. **Kotestテストを記述**: 包括的なテストスペックを作成（RED）
3. **テストを実行**: テストが正しい理由で失敗することを確認
4. **コードを実装**: テストをパスするための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストが緑色のままコードを改善
6. **カバレッジを確認**: Kover で80%以上のカバレッジを確保

## いつ使うか

以下の場合に `/kotlin-test` を使用：
- 新しいKotlin関数またはクラスを実装
- 既存Kotlinコードにテストカバレッジを追加
- バグを修正（失敗するテストを最初に記述）
- 重要なビジネスロジックを構築
- Kotlin でのTDDワークフローを学習

## TDDサイクル

```
RED     -> 失敗するKotestテストを記述
GREEN   -> テストをパスするための最小限のコードを実装
REFACTOR -> コードを改善、テストは緑のまま
REPEAT  -> 次のテストケース
```

## セッション例

````text
ユーザー: /kotlin-test ユーザー登録リクエストを検証する関数が必要

エージェント:
# TDDセッション: 登録バリデーター

## ステップ1: インターフェースを定義

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

## ステップ2: Kotestテストを記述（RED）

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

## ステップ3: テストを実行 - FAILを確認

```bash
$ ./gradlew test

RegistrationValidatorTest > valid registration returns Valid FAILED
  kotlin.NotImplementedError: An operation is not implemented

FAILED (5 tests, 0 passed, 5 failed)
```

✓ テストは予期通り失敗します（NotImplementedError）。

## ステップ4: 最小限のコードを実装（GREEN）

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

## ステップ5: テストを実行 - PASSを確認

```bash
$ ./gradlew test

RegistrationValidatorTest > valid registration returns Valid PASSED
RegistrationValidatorTest > blank name returns Invalid PASSED
RegistrationValidatorTest > invalid email returns Invalid PASSED
RegistrationValidatorTest > short password returns Invalid PASSED
RegistrationValidatorTest > multiple errors returns all errors PASSED

PASSED (5 tests, 5 passed, 0 failed)
```

✓ すべてのテストがパスしています！

## ステップ6: カバレッジを確認

```bash
$ ./gradlew koverHtmlReport

カバレッジ: 100.0% of statements
```

✓ カバレッジ: 100%

## TDD完了！
````

## テストパターン

### StringSpec（最もシンプル）

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
# カバレッジ付きでテストを実行
./gradlew koverHtmlReport

# カバレッジしきい値を検証
./gradlew koverVerify

# CIのためのXMLレポート
./gradlew koverXmlReport

# HTMLレポートを開く
open build/reports/kover/html/index.html

# 特定のテストクラスを実行
./gradlew test --tests "com.example.UserServiceTest"

# 詳細出力で実行
./gradlew test --info
```

## カバレッジターゲット

| コードタイプ | ターゲット |
|-------------|----------|
| 重要なビジネスロジック | 100% |
| パブリックAPI | 90%以上 |
| 一般的なコード | 80%以上 |
| 生成されたコード | 除外 |

## TDDベストプラクティス

**すべきこと:**
- 実装前にテストを最初に記述
- 各変更後にテストを実行
- 表現力豊かなアサーションのためにKotestマッチャーを使用
- サスペンド関数には MockK の `coEvery`/`coVerify` を使用
- 実装の詳細ではなく、振る舞いをテスト
- エッジケース（空、null、最大値）を含める

**すべきでないこと:**
- テストの前に実装を記述
- RED フェーズをスキップ
- プライベート関数を直接テスト
- コルーチンテストで `Thread.sleep()` を使用
- フレーキーなテストを無視

## 関連コマンド

- `/kotlin-build` - ビルドエラーを修正
- `/kotlin-review` - 実装後にコードをレビュー
- `verification-loop` スキル - 完全な検証ループを実行

## 関連

- スキル: `skills/kotlin-testing/`
- スキル: `skills/tdd-workflow/`
