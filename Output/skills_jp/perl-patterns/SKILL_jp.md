---
name: perl-patterns
description: モダンなPerl 5.36+のイディオム、ベストプラクティス、および堅牢でメンテナンスしやすいPerlアプリケーション構築のための規約。
origin: ECC
---

# モダンPerl開発パターン

堅牢でメンテナンスしやすいアプリケーション構築のためのイディオム的Perl 5.36+パターンとベストプラクティス。

## アクティベートするタイミング

- 新しいPerlコードまたはモジュールを書く場合
- イディオム準拠についてPerlコードをレビューする場合
- レガシーPerlをモダンな標準にリファクタリングする場合
- PerlモジュールのアーキテクチャをDesignする場合
- 5.36以前のコードをモダンなPerlに移行する場合

## 動作の仕組み

これらのパターンをモダンなPerl 5.36+デフォルトへのバイアスとして適用する: シグネチャ、明示的なモジュール、焦点を絞ったエラーハンドリング、テスト可能な境界。以下の例は出発点としてコピーすることを想定しており、その後、実際のアプリ、依存スタック、目の前のデプロイモデルに合わせて調整する。

## コア原則

### 1. `v5.36` プラグマを使用する

`use v5.36` 一行で古い定型文を置き換え、strict、warnings、サブルーチンシグネチャを有効にする。

```perl
# 良い例: モダンなプリアンブル
use v5.36;

sub greet($name) {
    say "Hello, $name!";
}

# 悪い例: レガシーの定型文
use strict;
use warnings;
use feature 'say', 'signatures';
no warnings 'experimental::signatures';

sub greet {
    my ($name) = @_;
    say "Hello, $name!";
}
```

### 2. サブルーチンシグネチャ

明確さと自動アリティチェックのためにシグネチャを使用する。

```perl
use v5.36;

# 良い例: デフォルト値付きシグネチャ
sub connect_db($host, $port = 5432, $timeout = 30) {
    # $hostは必須、他はデフォルト値あり
    return DBI->connect("dbi:Pg:host=$host;port=$port", undef, undef, {
        RaiseError => 1,
        PrintError => 0,
    });
}

# 良い例: 可変引数のスラーピーパラメーター
sub log_message($level, @details) {
    say "[$level] " . join(' ', @details);
}

# 悪い例: 手動による引数のアンパック
sub connect_db {
    my ($host, $port, $timeout) = @_;
    $port    //= 5432;
    $timeout //= 30;
    # ...
}
```

### 3. コンテキスト感度

スカラーコンテキストとリストコンテキストを理解する — Perlの中核概念。

```perl
use v5.36;

my @items = (1, 2, 3, 4, 5);

my @copy  = @items;            # リストコンテキスト: 全要素
my $count = @items;            # スカラーコンテキスト: カウント (5)
say "Items: " . scalar @items; # スカラーコンテキストの強制
```

### 4. 後置デリファレンス

ネストした構造での読みやすさのため後置デリファレンス構文を使用する。

```perl
use v5.36;

my $data = {
    users => [
        { name => 'Alice', roles => ['admin', 'user'] },
        { name => 'Bob',   roles => ['user'] },
    ],
};

# 良い例: 後置デリファレンス
my @users = $data->{users}->@*;
my @roles = $data->{users}[0]{roles}->@*;
my %first = $data->{users}[0]->%*;

# 悪い例: 前置デリファレンス (チェーンでは読みにくい)
my @users = @{ $data->{users} };
my @roles = @{ $data->{users}[0]{roles} };
```

### 5. `isa` 演算子 (5.32+)

中置型チェック — `blessed($o) && $o->isa('X')` を置き換える。

```perl
use v5.36;
if ($obj isa 'My::Class') { $obj->do_something }
```

## エラーハンドリング

### eval/die パターン

```perl
use v5.36;

sub parse_config($path) {
    my $content = eval { path($path)->slurp_utf8 };
    die "Config error: $@" if $@;
    return decode_json($content);
}
```

### Try::Tiny (信頼できる例外ハンドリング)

```perl
use v5.36;
use Try::Tiny;

sub fetch_user($id) {
    my $user = try {
        $db->resultset('User')->find($id)
            // die "User $id not found\n";
    }
    catch {
        warn "Failed to fetch user $id: $_";
        undef;
    };
    return $user;
}
```

### ネイティブ try/catch (5.40+)

```perl
use v5.40;

sub divide($x, $y) {
    try {
        die "Division by zero" if $y == 0;
        return $x / $y;
    }
    catch ($e) {
        warn "Error: $e";
        return;
    }
}
```

