---
description: C++ ビルドエラー、CMake の問題、リンカーの問題を段階的に修正する。最小限の外科的な修正のために cpp-build-resolver エージェントを呼び出す。
---

# C++ Build and Fix

このコマンドは **cpp-build-resolver** エージェントを呼び出して、最小限の変更で C++ ビルドエラーを段階的に修正する。

## このコマンドが行うこと

1. **診断を実行する**: `cmake --build`、`clang-tidy`、`cppcheck` を実行する
2. **エラーを解析する**: ファイルでグループ化して重大度でソートする
3. **段階的に修正する**: 一度に 1 つのエラー
4. **各修正を検証する**: 各変更後にビルドを再実行する
5. **サマリーを報告する**: 修正されたものと残っているものを表示する

## 使用する場面

`/cpp-build` を使用する場合:
- `cmake --build build` がエラーで失敗する
- リンカーエラー（未定義の参照、多重定義）
- テンプレートのインスタンス化エラー
- インクルード/依存関係の問題
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# CMake の設定
cmake -B build -S .

# ビルド
cmake --build build 2>&1 | head -100

# 静的解析（利用可能な場合）
clang-tidy src/*.cpp -- -std=c++17
cppcheck --enable=all src/
```

## セッション例

```text
User: /cpp-build

Agent:
# C++ Build Resolution

## Initial Diagnostics

```bash
$ cmake --build build
src/service/user.cpp:25:15: error: use of undeclared identifier 'UserRepository'
src/handler/api.cpp:42:9: error: no matching function for call to 'process'
src/handler/api.cpp:58:1: error: non-void function does not return a value
```

Errors found: 3

## Fix 1: Undeclared Identifier

File: src/service/user.cpp:25
Error: use of undeclared identifier 'UserRepository'
Cause: Missing include

```cpp
// Added include
#include "repository/user_repository.hpp"
```

```bash
$ cmake --build build
# 2 errors remaining
```

## Fix 2: No Matching Function

File: src/handler/api.cpp:42
Error: no matching function for call to 'process'

```cpp
// Changed
process(params.get("count"));
// To
process(std::stoi(params.get("count")));
```

```bash
$ cmake --build build
# 1 error remaining
```

## Fix 3: Missing Return

File: src/handler/api.cpp:58
Error: non-void function does not return a value

```cpp
std::optional<User> getUser(const std::string& id) {
    if (id.empty()) {
        return std::nullopt;
    }
    auto user = findUser(id);
    // Added missing return
    return user;
}
```

```bash
$ cmake --build build
# Build successful!
```

## Final Verification

```bash
$ ctest --test-dir build --output-on-failure
Test project build
    1/5 Test #1: unit_tests ........   Passed    0.02 sec
    2/5 Test #2: integration_tests    Passed    0.15 sec
All tests passed.
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Linker errors fixed | 0 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS: SUCCESS
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `undeclared identifier` | `#include` を追加するかタイポを修正する |
| `no matching function` | 引数の型を修正するかオーバーロードを追加する |
| `undefined reference` | ライブラリをリンクするか実装を追加する |
| `multiple definition` | `inline` を使用するか .cpp に移動する |
| `incomplete type` | 前方宣言を `#include` に置き換える |
| `no member named X` | メンバー名を修正するかインクルードを追加する |
| `cannot convert X to Y` | 適切なキャストを追加する |
| `CMake Error` | CMakeLists.txt の設定を修正する |

## 修正戦略

1. **コンパイルエラーを最初に** - コードはコンパイルされなければならない
2. **リンカーエラーを次に** - 未定義の参照を解決する
3. **警告を三番目に** - `-Wall -Wextra` で修正する
4. **一度に 1 つの修正** - 各変更を検証する
5. **最小限の変更** - リファクタリングせず、修正するだけ

## 停止条件

以下の場合、エージェントは停止して報告する:
- 同じエラーが 3 回試みた後も解決しない
- 修正がより多くのエラーを引き起こす
- アーキテクチャの変更が必要
- 外部依存関係が欠落している

## 関連コマンド

- `/cpp-test` - ビルドが成功した後にテストを実行する
- `/cpp-review` - コードの品質をレビューする
- `verification-loop` スキル - 完全な検証ループ

## 関連

- エージェント: `agents/cpp-build-resolver.md`
- スキル: `skills/cpp-coding-standards/`
