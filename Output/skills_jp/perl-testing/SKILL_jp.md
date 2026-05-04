---
name: perl-testing
description: Test2::V0、Test::More、proveランナー、モッキング、Devel::Coverによるカバレッジ、TDD方法論を使用したPerlテストパターン。
origin: ECC
---

# Perlテストパターン

Test2::V0、Test::More、prove、TDD方法論を使用したPerlアプリケーションの包括的なテスト戦略。

## アクティベートするタイミング

- 新しいPerlコードを書く場合 (TDDに従う: red, green, refactor)
- PerlモジュールまたはアプリケーションのテストスイートをDesignする場合
- Perlのテストカバレッジをレビューする場合
- Perlのテストインフラをセットアップする場合
- Test::MoreからTest2::V0にテストを移行する場合
- 失敗しているPerlテストのデバッグ

## TDDワークフロー

常にRED-GREEN-REFACTORサイクルに従う。

```perl
# ステップ1: RED — 失敗するテストを書く
# t/unit/calculator.t
use v5.36;
use Test2::V0;

use lib 'lib';
use Calculator;

subtest 'addition' => sub {
    my $calc = Calculator->new;
    is($calc->add(2, 3), 5, 'adds two numbers');
    is($calc->add(-1, 1), 0, 'handles negatives');
};

done_testing;

# ステップ2: GREEN — 最小限の実装を書く
# lib/Calculator.pm
package Calculator;
use v5.36;
use Moo;

sub add($self, $a, $b) {
    return $a + $b;
}

1;

# ステップ3: REFACTOR — テストがグリーンの状態を保ちながら改善する
# 実行: prove -lv t/unit/calculator.t
```

## Test::More の基礎

標準Perlテストモジュール — 広く使用され、コアと一緒に出荷される。

### 基本アサーション

```perl
use v5.36;
use Test::More;

# 事前にプランするか done_testing を使用
# plan tests => 5;  # 固定プラン (任意)

# 等値
is($result, 42, 'returns correct value');
isnt($result, 0, 'not zero');

# ブール
ok($user->is_active, 'user is active');
ok(!$user->is_banned, 'user is not banned');

# ディープ比較
is_deeply(
    $got,
    { name => 'Alice', roles => ['admin'] },
    'returns expected structure'
);

# パターンマッチング
like($error, qr/not found/i, 'error mentions not found');
unlike($output, qr/password/, 'output hides password');

# 型チェック
isa_ok($obj, 'MyApp::User');
can_ok($obj, 'save', 'delete');

done_testing;
```

### SKIPとTODO

```perl
use v5.36;
use Test::More;

# 条件付きでテストをスキップ
SKIP: {
    skip 'No database configured', 2 unless $ENV{TEST_DB};

    my $db = connect_db();
    ok($db->ping, 'database is reachable');
    is($db->version, '15', 'correct PostgreSQL version');
}

# 予期される失敗をマーク
TODO: {
    local $TODO = 'Caching not yet implemented';
    is($cache->get('key'), 'value', 'cache returns value');
}

done_testing;
```

## Test2::V0 モダンフレームワーク

Test2::V0はTest::Moreのモダンな代替 — リッチなアサーション、より良い診断、拡張可能。

### なぜTest2なのか

- ハッシュ/配列ビルダーによる優れたディープ比較
- 失敗時のより良い診断出力
- クリーンなスコープのサブテスト
- Test2::Tools::* プラグインで拡張可能
- Test::Moreテストとの下位互換性

### ビルダーによるディープ比較

```perl
use v5.36;
use Test2::V0;

# ハッシュビルダー — 部分的な構造をチェック
is(
    $user->to_hash,
    hash {
        field name  => 'Alice';
        field email => match(qr/\@example\.com$/);
        field age   => validator(sub { $_ >= 18 });
        # 他のフィールドは無視
        etc();
    },
    'user has expected fields'
);

# 配列ビルダー
is(
    $result,
    array {
        item 'first';
        item match(qr/^second/);
        item DNE();  # Does Not Exist — 余分なアイテムがないことを確認
    },
    'result matches expected list'
);

# バッグ — 順序に依存しない比較
is(
    $tags,
    bag {
        item 'perl';
        item 'testing';
        item 'tdd';
    },
    'has all required tags regardless of order'
);
```

### サブテスト