## Mooによるモダンなオブジェクト指向

軽量でモダンなOOにMooを優先する。メタプロトコルが必要な場合のみMooseを使用する。

```perl
# 良い例: Mooクラス
package User;
use Moo;
use Types::Standard qw(Str Int ArrayRef);
use namespace::autoclean;

has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int, default  => sub { 0 });
has roles => (is => 'ro', isa => ArrayRef[Str], default => sub { [] });

sub is_admin($self) {
    return grep { $_ eq 'admin' } $self->roles->@*;
}

sub greet($self) {
    return "Hello, I'm " . $self->name;
}

1;

# 使用例
my $user = User->new(
    name  => 'Alice',
    email => 'alice@example.com',
    roles => ['admin', 'user'],
);

# 悪い例: ブレスドハッシュリファレンス (バリデーションなし、アクセサなし)
package User;
sub new {
    my ($class, %args) = @_;
    return bless \%args, $class;
}
sub name { return $_[0]->{name} }
1;
```

### Mooロール

```perl
package Role::Serializable;
use Moo::Role;
use JSON::MaybeXS qw(encode_json);
requires 'TO_HASH';
sub to_json($self) { encode_json($self->TO_HASH) }
1;

package User;
use Moo;
with 'Role::Serializable';
has name  => (is => 'ro', required => 1);
has email => (is => 'ro', required => 1);
sub TO_HASH($self) { { name => $self->name, email => $self->email } }
1;
```

### ネイティブ `class` キーワード (5.38+, Corinna)

```perl
use v5.38;
use feature 'class';
no warnings 'experimental::class';

class Point {
    field $x :param;
    field $y :param;
    method magnitude() { sqrt($x**2 + $y**2) }
}

my $p = Point->new(x => 3, y => 4);
say $p->magnitude;  # 5
```

## 正規表現

### 名前付きキャプチャと `/x` フラグ

```perl
use v5.36;

# 良い例: 読みやすさのための /x 付き名前付きキャプチャ
my $log_re = qr{
    ^ (?<timestamp> \d{4}-\d{2}-\d{2} \s \d{2}:\d{2}:\d{2} )
    \s+ \[ (?<level> \w+ ) \]
    \s+ (?<message> .+ ) $
}x;

if ($line =~ $log_re) {
    say "Time: $+{timestamp}, Level: $+{level}";
    say "Message: $+{message}";
}

# 悪い例: 位置キャプチャ (メンテナンスが困難)
if ($line =~ /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(.+)$/) {
    say "Time: $1, Level: $2";
}
```

### コンパイル済みパターン

```perl
use v5.36;

# 良い例: 一度コンパイルして複数回使用
my $email_re = qr/^[A-Za-z0-9._%+-]+\@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

sub validate_emails(@emails) {
    return grep { $_ =~ $email_re } @emails;
}
```

## データ構造

### リファレンスと安全なディープアクセス

```perl
use v5.36;

# ハッシュと配列リファレンス
my $config = {
    database => {
        host => 'localhost',
        port => 5432,
        options => ['utf8', 'sslmode=require'],
    },
};

# 安全なディープアクセス (どのレベルが欠落していてもundefを返す)
my $port = $config->{database}{port};           # 5432
my $missing = $config->{cache}{host};           # undef、エラーなし

# ハッシュスライス
my %subset;
@subset{qw(host port)} = @{$config->{database}}{qw(host port)};

# 配列スライス
my @first_two = $config->{database}{options}->@[0, 1];

# 多変数forループ (5.36では実験的、5.40で安定)
use feature 'for_list';
no warnings 'experimental::for_list';
for my ($key, $val) (%$config) {
    say "$key => $val";
}
```

## ファイルI/O

### 3引数open

```perl
use v5.36;

# 良い例: autodieを使った3引数open (コアモジュール、'or die'が不要)
use autodie;

sub read_file($path) {
    open my $fh, '<:encoding(UTF-8)', $path;
    local $/;
    my $content = <$fh>;
    close $fh;
    return $content;
}

# 悪い例: 2引数open (シェルインジェクションリスク、perl-securityを参照)
open FH, $path;            # 絶対やってはいけない
open FH, "< $path";        # まだ悪い — ユーザーデータがモード文字列に含まれる
```

### ファイル操作にPath::Tiny

```perl
use v5.36;
use Path::Tiny;

my $file = path('config', 'app.json');
my $content = $file->slurp_utf8;
$file->spew_utf8($new_content);

# ディレクトリの反復
for my $child (path('src')->children(qr/\.pl$/)) {
    say $child->basename;
}
```

## モジュール編成

