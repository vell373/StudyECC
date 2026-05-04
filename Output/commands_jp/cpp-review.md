---
description: メモリ安全性、モダン C++ イディオム、並行処理、セキュリティのための包括的な C++ コードレビュー。cpp-reviewer エージェントを呼び出します。
---

# C++ コードレビュー

このコマンドは、包括的な C++ 固有のコードレビューのために **cpp-reviewer** エージェントを呼び出します。

## このコマンドが行うこと

1. **C++ 変更を特定**: `git diff` を使用して変更された `.cpp`、`.hpp`、`.cc`、`.h` ファイルを検索
2. **静的解析を実行**: `clang-tidy` と `cppcheck` を実行
3. **メモリ安全性スキャン**: raw new/delete、バッファオーバーフロー、use-after-free をチェック
4. **並行処理レビュー**: スレッド安全性、ミューテックス使用、データ競合を解析
5. **モダン C++ チェック**: コード が C++17/20 規約とベストプラクティスに従うことを確認
6. **レポートを生成**: 重大度別に問題を分類

## いつ使うか

以下の場合に `/cpp-review` を使用：
- C++ コード を書いた、または変更した後
- C++ 変更をコミットする前
- C++ コードでプルリクエストをレビュー
- 新しい C++ コードベースにオンボーディング
- メモリ安全性の問題をチェック

## レビューカテゴリ

### 重大（必須修正）
- RAII なしでの raw `new`/`delete`
- バッファオーバーフロー と use-after-free
- 同期なしでのデータ競合
- `system()` 経由のコマンドインジェクション
- 初期化されていない変数の読み込み
- null ポインター逆参照

### 高（修正推奨）
- Rule of Five 違反
- 不足している `std::lock_guard` / `std::scoped_lock`
- 適切なライフタイム管理なしでのデタッチスレッド
- `static_cast`/`dynamic_cast` の代わりの C スタイルキャスト
- 不足している `const` 正確性

### 中（検討）
- 不要なコピー（`const&` の代わりに値で渡す）
- 既知サイズのコンテナーで不足している `reserve()`
- ヘッダーの `using namespace std;`
- 重要な戻り値に不足している `[[nodiscard]]`
- 過度に複雑なテンプレート メタプログラミング

## 実行される自動チェック

```bash
# 静的解析
clang-tidy --checks='*,-llvmlibc-*' src/*.cpp -- -std=c++17

# 追加分析
cppcheck --enable=all --suppress=missingIncludeSystem src/

# 警告付きでビルド
cmake --build build -- -Wall -Wextra -Wpedantic
```

## 使用例

```text
ユーザー: /cpp-review

エージェント:
# C++ コードレビューレポート

## レビュー済みファイル
- src/handler/user.cpp（変更）
- src/service/auth.cpp（変更）

## 静的解析結果
✓ clang-tidy: 2 つの警告
✓ cppcheck: 問題なし

## 見つかった問題

[重大] メモリリーク
ファイル: src/service/auth.cpp:45
問題: 一致する `delete` なしでの raw `new`
```cpp
auto* session = new Session(userId);  // メモリリーク！
cache[userId] = session;
```
修正: `std::unique_ptr` を使用
```cpp
auto session = std::make_unique<Session>(userId);
cache[userId] = std::move(session);
```

[高] 不足している const 参照
ファイル: src/handler/user.cpp:28
問題: 大きなオブジェクトが値で渡される
```cpp
void processUser(User user) {  // 不要なコピー
```
修正: const 参照で渡す
```cpp
void processUser(const User& user) {
```

## 概要
- 重大: 1
- 高: 1
- 中: 0

推奨: 失敗：CRITICAL 問題が修正されるまでマージをブロック
```

## 承認基準

| ステータス | 条件 |
|--------|-----------|
| 成功：承認 | 重大または高い問題がない |
| 警告：警告 | のみ中程度の問題（注意してマージ） |
| 失敗：ブロック | 重大または高い問題が見つかった |

## 他のコマンドとの統合

- テストが成功することを確認するために最初に `/cpp-test` を使用
- ビルドエラーが発生した場合に `/cpp-build` を使用
- コミット前に `/cpp-review` を使用
- C++ 固有でない懸念については `/code-review` を使用

## 関連

- エージェント: `agents/cpp-reviewer.md`
- スキル: `skills/cpp-coding-standards/`、`skills/cpp-testing/`
