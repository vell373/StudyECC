---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl テスト

> このファイルは [common/testing.md](../common/testing.md) を Perl 固有のコンテンツで拡張します。

## フレームワーク

新しいプロジェクトに **Test2::V0** を使用（Test::More ではなく）:

```perl
use Test2::V0;

is($result, 42, 'answer is correct');

done_testing;
```

## ランナー

```bash
prove -l t/              # adds lib/ to @INC
prove -lr -j8 t/         # recursive, 8 parallel jobs
```

常に `-l` を使用して `lib/` が `@INC` に含まれていることを確認。

## カバレッジ

**Devel::Cover** を使用 — 80%+ をターゲット:

```bash
cover -test
```

## モック

- **Test::MockModule** — 既存モジュール上メソッドをモック
- **Test::MockObject** — テストダブルをスクラッチから作成

## ピットフォール

- テストファイルを常に `done_testing` で終了
- `prove` で `-l` フラグを忘れない

## リファレンス

スキル `perl-testing` で Test2::V0、prove、Devel::Cover を持つ詳細な Perl TDD パターンを参照。
