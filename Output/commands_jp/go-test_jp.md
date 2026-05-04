---
description: Go のテスト駆動開発ワークフローを強制します。テーブル駆動テストを最初に書き、その後実装します。go test -cover で 80%+ のカバレッジを検証します。
---

# Go TDD コマンド

このコマンドは、慣用的な Go テストパターンを使用してテスト駆動開発の方法論を Go コードに強制します。

## このコマンドの処理

1. **型/インターフェースの定義**: 関数シグネチャをまず定義
2. **テーブル駆動テストの作成**: 包括的なテストケースを作成（RED）
3. **テストの実行**: 正しい理由でテストが失敗することを検証
4. **コードの実装**: テストを通すための最小限のコードを作成（GREEN）
5. **リファクタリング**: テストが緑のままの状態で改善
6. **カバレッジの確認**: 80%+ カバレッジを確認

## 使用時機

以下の場合に `/go-test` を使用してください:
- 新しい Go 関数を実装する時
- 既存のコードにテストカバレッジを追加する時
- バグを修正する時（失敗するテストを最初に作成）
- 重要なビジネスロジックを構築する時
- Go でテスト駆動開発ワークフローを学習する時

## TDD サイクル

```
RED     → 失敗するテーブル駆動テストを作成
GREEN   → 最小限のコードを実装してテストを通す
REFACTOR → コードを改善、テストを緑のままに
REPEAT  → 次のテストケース
```

## セッション例

````
ユーザー: /go-test メールアドレスを検証する関数が必要です

エージェント:
# TDD セッション: メール検証機

## ステップ 1: インターフェースの定義

```go
// validator/email.go
package validator

// ValidateEmail は指定された文字列がメールアドレスとして有効かどうかをチェックします。
// 有効な場合は nil を返し、そうでない場合は問題を説明するエラーを返します。
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## ステップ 2: テーブル駆動テストの作成（RED）

```go
// validator/email_test.go
package validator

import (
    "testing"
)

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        // 有効なメール
        {"simple email", "user@example.com", false},
        {"with subdomain", "user@mail.example.com", false},
        {"with plus", "user+tag@example.com", false},
        {"with dots", "first.last@example.com", false},

        // 無効なメール
        {"empty string", "", true},
        {"no at sign", "userexample.com", true},
        {"no domain", "user@", true},
        {"no local part", "@example.com", true},
        {"double at", "user@@example.com", true},
        {"spaces", "user @example.com", true},
        {"no tld", "user@example", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if tt.wantErr && err == nil {
                t.Errorf("ValidateEmail(%q) = nil; want error", tt.email)
            }
            if !tt.wantErr && err != nil {
                t.Errorf("ValidateEmail(%q) = %v; want nil", tt.email, err)
            }
        })
    }
}
```

## ステップ 3: テストの実行 - 失敗を確認

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/simple_email (0.00s)
        panic: not implemented

FAIL
```

✓ テストが予想通り失敗（パニック）。

## ステップ 4: 最小限のコードを実装（GREEN）

```go
// validator/email.go
package validator

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

var (
    ErrEmailEmpty   = errors.New("email cannot be empty")
    ErrEmailInvalid = errors.New("email format is invalid")
)

func ValidateEmail(email string) error {
    if email == "" {
        return ErrEmailEmpty
    }
    if !emailRegex.MatchString(email) {
        return ErrEmailInvalid
    }
    return nil
}
```

## ステップ 5: テストの実行 - 成功を確認

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ すべてのテストが成功！

## ステップ 6: カバレッジの確認

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ カバレッジ: 100%

## TDD 完了！
````

## テストパターン

### テーブル駆動テスト
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // アサーション
    })
}
```

### 並列テスト
```go
for _, tt := range tests {
    tt := tt // キャプチャ
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // テスト本体
    })
}
```

### テストヘルパー
```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## カバレッジコマンド

```bash
# 基本的なカバレッジ
go test -cover ./...

# カバレッジプロフィール
go test -coverprofile=coverage.out ./...

# ブラウザで表示
go tool cover -html=coverage.out

# 関数ごとのカバレッジ
go tool cover -func=coverage.out

# 競合状態検出付き
go test -race -cover ./...
```

## カバレッジターゲット

| コードタイプ | ターゲット |
|------------|-----------|
| 重要なビジネスロジック | 100% |
| 公開 API | 90%+ |
| 一般的なコード | 80%+ |
| 生成されたコード | 除外 |

## TDD ベストプラクティス

**実施すること:**
- テスト FIRST を作成、実装前に
- 各変更後にテストを実行
- テーブル駆動テストを使用して包括的なカバレッジを実現
- 実装の詳細ではなく動作をテスト
- エッジケース（空、nil、最大値）を含める

**実施しないこと:**
- 実装をテストの前に作成
- RED フェーズをスキップ
- プライベート関数を直接テスト
- テストで `time.Sleep` を使用
- 不安定なテストを無視

## 関連コマンド

- `/go-build` - ビルドエラーを修正
- `/go-review` - 実装後にコードをレビュー
- `verification-loop` スキル - 完全な検証ループを実行

## 関連

- スキル: `skills/golang-testing/`
- スキル: `skills/tdd-workflow/`
