---
description: Go ビルドエラー、go vet 警告、リンター問題を段階的に修正します。最小限で外科的修正のために go-build-resolver エージェントを呼び出します。
---

# Go ビルドと修正

このコマンドは、**go-build-resolver** エージェントを呼び出して、最小限の変更で Go ビルドエラーを段階的に修正します。

## このコマンドが行うこと

1. **診断を実行**: `go build`、`go vet`、`staticcheck` を実行
2. **エラーを解析**: ファイル別にグループ化し、重大度別にソート
3. **段階的に修正**: 一度に 1 つのエラー
4. **各修正を検証**: 各変更後にビルドを再実行
5. **概要を報告**: 何が修正され、何が残っているかを表示

## いつ使うか

以下の場合に `/go-build` を使用：
- `go build ./...` がエラーで失敗
- `go vet ./...` が問題を報告
- `golangci-lint run` が警告を表示
- モジュール依存関係が破損
- 変更を pull した後でビルドが破損

## 実行される診断コマンド

```bash
# プライマリビルドチェック
go build ./...

# 静的解析
go vet ./...

# 拡張 linting（利用可能な場合）
staticcheck ./...
golangci-lint run

# モジュール問題
go mod verify
go mod tidy -v
```

## セッション例

```text
ユーザー: /go-build

エージェント:
# Go ビルド解決

## 初期診断

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
```

見つかったエラー: 3

## 修正 1: 未宣言識別子

ファイル: internal/service/user.go:25
エラー: undefined: UserRepository
原因: インポート不足

```go
// インポートを追加
import "project/internal/repository"

// 変更
var repo UserRepository
// 対象
var repo repository.UserRepository
```

```bash
$ go build ./...
# 2 つのエラーが残っている
```

## 修正 2: 型の不一致

ファイル: internal/handler/api.go:42
エラー: cannot use x (type string) as type int

```go
// 変更
count := params.Get("count")
// 対象
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 1 つのエラーが残っている
```

## 修正 3: 不足している戻り値

ファイル: internal/handler/api.go:58
エラー: missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // 不足していた戻り値を追加
    return user, nil
}
```

```bash
$ go build ./...
# ビルド成功！
```

## 最終検証

```bash
$ go vet ./...
# 問題なし

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## サマリー

| 指標 | カウント |
|--------|-------|
| 修正されたビルドエラー | 3 |
| 修正された Vet 警告 | 0 |
| 変更されたファイル | 2 |
| 残っている問題 | 0 |

ビルドステータス: PASS: SUCCESS
```

## 修正される一般的なエラー

| エラー | 典型的な修正 |
|-------|-------------|
| `undefined: X` | インポートを追加またはタイプミスを修正 |
| `cannot use X as Y` | 型変換またはアサインメントを修正 |
| `missing return` | 戻り値ステートメントを追加 |
| `X does not implement Y` | 不足しているメソッドを追加 |
| `import cycle` | パッケージを再構成 |
| `declared but not used` | 変数を削除または使用 |
| `cannot find package` | `go get` または `go mod tidy` |

## 修正戦略

1. **ビルドエラー最初** - コードはコンパイルする必須
2. **Vet 警告次** - 疑わしい構造を修正
3. **Lint 警告三番目** - スタイルとベストプラクティス
4. **一度に 1 つの修正** - 各変更を検証
5. **最小限の変更** - リファクタリングではなく、修正のみ

## 停止条件

以下の場合はエージェントは停止して報告：
- 同じエラーが 3 回の試行後も残存
- 修正により多くのエラーが導入
- アーキテクチャの変更が必須
- 外部依存関係が不足

## 関連コマンド

- `/go-test` - ビルド成功後にテストを実行
- `/go-review` - コード品質を確認
- `verification-loop` スキル - 完全な検証ループ

## 関連

- エージェント: `agents/go-build-resolver.md`
- スキル: `skills/golang-patterns/`
