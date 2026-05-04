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
# C++ パターン

> このファイルは [common/patterns.md](../common/patterns.md) を C++ 固有のコンテンツで拡張します。

## RAII（リソース取得は初期化）

リソースのライフタイムをオブジェクトのライフタイムに結合:

```cpp
class FileHandle {
public:
    explicit FileHandle(const std::string& path) : file_(std::fopen(path.c_str(), "r")) {}
    ~FileHandle() { if (file_) std::fclose(file_); }
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
private:
    std::FILE* file_;
};
```

## ルールオブファイブ/ゼロ

- **ルールオブゼロ**: カスタムデストラクタ、コピー/ムーブコンストラクタ、または代入が不要なクラスを優先
- **ルールオブファイブ**: デストラクタ/コピーコンストラクタ/コピー代入/ムーブコンストラクタ/ムーブ代入のいずれかを定義する場合、5つすべてを定義する

## 値セマンティクス

- 小さい/自明な型は値で渡す
- 大きい型は `const&` で渡す
- 値で返す（RVO/NRVOに頼る）
- シンクパラメータにはムーブセマンティクスを使用

## エラーハンドリング

- 例外的な状況には例外を使用
- 存在しない可能性のある値には `std::optional` を使用
- 予期される失敗には `std::expected`（C++23）または結果型を使用

## リファレンス

スキル: `cpp-coding-standards` を参照して、包括的な C++ パターンとアンチパターンを確認してください。
