---
name: perl-security
description: Perlのtaintモード、入力バリデーション、安全なプロセス実行、DBIパラメータ化クエリ、Webセキュリティ（XSS/SQLi/CSRF）、perlcriticセキュリティポリシーを網羅するPerlセキュリティパターン。
origin: ECC
---

# Perlセキュリティパターン

入力バリデーション、インジェクション防止、安全なコーディングプラクティスを網羅するPerlアプリケーションの包括的なセキュリティガイドライン。

## アクティベートするタイミング

- Perlアプリケーションでユーザー入力を処理する場合
- Perl Webアプリケーションの構築 (CGI, Mojolicious, Dancer2, Catalyst)
- セキュリティ脆弱性のためのPerlコードレビュー
- ユーザーが指定したパスを使ったファイル操作
- PerlからのシステムコマンドExecution
- DBIデータベースクエリの作成

## 動作の仕組み

taint対応の入力境界から始め、外側に向かって進む: 入力のバリデーションとuntaint、ファイルシステムとプロセス実行の制限、そしてDBI パラメータ化クエリを全箇所で使用する。以下の例は、ユーザー入力、シェル、ネットワークに触れるPerlコードを出荷する前に適用すべき安全なデフォルトを示す。

## Taintモード

Perlのtaintモード (`-T`) は外部ソースからのデータを追跡し、明示的なバリデーションなしにそれが安全でない操作に使用されることを防ぐ。

### Taintモードの有効化

```perl
#!/usr/bin/perl -T
use v5.36;

# Tainted: プログラム外部からのすべてのもの
my $input    = $ARGV[0];        # Tainted
my $env_path = $ENV{PATH};      # Tainted
my $form     = <STDIN>;         # Tainted
my $query    = $ENV{QUERY_STRING}; # Tainted

# 早期にPATHをサニタイズする (taintモードでは必須)
$ENV{PATH} = '/usr/local/bin:/usr/bin:/bin';
delete @ENV{qw(IFS CDPATH ENV BASH_ENV)};
```

### Untaintingパターン

```perl
use v5.36;

# 良い例: 特定の正規表現でバリデートしてuntaint
sub untaint_username($input) {
    if ($input =~ /^([a-zA-Z0-9_]{3,30})$/) {
        return $1;  # $1はuntainted
    }
    die "Invalid username: must be 3-30 alphanumeric characters\n";
}

# 良い例: ファイルパスをバリデートしてuntaint
sub untaint_filename($input) {
    if ($input =~ m{^([a-zA-Z0-9._-]+)$}) {
        return $1;
    }
    die "Invalid filename: contains unsafe characters\n";
}

# 悪い例: 過度に寛容なuntainting (目的を損なう)
sub bad_untaint($input) {
    $input =~ /^(.*)$/s;
    return $1;  # すべてを受け入れる — 無意味
}
```

## 入力バリデーション

### ブロックリストよりアローリスト

```perl
use v5.36;

# 良い例: アローリスト — 許可する内容を正確に定義
sub validate_sort_field($field) {
    my %allowed = map { $_ => 1 } qw(name email created_at updated_at);
    die "Invalid sort field: $field\n" unless $allowed{$field};
    return $field;
}

# 良い例: 特定のパターンでバリデート
sub validate_email($email) {
    if ($email =~ /^([a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) {
        return $1;
    }
    die "Invalid email address\n";
}

sub validate_integer($input) {
    if ($input =~ /^(-?\d{1,10})$/) {
        return $1 + 0;  # 数値に変換
    }
    die "Invalid integer\n";
}

# 悪い例: ブロックリスト — 常に不完全
sub bad_validate($input) {
    die "Invalid" if $input =~ /[<>"';&|]/;  # エンコードされた攻撃を見逃す
    return $input;
}
```

### 長さ制約

```perl
use v5.36;

sub validate_comment($text) {
    die "Comment is required\n"        unless length($text) > 0;
    die "Comment exceeds 10000 chars\n" if length($text) > 10_000;
    return $text;
}
```

## 安全な正規表現

### ReDoS防止

カタストロフィックなバックトラッキングは、重複するパターンのネストした数量子で発生する。

