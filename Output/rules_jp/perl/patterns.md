---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Perl パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Perl 固有のコンテンツで拡張します。

## リポジトリパターン

インターフェース背後で **DBI** または **DBIx::Class** を使用:

```perl
package MyApp::Repo::User;
use Moo;

has dbh => (is => 'ro', required => 1);

sub find_by_id ($self, $id) {
    my $sth = $self->dbh->prepare('SELECT * FROM users WHERE id = ?');
    $sth->execute($id);
    return $sth->fetchrow_hashref;
}
```

## DTO / 値オブジェクト

**Types::Standard** を持つ **Moo** クラスを使用（Python dataclass 相当）:

```perl
package MyApp::DTO::User;
use Moo;
use Types::Standard qw(Str Int);

has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int);
```

## リソース管理

- 常に `autodie` を持つ **3 引数 open** を使用
- ファイル操作に **Path::Tiny** を使用

```perl
use autodie;
use Path::Tiny;

my $content = path('config.json')->slurp_utf8;
```

## モジュールインターフェース

`@EXPORT_OK` で `Exporter 'import'` を使用 — `@EXPORT` を使用しない:

```perl
use Exporter 'import';
our @EXPORT_OK = qw(parse_config validate_input);
```

## 依存性管理

再現可能なインストール用に **cpanfile** + **carton** を使用:

```bash
carton install
carton exec prove -lr t/
```

## リファレンス

スキル `perl-patterns` で包括的なモダン Perl パターンと idiom を参照。
