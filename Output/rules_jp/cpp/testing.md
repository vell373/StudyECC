---
paths:
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cc"
  - "**/*.hh"
  - "**/*.cxx"
  - "**/*.h"
  - "**/CMakeLists.txt"
---
# C++ テスト

> このファイルは [common/testing.md](../common/testing.md) を C++ 固有のコンテンツで拡張します。

## フレームワーク

**GoogleTest**（gtest/gmock）と **CMake/CTest** を使用します。

## テスト実行

```bash
cmake --build build && ctest --test-dir build --output-on-failure
```

## カバレッジ

```bash
cmake -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage" ..
cmake --build .
ctest --output-on-failure
lcov --capture --directory . --output-file coverage.info
```

## サニタイザー

常に CI でサニタイザー付きテストを実行:

```bash
cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..
```

## リファレンス

スキル: `cpp-testing` を参照して、詳細な C++ テストパターン、TDD ワークフロー、GoogleTest/GMock の使用法を確認してください。