```perl
use v5.36;

# 悪い例: ReDoSに脆弱 (指数関数的なバックトラッキング)
my $bad_re = qr/^(a+)+$/;           # ネストした数量子
my $bad_re2 = qr/^([a-zA-Z]+)*$/;   # クラスのネストした数量子
my $bad_re3 = qr/^(.*?,){10,}$/;    # 繰り返しの貪欲/非貪欲の組み合わせ

# 良い例: ネストなしで書き直す
my $good_re = qr/^a+$/;             # 単一の数量子
my $good_re2 = qr/^[a-zA-Z]+$/;     # クラスの単一の数量子

# 良い例: バックトラッキングを防ぐ所有的数量子またはアトミックグループを使用
my $safe_re = qr/^[a-zA-Z]++$/;             # 所有的 (5.10+)
my $safe_re2 = qr/^(?>a+)$/;                # アトミックグループ

# 良い例: 信頼できないパターンにタイムアウトを強制
use POSIX qw(alarm);
sub safe_match($string, $pattern, $timeout = 2) {
    my $matched;
    eval {
        local $SIG{ALRM} = sub { die "Regex timeout\n" };
        alarm($timeout);
        $matched = $string =~ $pattern;
        alarm(0);
    };
    alarm(0);
    die $@ if $@;
    return $matched;
}
```

## 安全なファイル操作

### 3引数open

```perl
use v5.36;

# 良い例: 3引数open、レキシカルファイルハンドル、戻り値チェック
sub read_file($path) {
    open my $fh, '<:encoding(UTF-8)', $path
        or die "Cannot open '$path': $!\n";
    local $/;
    my $content = <$fh>;
    close $fh;
    return $content;
}

# 悪い例: ユーザーデータを使った2引数open (コマンドインジェクション)
sub bad_read($path) {
    open my $fh, $path;        # $pathが "|rm -rf /" の場合、コマンドが実行される！
    open my $fh, "< $path";   # シェルメタキャラクターインジェクション
}
```

### TOCTOU防止とパストラバーサル

```perl
use v5.36;
use Fcntl qw(:DEFAULT :flock);
use File::Spec;
use Cwd qw(realpath);

# アトミックなファイル作成
sub create_file_safe($path) {
    sysopen(my $fh, $path, O_WRONLY | O_CREAT | O_EXCL, 0600)
        or die "Cannot create '$path': $!\n";
    return $fh;
}

# パスが許可されたディレクトリ内に留まることをバリデート
sub safe_path($base_dir, $user_path) {
    my $real = realpath(File::Spec->catfile($base_dir, $user_path))
        // die "Path does not exist\n";
    my $base_real = realpath($base_dir)
        // die "Base dir does not exist\n";
    die "Path traversal blocked\n" unless $real =~ /^\Q$base_real\E(?:\/|\z)/;
    return $real;
}
```

一時ファイルには `File::Temp` を使い (`tempfile(UNLINK => 1)`)、競合状態を防ぐために `flock(LOCK_EX)` を使用する。

## 安全なプロセス実行

### リスト形式のsystemとexec

```perl
use v5.36;

# 良い例: リスト形式 — シェルの補間なし
sub run_command(@cmd) {
    system(@cmd) == 0
        or die "Command failed: @cmd\n";
}

run_command('grep', '-r', $user_pattern, '/var/log/app/');

# 良い例: IPC::Run3で安全に出力をキャプチャ
use IPC::Run3;
sub capture_output(@cmd) {
    my ($stdout, $stderr);
    run3(\@cmd, \undef, \$stdout, \$stderr);
    if ($?) {
        die "Command failed (exit $?): $stderr\n";
    }
    return $stdout;
}

# 悪い例: 文字列形式 — シェルインジェクション！
sub bad_search($pattern) {
    system("grep -r '$pattern' /var/log/app/");  # $patternが "'; rm -rf / #" の場合
}

# 悪い例: 補間付きバッククォート
my $output = `ls $user_dir`;   # シェルインジェクションリスク
```

外部コマンドからのstdout/stderrを安全にキャプチャするために `Capture::Tiny` も使用できる。

## SQLインジェクション防止

### DBIプレースホルダー

