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
# C++ セキュリティ

> このファイルは [common/security.md](../common/security.md) を C++ 固有のコンテンツで拡張します。

## メモリセーフティ

- 生の `new`/`delete` を使用しない — スマートポインタを使用
- C スタイル配列を使用しない — `std::array` または `std::vector` を使用
- `malloc`/`free` を使用しない — C++ 割り当てを使用
- 絶対に必要な場合を除き `reinterpret_cast` を避ける

## バッファオーバーフロー

- `char*` より `std::string` を使用
- 安全が重要な場合は `.at()` で境界チェック済みアクセスを使用
- `strcpy`、`strcat`、`sprintf` を使用しない — `std::string` または `fmt::format` を使用

## 未定義の動作

- 常に変数を初期化
- 符号付き整数オーバーフローを避ける
- ヌルまたはダングリングポインタを逆参照しない
- CI でサニタイザーを使用:
  ```bash
  cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..
  ```

## 静的解析

- 自動チェック用に **clang-tidy** を使用:
  ```bash
  clang-tidy --checks='*' src/*.cpp
  ```
- 追加解析用に **cppcheck** を使用:
  ```bash
  cppcheck --enable=all src/
  ```

## リファレンス

スキル: `cpp-coding-standards` を参照して、詳細なセキュリティガイドラインを確認してください。
