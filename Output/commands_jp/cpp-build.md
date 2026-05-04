---
description: C++ ビルドエラー、CMake の問題、リンカー問題を段階的に修正します。最小限で外科的修正のために cpp-build-resolver エージェントを呼び出します。
---

# C++ ビルドと修正

このコマンドは、**cpp-build-resolver** エージェントを呼び出して、最小限の変更で C++ ビルドエラーを段階的に修正します。

## このコマンドが行うこと

1. **診断を実行**: `cmake --build`、`clang-tidy`、`cppcheck` を実行
2. **エラーを解析**: ファイル別にグループ化し、重大度別にソート
3. **段階的に修正**: 一度に 1 つのエラー
4. **各修正を検証**: 各変更後にビルドを再実行
5. **概要を報告**: 何が修正され、何が残っているかを表示

## いつ使うか

以下の場合に `/cpp-build` を使用：
- `cmake --build build` がエラーで失敗
- リンカーエラー（未定義参照、複数の定義）
- テンプレートのインスタンス化失敗
- インクルード/依存関係の問題
- ビルドを破壊する変更を pull した後

## 実行される診断コマンド

```bash
# CMake 構成
cmake -B build -S .

# ビルド
cmake --build build 2>&1 | head -100

# 静的解析（利用可能な場合）
clang-tidy src/*.cpp -- -std=c++17
cppcheck --enable=all src/
```

## セッション例

```text
ユーザー: /cpp-build

エージェント:
# C++ ビルド解決

## 初期診断

```bash
$ cmake --build build
src/service/user.cpp:25:15: error: use of undeclared identifier 'UserRepository'
src/handler/api.cpp:42:9: error: no matching function for call to 'process'
src/handler/api.cpp:58:1: error: non-void function does not return a value
```

見つかったエラー: 3

## 修正 1: 未宣言識別子

ファイル: src/service/user.cpp:25
エラー: use of undeclared identifier 'UserRepository'
原因: インクルード不足

```cpp
// インクルードを追加
#include "repository/user_repository.hpp"
```

```bash
$ cmake --build build
# 2 つのエラーが残っている
```

## 修正 2: 一致する関数がない

ファイル: src/handler/api.cpp:42
エラー: no matching function for call to 'process'

```cpp
// 変更
process(params.get("count"));
// 対象
process(std::stoi(params.get("count")));
```

```bash
$ cmake --build build
# 1 つのエラーが残っている
```

## 修正 3: 戻り値不足

ファイル: src/handler/api.cpp:58
エラー: non-void function does not return a value

```cpp
std::optional<User> getUser(const std::string& id) {
    if (id.empty()) {
        return std::nullopt;
    }
    auto user = findUser(id);
    // 不足していた戻り値を追加
    return user;
}
```

```bash
$ cmake --build build
# ビルド成功！
```

## 最終検証

```bash
$ ctest --test-dir build --output-on-failure
テストプロジェクト build
    1/5 テスト #1: unit_tests ........   成功    0.02 sec
    2/5 テスト #2: integration_tests    成功    0.15 sec
すべてのテストが成功しました。
```

## 概要

| 指標 | カウント |
|--------|-------|
| 修正されたビルドエラー | 3 |
| 修正されたリンカーエラー | 0 |
| 変更されたファイル | 2 |
| 残っている問題 | 0 |

ビルドステータス: 成功
```

## 修正された一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `undeclared identifier` | `#include` を追加またはタイプミスを修正 |
| `no matching function` | 引数型を修正またはオーバーロードを追加 |
| `undefined reference` | ライブラリをリンクまたは実装を追加 |
| `multiple definition` | `inline` を使用またはファイルに移動 |
| `incomplete type` | フォワード宣言を `#include` に置き換え |
| `no member named X` | メンバー名を修正またはインクルード |
| `cannot convert X to Y` | 適切なキャストを追加 |
| `CMake Error` | CMakeLists.txt の設定を修正 |

## 修正戦略

1. **コンパイルエラー最初** - コードはコンパイルが必須
2. **リンカーエラー次** - 未定義参照を解決
3. **警告三番目** - `-Wall -Wextra` で修正
4. **一度に 1 つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく、修正のみ

## 停止条件

エージェントは以下の場合は停止して報告：
- 同じエラーが 3 回の試行後も残存
- 修正により多くのエラーが導入
- アーキテクチャの変更が必須
- 外部依存関係が不足

## 関連コマンド

- `/cpp-test` - ビルド成功後にテストを実行
- `/cpp-review` - コード品質を確認
- `verification-loop` スキル - 完全な検証ループ

## 関連

- エージェント: `agents/cpp-build-resolver.md`
- スキル: `skills/cpp-coding-standards/`
