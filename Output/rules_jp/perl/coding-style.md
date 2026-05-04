---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Perl 固有のコンテンツで拡張します。

## 標準

- 常に `use v5.36`（`strict`、`warnings`、`say`、サブルーチンシグネチャを有効化）
- サブルーチンシグネチャを使用 — 手動で `@_` をアンパックしない
- `print` に明示的な改行より `say` を優先

## イミュータビリティ

- すべてのアトリビュートに `is => 'ro'` と `Types::Standard` を持つ **Moo** を使用
- blessed hashref を直接使用しない — 常に Moo/Moose アクセッサを使用
- **OO 上書きノート**: Moo `has` アトリビュート with `builder` または `default` は計算読み取り専用値に適切

## フォーマット

以下の設定で **perltidy** を使用:

```
-i=4    # 4 スペースインデント
-l=100  # 100 文字行長
-ce     # cuddled else
-bar    # opening brace always right
```

## リント

**perlcritic** を severity 3 で使用、テーマ: `core`、`pbp`、`security`。

```bash
perlcritic --severity 3 --theme 'core || pbp || security' lib/
```

## リファレンス

スキル `perl-patterns` で包括的なモダン Perl idiom とベストプラクティスを参照。
