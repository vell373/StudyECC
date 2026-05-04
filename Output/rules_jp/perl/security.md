---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl セキュリティ

> このファイルは [common/security.md](../common/security.md) を Perl 固有のコンテンツで拡張します。

## Taint モード

- すべての CGI/web 向けスクリプトで `-T` フラグを使用
- 外部コマンド前に `%ENV`（`$ENV{PATH}`、`$ENV{CDPATH}` など）をサニタイズ

## 入力検証

- Untaint 用ホワイトリスト regex を使用 — `/(.*)/s` を使用しない
- 明示的パターンですべてのユーザー入力を検証:

```perl
if ($input =~ /\A([a-zA-Z0-9_-]+)\z/) {
    my $clean = $1;
}
```

## ファイル I/O

- **3 引数 open のみ** — 2 引数 open を使用しない
- `Cwd::realpath` でパストラバーサルを防止:

```perl
use Cwd 'realpath';
my $safe_path = realpath($user_path);
die "Path traversal" unless $safe_path =~ m{\A/allowed/directory/};
```

## プロセス実行

- **リスト形式 `system()`** を使用 — 単一文字列形式を使用しない
- 出力キャプチャに **IPC::Run3** を使用
- 変数展開でバッククォートを使用しない

```perl
system('grep', '-r', $pattern, $directory);  # safe
```

## SQL インジェクション防止

常に DBI プレースホルダを使用 — SQL に補間しない:

```perl
my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
$sth->execute($email);
```

## セキュリティスキャン

**perlcritic** を security テーマで severity 4+ で実行:

```bash
perlcritic --severity 4 --theme security lib/
```

## リファレンス

スキル `perl-security` で包括的な Perl セキュリティパターン、taint モード、セキュアな I/O を参照。