```perl
use v5.36;
use DBI;

my $dbh = DBI->connect($dsn, $user, $pass, {
    RaiseError => 1,
    PrintError => 0,
    AutoCommit => 1,
});

# 良い例: パラメータ化クエリ — 常にプレースホルダーを使用
sub find_user($dbh, $email) {
    my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
    $sth->execute($email);
    return $sth->fetchrow_hashref;
}

sub search_users($dbh, $name, $status) {
    my $sth = $dbh->prepare(
        'SELECT * FROM users WHERE name LIKE ? AND status = ? ORDER BY name'
    );
    $sth->execute("%$name%", $status);
    return $sth->fetchall_arrayref({});
}

# 悪い例: SQLへの文字列補間 (SQLiの脆弱性！)
sub bad_find($dbh, $email) {
    my $sth = $dbh->prepare("SELECT * FROM users WHERE email = '$email'");
    # $emailが "' OR 1=1 --" の場合、全ユーザーを返す
    $sth->execute;
    return $sth->fetchrow_hashref;
}
```

### 動的カラムのアローリスト

```perl
use v5.36;

# 良い例: アローリストに対してカラム名をバリデート
sub order_by($dbh, $column, $direction) {
    my %allowed_cols = map { $_ => 1 } qw(name email created_at);
    my %allowed_dirs = map { $_ => 1 } qw(ASC DESC);

    die "Invalid column: $column\n"    unless $allowed_cols{$column};
    die "Invalid direction: $direction\n" unless $allowed_dirs{uc $direction};

    my $sth = $dbh->prepare("SELECT * FROM users ORDER BY $column $direction");
    $sth->execute;
    return $sth->fetchall_arrayref({});
}

# 悪い例: ユーザーが選んだカラムを直接補間
sub bad_order($dbh, $column) {
    $dbh->prepare("SELECT * FROM users ORDER BY $column");  # SQLi！
}
```

### DBIx::Class (ORM安全性)

```perl
use v5.36;

# DBIx::Classは安全なパラメータ化クエリを生成する
my @users = $schema->resultset('User')->search({
    status => 'active',
    email  => { -like => '%@example.com' },
}, {
    order_by => { -asc => 'name' },
    rows     => 50,
});
```

## Webセキュリティ

### XSS防止

```perl
use v5.36;
use HTML::Entities qw(encode_entities);
use URI::Escape qw(uri_escape_utf8);

# 良い例: HTMLコンテキスト用に出力をエンコード
sub safe_html($user_input) {
    return encode_entities($user_input);
}

# 良い例: URLコンテキスト用にエンコード
sub safe_url_param($value) {
    return uri_escape_utf8($value);
}

# 良い例: JSONコンテキスト用にエンコード
use JSON::MaybeXS qw(encode_json);
sub safe_json($data) {
    return encode_json($data);  # エスケープを処理する
}

# テンプレートの自動エスケープ (Mojolicious)
# <%= $user_input %>   — 自動エスケープ (安全)
# <%== $raw_html %>    — 生の出力 (危険、信頼できるコンテンツにのみ使用)

# テンプレートの自動エスケープ (Template Toolkit)
# [% user_input | html %]  — 明示的なHTMLエンコード

# 悪い例: HTMLへの生の出力
sub bad_html($input) {
    print "<div>$input</div>";  # $inputに<script>が含まれるとXSS
}
```

### CSRF保護

```perl
use v5.36;
use Crypt::URandom qw(urandom);
use MIME::Base64 qw(encode_base64url);

sub generate_csrf_token() {
    return encode_base64url(urandom(32));
}
```

トークンを検証するときは定数時間比較を使用する。ほとんどのWebフレームワーク (Mojolicious, Dancer2, Catalyst) には組み込みのCSRF保護が含まれている — 手製のソリューションよりそれらを優先する。

### セッションとヘッダーセキュリティ

```perl
use v5.36;

# Mojoliciousセッション + ヘッダー
$app->secrets(['long-random-secret-rotated-regularly']);
$app->sessions->secure(1);          # HTTPSのみ
$app->sessions->samesite('Lax');

$app->hook(after_dispatch => sub ($c) {
    $c->res->headers->header('X-Content-Type-Options' => 'nosniff');
    $c->res->headers->header('X-Frame-Options'        => 'DENY');
    $c->res->headers->header('Content-Security-Policy' => "default-src 'self'");
    $c->res->headers->header('Strict-Transport-Security' => 'max-age=31536000; includeSubDomains');
});
```

