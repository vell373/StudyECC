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
# C++ コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を C++ 固有のコンテンツで拡張します。

## モダン C++（C++17/20/23）

- C スタイルの構成よりモダン C++ フィーチャーを優先
- 型がコンテキストから明白な場合は `auto` を使用
- コンパイル時定数には `constexpr` を使用
- 構造化バインディングを使用: `auto [key, value] = map_entry;`

## リソース管理

- **RAII を至る所で使用** — 手動の `new`/`delete` なし
- 排他的所有権には `std::unique_ptr` を使用
- 共有所有権が本当に必要な場合のみ `std::shared_ptr` を使用
- 生の `new` より `std::make_unique` / `std::make_shared` を使用

## 命名規則

- 型/クラス: `PascalCase`
- 関数/メソッド: `snake_case` または `camelCase`（プロジェクト規則に従う）
- 定数: `kPascalCase` または `UPPER_SNAKE_CASE`
- 名前空間: `lowercase`
- メンバ変数: `snake_case_`（後ろのアンダースコア）または `m_` プレフィックス

## フォーマット

- **clang-format** を使用 — スタイル議論なし
- コミット前に `clang-format -i <file>` を実行

## リファレンス

スキル: `cpp-coding-standards` を参照して、包括的な C++ コーディング標準とガイドラインを確認してください。
