---
description: メモリ安全性、モダン C++ イディオム、並行性、セキュリティの包括的な C++ コードレビュー。cpp-reviewer エージェントを呼び出す。
---

# C++ Code Review

このコマンドは **cpp-reviewer** エージェントを呼び出して、C++ 固有の包括的なコードレビューを行う。

## このコマンドが行うこと

1. **C++ の変更を特定する**: `git diff` で変更された `.cpp`、`.hpp`、`.cc`、`.h` ファイルを見つける
2. **静的解析を実行する**: `clang-tidy` と `cppcheck` を実行する
3. **メモリ安全性スキャン**: 生の new/delete、バッファオーバーフロー、use-after-free を確認する
4. **並行性レビュー**: スレッドセーフ性、ミューテックスの使用、データ競合を分析する
5. **モダン C++ チェック**: コードが C++17/20 の規約とベストプラクティスに従っているか確認する
6. **レポートを生成する**: 問題を重大度別に分類する

## 使用する場面

`/cpp-review` を使用する場合:
- C++ コードを書いたり変更した後
- C++ の変更をコミットする前
- C++ コードを含むプルリクエストをレビューする
- 新しい C++ コードベースにオンボーディングする
- メモリ安全性の問題を確認する

## レビューカテゴリ

### CRITICAL（修正必須）
- RAII なしの生の `new`/`delete`
- バッファオーバーフローと use-after-free
- 同期なしのデータ競合
- `system()` を通じたコマンドインジェクション
- 初期化されていない変数の読み取り
- ヌルポインタの逆参照

### HIGH（修正すべき）
- Rule of Five の違反
- `std::lock_guard` / `std::scoped_lock` の欠落
- 適切なライフタイム管理のないデタッチされたスレッド
- `static_cast`/`dynamic_cast` の代わりに C スタイルのキャスト
- `const` 正確性の欠落

### MEDIUM（検討を要する）
- 不必要なコピー（`const&` の代わりに値渡し）
- サイズが既知のコンテナに対する `reserve()` の欠落
- ヘッダーでの `using namespace std;`
- 重要な戻り値への `[[nodiscard]]` の欠落
- 過度に複雑なテンプレートメタプログラミング

## 実行される自動チェック

```bash
# 静的解析
clang-tidy --checks='*,-llvmlibc-*' src/*.cpp -- -std=c++17

# 追加解析
cppcheck --enable=all --suppress=missingIncludeSystem src/

# 警告付きビルド
cmake --build build -- -Wall -Wextra -Wpedantic
```

## 使用例

```text
User: /cpp-review

Agent:
# C++ Code Review Report

## Files Reviewed
- src/handler/user.cpp (modified)
- src/service/auth.cpp (modified)

## Static Analysis Results
✓ clang-tidy: 2 warnings
✓ cppcheck: No issues

## Issues Found

[CRITICAL] Memory Leak
File: src/service/auth.cpp:45
Issue: Raw `new` without matching `delete`
```cpp
auto* session = new Session(userId);  // Memory leak!
cache[userId] = session;
```
Fix: Use `std::unique_ptr`
```cpp
auto session = std::make_unique<Session>(userId);
cache[userId] = std::move(session);
```

[HIGH] Missing const Reference
File: src/handler/user.cpp:28
Issue: Large object passed by value
```cpp
void processUser(User user) {  // Unnecessary copy
```
Fix: Pass by const reference
```cpp
void processUser(const User& user) {
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
```

## 承認基準

| ステータス | 条件 |
|--------|-----------|
| PASS: 承認 | CRITICAL または HIGH の問題なし |
| WARNING: 警告 | MEDIUM の問題のみ（注意してマージ） |
| FAIL: ブロック | CRITICAL または HIGH の問題が発見された |

## 他のコマンドとの連携

- テストが通ることを確認するために最初に `/cpp-test` を使用する
- ビルドエラーが発生した場合は `/cpp-build` を使用する
- コミットする前に `/cpp-review` を使用する
- C++ 固有でない懸念については `/code-review` を使用する

## 関連

- エージェント: `agents/cpp-reviewer.md`
- スキル: `skills/cpp-coding-standards/`、`skills/cpp-testing/`