## 出力エンコード

コンテキストに合わせて出力を常にエンコードする: HTMLには `HTML::Entities::encode_entities()`、URLには `URI::Escape::uri_escape_utf8()`、JSONには `JSON::MaybeXS::encode_json()`。

## CPANモジュールセキュリティ

- **バージョンを固定する** cpanfileで: `requires 'DBI', '== 1.643';`
- **メンテナンスされているモジュールを優先する**: MetaCPANで最近のリリースを確認する
- **依存関係を最小限にする**: 各依存関係は攻撃面

## セキュリティツール

### perlcriticセキュリティポリシー

```ini
# .perlcriticrc — セキュリティ重視の設定
severity = 3
theme = security + core

# 3引数openを要求
[InputOutput::RequireThreeArgOpen]
severity = 5

# チェックされたシステムコールを要求
[InputOutput::RequireCheckedSyscalls]
functions = :builtins
severity = 4

# 文字列evalを禁止
[BuiltinFunctions::ProhibitStringyEval]
severity = 5

# バッククォート演算子を禁止
[InputOutput::ProhibitBacktickOperators]
severity = 4

# CGIでtaintチェックを要求
[Modules::RequireTaintChecking]
severity = 5

# 2引数openを禁止
[InputOutput::ProhibitTwoArgOpen]
severity = 5

# 裸語ファイルハンドルを禁止
[InputOutput::ProhibitBarewordFileHandles]
severity = 5
```

### perlcriticの実行

```bash
# ファイルをチェック
perlcritic --severity 3 --theme security lib/MyApp/Handler.pm

# プロジェクト全体をチェック
perlcritic --severity 3 --theme security lib/

# CI統合
perlcritic --severity 4 --theme security --quiet lib/ || exit 1
```

## クイックセキュリティチェックリスト

| チェック | 確認内容 |
|---|---|
| Taintモード | CGI/Webスクリプトの `-T` フラグ |
| 入力バリデーション | アローリストパターン、長さ制限 |
| ファイル操作 | 3引数open、パストラバーサルチェック |
| プロセス実行 | リスト形式system、シェル補間なし |
| SQLクエリ | DBIプレースホルダー、補間しない |
| HTML出力 | `encode_entities()`、テンプレート自動エスケープ |
| CSRFトークン | 生成済み、状態変更リクエストで検証 |
| セッション設定 | Secure, HttpOnly, SameSite Cookie |
| HTTPヘッダー | CSP, X-Frame-Options, HSTS |
| 依存関係 | バージョン固定、監査済みモジュール |
| Regex安全性 | ネストした数量子なし、アンカー付きパターン |
| エラーメッセージ | スタックトレースやパスをユーザーに漏らさない |

## アンチパターン

```perl
# 1. ユーザーデータを使った2引数open (コマンドインジェクション)
open my $fh, $user_input;               # クリティカルな脆弱性

# 2. 文字列形式system (シェルインジェクション)
system("convert $user_file output.png"); # クリティカルな脆弱性

# 3. SQL文字列補間
$dbh->do("DELETE FROM users WHERE id = $id");  # SQLi

# 4. ユーザー入力でeval (コードインジェクション)
eval $user_code;                         # リモートコード実行

# 5. サニタイズせずに$ENVを信頼する
my $path = $ENV{UPLOAD_DIR};             # 操作される可能性がある
system("ls $path");                      # 二重の脆弱性

# 6. バリデーションなしにtaintを無効化
($input) = $input =~ /(.*)/s;           # 怠惰なuntaint — 目的を損なう

# 7. HTMLへの生のユーザーデータ
print "<div>Welcome, $username!</div>";  # XSS

# 8. バリデートされていないリダイレクト
print $cgi->redirect($user_url);         # オープンリダイレクト
```

**覚えておくこと**: Perlの柔軟性は強力だが規律が必要。Webに面したコードにはtaintモードを使い、アローリストで全入力をバリデートし、全クエリにDBIプレースホルダーを使い、コンテキストに合わせて全出力をエンコードする。多層防御 — 単一の層に依存しない。
