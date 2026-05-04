---
description: C++ 用に TDD ワークフローを実装します。GoogleTest テストを最初に書いて、その後実装します。gcov/lcov でカバレッジを確認します。
---

# C++ TDD コマンド

このコマンドは、GoogleTest/GoogleMock を使用した C++ コード用にテスト駆動開発の方法論を実装します（CMake/CTest を使用）。

## このコマンドが行うこと

1. **インターフェースを定義**: クラス/関数シグネチャを最初にスキャッフォルド
2. **テストを書く**: 包括的な GoogleTest テストケースを作成（RED）
3. **テストを実行**: テストが正しい理由で失敗することを確認
4. **コードを実装**: テストをパスするための最小限のコードを書く（GREEN）
5. **リファクタリング**: テストがグリーン状態を保ったまま改善
6. **カバレッジを確認**: 80% 以上のカバレッジを確保

## いつ使うか

以下の場合に `/cpp-test` を使用：
- 新しい C++ 関数またはクラスを実装する
- 既存コードにテストカバレッジを追加する
- バグを修正（失敗するテストを最初に書く）
- ビジネスロジックの構築
- C++ で TDD ワークフローを学ぶ

## TDD サイクル

```
RED     → 失敗する GoogleTest テストを書く
GREEN   → テストをパスするための最小限のコードを実装
REFACTOR → コードを改善し、テストがグリーン状態を保つ
REPEAT  → 次のテストケースへ
```

## セッション例

````
ユーザー: /cpp-test メールアドレスを検証する関数が必要です

エージェント:
# TDD セッション: メール検証ツール

## ステップ1: インターフェースを定義

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

## ステップ2: テストを書く（RED）

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

## ステップ3: テストを実行 - FAIL を確認

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....***Failed
    --- undefined reference to `validate_email`

FAIL
```

成功: テストが期待通り失敗（未実装）。

## ステップ4: 最小限のコードを実装（GREEN）

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

## ステップ5: テストを実行 - PASS を確認

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....   Passed    0.01 sec

100% tests passed.
```

成功: すべてのテストがパス！

## ステップ6: カバレッジを確認

```bash
$ cmake -DCMAKE_CXX_FLAGS="--coverage" -B build && cmake --build build
$ ctest --test-dir build
$ lcov --capture --directory build --output-file coverage.info
$ lcov --list coverage.info

validator/email.cpp     | 100%
```

成功: カバレッジ 100%

## TDD 完了！
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

# テストを実行
cmake --build build && ctest --test-dir build

# カバレッジレポートを生成
lcov --capture --directory build --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage_html
```

## カバレッジの目標

| コードの種類 | 目標 |
|----------|--------|
| ビジネスロジック | 100% |
| パブリック API | 90% 以上 |
| 一般的なコード | 80% 以上 |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**やるべきこと:**
- テストを最初に書く（実装より前）
- 各変更後にテストを実行
- 適切な場合は `EXPECT_*`（続行）を `ASSERT_*`（停止）より優先
- 実装の詳細ではなく振る舞いをテストする
- エッジケース（空、null、最大値、境界条件）を含める

**やってはいけないこと:**
- テストの前に実装を書く
- RED フェーズをスキップ
- 非公開メソッドを直接テストする（パブリック API 経由でテスト）
- テストで `sleep` を使う
- フレーキーなテストを無視する

## 関連コマンド

- `/cpp-build` - ビルドエラーを修正
- `/cpp-review` - 実装後にコードをレビュー
- `verification-loop` スキル - 完全な検証ループを実行

## 関連

- スキル: `skills/cpp-testing/`
- スキル: `skills/tdd-workflow/`
