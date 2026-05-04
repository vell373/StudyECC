---
description: Go のビルドエラー、go vet の警告、リンタークの問題を段階的に修正する。最小限の外科的な修正のために go-build-resolver エージェントを呼び出す。
---

# Go Build and Fix

このコマンドは **go-build-resolver** エージェントを呼び出して、最小限の変更で Go のビルドエラーを段階的に修正する。

## このコマンドが行うこと

1. **診断を実行する**: `go build`、`go vet`、`staticcheck` を実行する
2. **エラーを解析する**: ファイルでグループ化して重大度でソートする
3. **段階的に修正する**: 一度に 1 つのエラー
4. **各修正を検証する**: 各変更後にビルドを再実行する
5. **サマリーを報告する**: 修正されたものと残っているものを表示する

## 使用する場面

`/go-build` を使用する場合:
- `go build ./...` がエラーで失敗する
- `go vet ./...` が問題を報告する
- `golangci-lint run` が警告を表示する
- モジュールの依存関係が壊れている
- ビルドを壊す変更をプルした後

## 実行される診断コマンド

```bash
# 主要なビルドチェック
go build ./...

# 静的解析
go vet ./...

# 拡張リンティング（利用可能な場合）
staticcheck ./...
golangci-lint run

# モジュールの問題
go mod verify
go mod tidy -v
```

## セッション例

```text
User: /go-build

Agent:
# Go Build Resolution

## Initial Diagnostics

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
```

Errors found: 3

## Fix 1: Undefined Identifier

File: internal/service/user.go:25
Error: undefined: UserRepository
Cause: Missing import

```go
// Added import
import "project/internal/repository"

// Changed
var repo UserRepository
// To
var repo repository.UserRepository
```

```bash
$ go build ./...
# 2 errors remaining
```

## Fix 2: Type Mismatch

File: internal/handler/api.go:42
Error: cannot use x (type string) as type int

```go
// Changed
count := params.Get("count")
// To
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 1 error remaining
```

## Fix 3: Missing Return

File: internal/handler/api.go:58
Error: missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // Added missing return
    return user, nil
}
```

```bash
$ go build ./...
# Build successful!
```

## Final Verification

```bash
$ go vet ./...
# No issues

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Vet warnings fixed | 0 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS: SUCCESS
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `undefined: X` | インポートを追加するかタイポを修正する |
| `cannot use X as Y` | 型変換または代入を修正する |
| `missing return` | return 文を追加する |
| `X does not implement Y` | 欠けているメソッドを追加する |
| `import cycle` | パッケージを再構成する |
| `declared but not used` | 変数を削除するか使用する |
| `cannot find package` | `go get` または `go mod tidy` を実行する |

## 修正戦略

1. **ビルドエラーを最初に** - コードはコンパイルされなければならない
2. **Vet の警告を次に** - 疑わしい構造を修正する
3. **リントの警告を三番目に** - スタイルとベストプラクティス
4. **一度に 1 つの修正** - 各変更を確認する
5. **最小限の変更** - リファクタリングせず、修正するだけ

## 停止条件

以下の場合、エージェントは停止して報告する:
- 同じエラーが 3 回試みた後も解決しない
- 修正がより多くのエラーを引き起こす
- アーキテクチャの変更が必要
- 外部依存関係が欠落している

## 関連コマンド

- `/go-test` - ビルドが成功した後にテストを実行する
- `/go-review` - コードの品質をレビューする
- `verification-loop` スキル - 完全な検証ループ

## 関連

- エージェント: `agents/go-build-resolver.md`
- スキル: `skills/golang-patterns/`