```perl
use v5.36;
use Test2::V0;

subtest 'User creation' => sub {
    my $user = User->new(name => 'Alice', email => 'alice@example.com');
    ok($user, 'user object created');
    is($user->name, 'Alice', 'name is set');
    is($user->email, 'alice@example.com', 'email is set');
};

subtest 'User validation' => sub {
    my $warnings = warns {
        User->new(name => '', email => 'bad');
    };
    ok($warnings, 'warns on invalid data');
};

done_testing;
```

### Test2での例外テスト

```perl
use v5.36;
use Test2::V0;

# コードがdieすることをテスト
like(
    dies { divide(10, 0) },
    qr/Division by zero/,
    'dies on division by zero'
);

# コードがliveすることをテスト
ok(lives { divide(10, 2) }, 'division succeeds') or note($@);

# 組み合わせパターン
subtest 'error handling' => sub {
    ok(lives { parse_config('valid.json') }, 'valid config parses');
    like(
        dies { parse_config('missing.json') },
        qr/Cannot open/,
        'missing file dies with message'
    );
};

done_testing;
```

## テストの編成とprove

### ディレクトリ構造

```text
t/
├── 00-load.t              # モジュールがコンパイルされることを確認
├── 01-basic.t             # コア機能
├── unit/
│   ├── config.t           # モジュール別ユニットテスト
│   ├── user.t
│   └── util.t
├── integration/
│   ├── database.t
│   └── api.t
├── lib/
│   └── TestHelper.pm      # 共有テストユーティリティ
└── fixtures/
    ├── config.json        # テストデータファイル
    └── users.csv
```

### proveコマンド

```bash
# 全テストを実行
prove -l t/

# 詳細出力
prove -lv t/

# 特定のテストを実行
prove -lv t/unit/user.t

# 再帰検索
prove -lr t/

# 並列実行 (8ジョブ)
prove -lr -j8 t/

# 前回の実行から失敗したテストのみ実行
prove -l --state=failed t/

# タイマー付きカラー出力
prove -l --color --timer t/

# CI用TAPOutput
prove -l --formatter TAP::Formatter::JUnit t/ > results.xml
```

### .proverc設定

```text
-l
--color
--timer
-r
-j4
--state=save
```

## フィクスチャとセットアップ/ティアダウン

### サブテストの分離

```perl
use v5.36;
use Test2::V0;
use File::Temp qw(tempdir);
use Path::Tiny;

subtest 'file processing' => sub {
    # セットアップ
    my $dir = tempdir(CLEANUP => 1);
    my $file = path($dir, 'input.txt');
    $file->spew_utf8("line1\nline2\nline3\n");

    # テスト
    my $result = process_file("$file");
    is($result->{line_count}, 3, 'counts lines');

    # ティアダウンは自動的に発生 (CLEANUP => 1)
};
```

### 共有テストヘルパー

再利用可能なヘルパーを `t/lib/TestHelper.pm` に配置し、`use lib 't/lib'` でロードする。`create_test_db()`、`create_temp_dir()`、`fixture_path()` などのファクトリー関数を `Exporter` でエクスポートする。

## モッキング

### Test::MockModule

```perl
use v5.36;
use Test2::V0;
use Test::MockModule;

subtest 'mock external API' => sub {
    my $mock = Test::MockModule->new('MyApp::API');

    # 良い例: モックが制御されたデータを返す
    $mock->mock(fetch_user => sub ($self, $id) {
        return { id => $id, name => 'Mock User', email => 'mock@test.com' };
    });

    my $api = MyApp::API->new;
    my $user = $api->fetch_user(42);
    is($user->{name}, 'Mock User', 'returns mocked user');

    # コール数を確認
    my $call_count = 0;
    $mock->mock(fetch_user => sub { $call_count++; return {} });
    $api->fetch_user(1);
    $api->fetch_user(2);
    is($call_count, 2, 'fetch_user called twice');

    # $mockがスコープ外になると自動的に復元される
};

# 悪い例: 復元なしのモンキーパッチ
# *MyApp::API::fetch_user = sub { ... };  # 絶対ダメ — テスト間で漏れる
```

軽量なモックオブジェクトには `Test::MockObject` を使い、`->mock()` でインジェクト可能なテストダブルを作成し、`->called_ok()` でコールを確認する。

## Devel::Coverによるカバレッジ

### カバレッジの実行

