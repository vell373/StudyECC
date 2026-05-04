---
description: C++ の TDD ワークフローを強制する。GoogleTest のテストを先に書き、次に実装する。gcov/lcov でカバレッジを確認する。
---

# C++ TDD コマンド

このコマンドは、CMake/CTest を使用した GoogleTest/GoogleMock による C++ コードのテスト駆動開発手法を強制する。

## このコマンドが行うこと

1. **インターフェースを定義する**: クラス/関数のシグネチャを最初にスキャフォールドする
2. **テストを書く**: 包括的な GoogleTest テストケースを作成する（RED）
3. **テストを実行する**: テストが正しい理由で失敗することを確認する
4. **コードを実装する**: 通過する最小限のコードを書く（GREEN）
5. **リファクタリング**: テストをグリーンに保ちながら改善する
6. **カバレッジを確認する**: 80% 以上のカバレッジを確保する

## 使用する場面

`/cpp-test` を使用する場合:
- 新しい C++ 関数またはクラスを実装する
- 既存のコードにテストカバレッジを追加する
- バグを修正する（最初に失敗するテストを書く）
- 重要なビジネスロジックを構築する
- C++ での TDD ワークフローを学習する

## TDD サイクル

```
RED     → 失敗する GoogleTest テストを書く
GREEN   → 通過する最小限のコードを実装する
REFACTOR → コードを改善し、テストをグリーンに保つ
REPEAT  → 次のテストケース
```

## セッション例

````
User: /cpp-test I need a function to validate email addresses

Agent:
# TDD Session: Email Validator

## Step 1: Define Interface

```cpp
// validator/email.hpp
#pragma once
#include <string>
#include <expected>

enum class EmailError {
    Empty,
    InvalidFormat
};

std::expected<void, EmailError> validate_email(const std::string& email);
```

## Step 2: Write Tests (RED)

```cpp
// validator/email_test.cpp
#include <gtest/gtest.h>
#include "email.hpp"

TEST(ValidateEmail, AcceptsSimpleEmail) {
    auto result = validate_email("user@example.com");
    EXPECT_TRUE(result.has_value());
}

TEST(ValidateEmail, AcceptsSubdomain) {
    EXPECT_TRUE(validate_email("user@mail.example.com").has_value());
}

TEST(ValidateEmail, AcceptsPlus) {
    EXPECT_TRUE(validate_email("user+tag@example.com").has_value());
}

TEST(ValidateEmail, RejectsEmpty) {
    auto result = validate_email("");
    ASSERT_FALSE(result.has_value());
    EXPECT_EQ(result.error(), EmailError::Empty);
}

TEST(ValidateEmail, RejectsNoAtSign) {
    EXPECT_FALSE(validate_email("userexample.com").has_value());
}

TEST(ValidateEmail, RejectsNoDomain) {
    EXPECT_FALSE(validate_email("user@").has_value());
}

TEST(ValidateEmail, RejectsNoLocalPart) {
    EXPECT_FALSE(validate_email("@example.com").has_value());
}
```

## Step 3: Run Tests - Verify FAIL

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....***Failed
    --- undefined reference to `validate_email`

FAIL
```

✓ Tests fail as expected (unimplemented).

## Step 4: Implement Minimal Code (GREEN)

```cpp
// validator/email.cpp
#include "email.hpp"
#include <regex>

std::expected<void, EmailError> validate_email(const std::string& email) {
    if (email.empty()) {
        return std::unexpected(EmailError::Empty);
    }
    static const std::regex pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    if (!std::regex_match(email, pattern)) {
        return std::unexpected(EmailError::InvalidFormat);
    }
    return {};
}
```

## Step 5: Run Tests - Verify PASS

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....   Passed    0.01 sec

100% tests passed.
```

✓ All tests passing!

## Step 6: Check Coverage

```bash
$ cmake -DCMAKE_CXX_FLAGS="--coverage" -B build && cmake --build build
$ ctest --test-dir build
$ lcov --capture --directory build --output-file coverage.info
$ lcov --list coverage.info

validator/email.cpp     | 100%
```

✓ Coverage: 100%

## TDD Complete!
````

## テストパターン

### 基本テスト
```cpp
TEST(SuiteName, TestName) {
    EXPECT_EQ(add(2, 3), 5);
    EXPECT_NE(result, nullptr);
    EXPECT_TRUE(is_valid);
    EXPECT_THROW(func(), std::invalid_argument);
}
```

### フィクスチャ
```cpp
class DatabaseTest : public ::testing::Test {
protected:
    void SetUp() override { db_ = create_test_db(); }
    void TearDown() override { db_.reset(); }
    std::unique_ptr<Database> db_;
};

TEST_F(DatabaseTest, InsertsRecord) {
    db_->insert("key", "value");
    EXPECT_EQ(db_->get("key"), "value");
}
```

### パラメータ化テスト
```cpp
class PrimeTest : public ::testing::TestWithParam<std::pair<int, bool>> {};

TEST_P(PrimeTest, ChecksPrimality) {
    auto [input, expected] = GetParam();
    EXPECT_EQ(is_prime(input), expected);
}

INSTANTIATE_TEST_SUITE_P(Primes, PrimeTest, ::testing::Values(
    std::make_pair(2, true),
    std::make_pair(4, false),
    std::make_pair(7, true)
));
```

## カバレッジコマンド

```bash
# カバレッジ付きでビルド
cmake -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage" -B build

# テストを実行する
cmake --build build && ctest --test-dir build

# カバレッジレポートを生成する
lcov --capture --directory build --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage_html
```

## カバレッジ目標

| コードタイプ | 目標 |
|-----------|--------|
| 重要なビジネスロジック | 100% |
| 公開 API | 90% 以上 |
| 一般コード | 80% 以上 |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**やるべきこと:**
- 実装の前に必ずテストを書く
- 各変更後にテストを実行する
- 適切な場合は `ASSERT_*`（停止）より `EXPECT_*`（継続）を使用する
- 実装の詳細ではなく動作をテストする
- エッジケースを含める（空、null、最大値、境界条件）

**やってはいけないこと:**
- テストの前に実装を書く
- RED フェーズをスキップする
- プライベートメソッドを直接テストする（公開 API を通じてテストする）
- テストで `sleep` を使用する
- フレーキーテストを無視する

## 関連コマンド

- `/cpp-build` - ビルドエラーを修正する
- `/cpp-review` - 実装後にコードをレビューする
- `verification-loop` スキル - 完全な検証ループを実行する

## 関連

- スキル: `skills/cpp-testing/`
- スキル: `skills/tdd-workflow/`
