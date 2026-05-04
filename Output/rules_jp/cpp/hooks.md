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
# C++ フック

> このファイルは [common/hooks.md](../common/hooks.md) を C++ 固有のコンテンツで拡張します。

## ビルドフック

C++ 変更をコミット前に以下のチェックを実行:

```bash
# フォーマット確認
clang-format --dry-run --Werror src/*.cpp src/*.hpp

# 静的解析
clang-tidy src/*.cpp -- -std=c++17

# ビルド
cmake --build build

# テスト
ctest --test-dir build --output-on-failure
```

## 推奨 CI パイプライン

1. **clang-format** — フォーマットチェック
2. **clang-tidy** — 静的解析
3. **cppcheck** — 追加解析
4. **cmake build** — コンパイル
5. **ctest** — サニタイザー付きテスト実行