```bash
# 基本的なカバレッジレポート
cover -test

# またはステップごと
perl -MDevel::Cover -Ilib t/unit/user.t
cover

# HTMLレポート
cover -report html
open cover_db/coverage.html

# 特定のしきい値
cover -test -report text | grep 'Total'

# CI対応: しきい値未満で失敗
cover -test && cover -report text -select '^lib/' \
  | perl -ne 'if (/Total.*?(\d+\.\d+)/) { exit 1 if $1 < 80 }'
```

### インテグレーションテスト

データベーステストにはインメモリSQLiteを使用し、APIテストには `HTTP::Tiny` をモックする。

```perl
use v5.36;
use Test2::V0;
use DBI;

subtest 'database integration' => sub {
    my $dbh = DBI->connect('dbi:SQLite:dbname=:memory:', '', '', {
        RaiseError => 1,
    });
    $dbh->do('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');

    $dbh->prepare('INSERT INTO users (name) VALUES (?)')->execute('Alice');
    my $row = $dbh->selectrow_hashref('SELECT * FROM users WHERE name = ?', undef, 'Alice');
    is($row->{name}, 'Alice', 'inserted and retrieved user');
};

done_testing;
```

## ベストプラクティス

### すべきこと

- **TDDに従う**: 実装前にテストを書く (red-green-refactor)
- **Test2::V0を使用する**: モダンなアサーション、より良い診断
- **サブテストを使用する**: 関連するアサーションをグループ化し、状態を分離する
- **外部依存関係をモックする**: ネットワーク、データベース、ファイルシステム
- **`prove -l` を使用する**: 常に lib/ を `@INC` に含める
- **テストを明確に命名する**: `'user login with invalid password fails'`
- **エッジケースをテストする**: 空文字列、undef、ゼロ、境界値
- **80%以上のカバレッジを目指す**: ビジネスロジックのパスに集中する
- **テストを速くする**: I/Oをモックし、インメモリデータベースを使用する

### してはいけないこと

- **実装をテストしない**: 内部ではなく動作と出力をテストする
- **サブテスト間で状態を共有しない**: 各サブテストは独立すべき
- **`done_testing` をスキップしない**: 全計画テストが実行されたことを確認する
- **過剰なモック**: モックする境界のみ、テスト対象のコードはモックしない
- **新プロジェクトに `Test::More` を使わない**: Test2::V0を優先する
- **テスト失敗を無視しない**: すべてのテストがマージ前に通過する必要がある
- **CPANモジュールをテストしない**: ライブラリが正しく動作することを信頼する
- **脆弱なテストを書かない**: 過度に具体的な文字列マッチングを避ける

## クイックリファレンス

| タスク | コマンド/パターン |
|---|---|
| 全テストを実行 | `prove -lr t/` |
| 一つのテストを詳細実行 | `prove -lv t/unit/user.t` |
| 並列テスト実行 | `prove -lr -j8 t/` |
| カバレッジレポート | `cover -test && cover -report html` |
| 等値テスト | `is($got, $expected, 'label')` |
| ディープ比較 | `is($got, hash { field k => 'v'; etc() }, 'label')` |
| 例外テスト | `like(dies { ... }, qr/msg/, 'label')` |
| 例外なしテスト | `ok(lives { ... }, 'label')` |
| メソッドのモック | `Test::MockModule->new('Pkg')->mock(m => sub { ... })` |
| テストのスキップ | `SKIP: { skip 'reason', $count unless $cond; ... }` |
| TODOテスト | `TODO: { local $TODO = 'reason'; ... }` |

## よくある落とし穴

### `done_testing` を忘れる

```perl
# 悪い例: テストファイルは実行されるが全テストが実行されたことを確認しない
use Test2::V0;
is(1, 1, 'works');
# done_testingがない — テストコードがスキップされた場合、サイレントバグ

# 良い例: 常にdone_testingで終了する
use Test2::V0;
is(1, 1, 'works');
done_testing;
```

### `-l` フラグの省略

```bash
# 悪い例: lib/のモジュールが見つからない
prove t/unit/user.t
# Can't locate MyApp/User.pm in @INC

# 良い例: @INCにlib/を含める
prove -l t/unit/user.t
```

### 過剰なモック

テスト対象のコードではなく、*依存関係* をモックする。テストが指定した内容を返すことだけをモックが確認するなら、それは何もテストしていない。

### テストの汚染

`our` ではなく `my` 変数をサブテスト内で使用する — テスト間で状態が漏れないようにする。

**覚えておくこと**: テストはあなたのセーフティネット。速く、集中的で、独立したものに保つ。新プロジェクトにはTest2::V0、実行にはprove、説明責任にはDevel::Coverを使用する。