### 標準プロジェクトレイアウト

```text
MyApp/
├── lib/
│   └── MyApp/
│       ├── App.pm           # メインモジュール
│       ├── Config.pm        # 設定
│       ├── DB.pm            # データベース層
│       └── Util.pm          # ユーティリティ
├── bin/
│   └── myapp                # エントリーポイントスクリプト
├── t/
│   ├── 00-load.t            # コンパイルテスト
│   ├── unit/                # ユニットテスト
│   └── integration/         # インテグレーションテスト
├── cpanfile                 # 依存関係
├── Makefile.PL              # ビルドシステム
└── .perlcriticrc            # リントの設定
```

### Exporterパターン

```perl
package MyApp::Util;
use v5.36;
use Exporter 'import';

our @EXPORT_OK   = qw(trim);
our %EXPORT_TAGS = (all => \@EXPORT_OK);

sub trim($str) { $str =~ s/^\s+|\s+$//gr }

1;
```

## ツール

### perltidy設定 (.perltidyrc)

```text
-i=4        # 4スペースインデント
-l=100      # 100文字の行長
-ci=4       # 継続インデント
-ce         # cuddled else
-bar        # 同じ行に開き括弧
-nolq       # 長いクォート文字列をアウトデントしない
```

### perlcritic設定 (.perlcriticrc)

```ini
severity = 3
theme = core + pbp + security

[InputOutput::RequireCheckedSyscalls]
functions = :builtins
exclude_functions = say print

[Subroutines::ProhibitExplicitReturnUndef]
severity = 4

[ValuesAndExpressions::ProhibitMagicNumbers]
allowed_values = 0 1 2 -1
```

### 依存関係管理 (cpanfile + carton)

```bash
cpanm App::cpanminus Carton   # ツールのインストール
carton install                 # cpanfileから依存関係をインストール
carton exec -- perl bin/myapp  # ローカル依存関係で実行
```

```perl
# cpanfile
requires 'Moo', '>= 2.005';
requires 'Path::Tiny';
requires 'JSON::MaybeXS';
requires 'Try::Tiny';

on test => sub {
    requires 'Test2::V0';
    requires 'Test::MockModule';
};
```

## クイックリファレンス: モダンなPerlイディオム

| レガシーパターン | モダンな代替 |
|---|---|
| `use strict; use warnings;` | `use v5.36;` |
| `my ($x, $y) = @_;` | `sub foo($x, $y) { ... }` |
| `@{ $ref }` | `$ref->@*` |
| `%{ $ref }` | `$ref->%*` |
| `open FH, "< $file"` | `open my $fh, '<:encoding(UTF-8)', $file` |
| `blessed hashref` | 型付きの `Moo` クラス |
| `$1, $2, $3` | `$+{name}` (名前付きキャプチャ) |
| `eval { }; if ($@)` | `Try::Tiny` またはネイティブ `try/catch` (5.40+) |
| `BEGIN { require Exporter; }` | `use Exporter 'import';` |
| 手動ファイル操作 | `Path::Tiny` |
| `blessed($o) && $o->isa('X')` | `$o isa 'X'` (5.32+) |
| `builtin::true / false` | `use builtin 'true', 'false';` (5.36+、実験的) |

## アンチパターン

```perl
# 1. 2引数open (セキュリティリスク)
open FH, $filename;                     # 絶対ダメ

# 2. 間接オブジェクト構文 (あいまいなパース)
my $obj = new Foo(bar => 1);            # 悪い
my $obj = Foo->new(bar => 1);           # 良い

# 3. $_ への過度な依存
map { process($_) } grep { validate($_) } @items;  # 追いにくい
my @valid = grep { validate($_) } @items;           # より良い: 分割する
my @results = map { process($_) } @valid;

# 4. strict refsの無効化
no strict 'refs';                        # ほぼ常に間違い
${"My::Package::$var"} = $value;         # 代わりにハッシュを使う

# 5. 設定としてのグローバル変数
our $TIMEOUT = 30;                       # 悪い: 可変グローバル
use constant TIMEOUT => 30;              # より良い: 定数
# 最良: デフォルト値付きのMoo属性

# 6. モジュールロードのための文字列eval
eval "require $module";                  # 悪い: コードインジェクションリスク
eval "use $module";                      # 悪い
use Module::Runtime 'require_module';    # 良い: 安全なモジュールロード
require_module($module);
```

**覚えておくこと**: モダンなPerlはクリーンで読みやすく安全。`use v5.36` に定型文を任せ、オブジェクトにはMooを使い、手製のソリューションよりCPANのバトルテスト済みモジュールを優先する。
