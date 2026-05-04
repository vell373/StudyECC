---
description: Go用のテスト駆動開発（TDD）ワークフローを強制します。テーブル駆動テストを最初に書き、その後に実装します。go test -cover で80%以上のカバレッジを確認します。
---

# Go TDDコマンド

このコマンドは、慣用的なGoテスティングパターンを使用してGo用のテスト駆動開発方法論を強制します。

## このコマンドが行うこと

1. **型/インターフェースを定義**: 関数シグネチャを最初にスカフォルド
2. **テーブル駆動テストを記述**: 包括的なテストケースを作成（RED）
3. **テストを実行**: テストが正しい理由で失敗することを確認
4. **コードを実装**: テストをパスするための最小限のコードを記述（GREEN）
5. **リファクタリング**: テストが緑色のままコードを改善
6. **カバレッジを確認**: 80%以上のカバレッジを確保

## いつ使うか

以下の場合に `/go-test` を使用：
- 新しいGo関数を実装
- 既存コードにテストカバレッジを追加
- バグを修正（失敗するテストを最初に記述）
- 重要なビジネスロジックを構築
- Go でのTDDワークフローを学習

## TDDサイクル

```
RED     → 失敗するテーブル駆動テストを記述
GREEN   → テストをパスするための最小限のコードを実装
REFACTOR → コードを改善、テストは緑のまま
REPEAT  → 次のテストケース
```

## セッション例

````
ユーザー: /go-test メールアドレスを検証する関数が必要

エージェント:
# TDDセッション: メールバリデーター

## ステップ1: インターフェースを定義

```go
// validator/email.go
package validator

// ValidateEmail は与えられた文字列が有効なメールアドレスかどうかをチェックします。
// 有効な場合は nil を返し、そうでない場合は問題を説明するエラーを返します。
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## ステップ2: テーブル駆動テストを記述（RED）

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

## ステップ3: テストを実行 - FAILを確認

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/simple_email (0.00s)
        panic: not implemented

FAIL
```

✓ テストは予期通り失敗します（パニック）。

## ステップ4: 最小限のコードを実装（GREEN）

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

## ステップ5: テストを実行 - PASSを確認

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ すべてのテストがパスしています！

## ステップ6: カバレッジを確認

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ カバレッジ: 100%

## TDD完了！
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

# カバレッジプロファイル
go test -coverprofile=coverage.out ./...

# ブラウザで表示
go tool cover -html=coverage.out

# 関数別カバレッジ
go tool cover -func=coverage.out

# 競合状態検出付き
go test -race -cover ./...
```

## カバレッジターゲット

| コードタイプ | ターゲット |
|-------------|----------|
| 重要なビジネスロジック | 100% |
| パブリックAPI | 90%以上 |
| 一般的なコード | 80%以上 |
| 生成されたコード | 除外 |

## TDDベストプラクティス

**すべきこと:**
- 実装前にテストを最初に記述
- 各変更後にテストを実行
- 包括的なカバレッジのためにテーブル駆動テストを使用
- 実装の詳細ではなく、振る舞いをテスト
- エッジケース（空、nil、最大値）を含める

**すべきでないこと:**
- テストの前に実装を記述
- RED フェーズをスキップ
- プライベート関数を直接テスト
- テストで `time.Sleep` を使用
- フレーキーなテストを無視

## 関連コマンド

- `/go-build` - ビルドエラーを修正
- `/go-review` - 実装後にコードをレビュー
- `verification-loop` スキル - 完全な検証ループを実行

## 関連

- スキル: `skills/golang-testing/`
- スキル: `skills/tdd-workflow/`
