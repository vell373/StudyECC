---
description: Goコードの慣用的パターン、並行処理安全性、エラーハンドリング、セキュリティを包括的にレビュー。go-reviewerエージェントを呼び出す。
---

# Go コードレビュー

このコマンドは **go-reviewer** エージェントを呼び出して、Goに特化した包括的なコードレビューを実行します。

## このコマンドの処理

1. **Go変更の検出**: `git diff` を使用して修正された `.go` ファイルを検出
2. **静的解析の実行**: `go vet`、`staticcheck`、`golangci-lint` を実行
3. **セキュリティスキャン**: SQLインジェクション、コマンドインジェクション、競合状態をチェック
4. **並行処理レビュー**: Goroutineの安全性、チャネル使用法、Mutexパターンを解析
5. **慣用的Go確認**: Goの規約とベストプラクティスに従っているか検証
6. **レポート生成**: 問題を重大度ごとに分類

## 使用時機

以下の場合に `/go-review` を使用してください:
- Go コードを書いたまたは修正した後
- Go の変更をコミットする前
- Go コードを含むプルリクエストをレビューする時
- 新しい Go コードベースへのオンボーディング時
- Go の慣用的パターンを学習する時

## レビューカテゴリー

### CRITICAL（必ず修正）
- SQL/コマンドインジェクション脆弱性
- 同期化なしの競合状態
- Goroutineリーク
- ハードコードされた認証情報
- 安全でないポインタ使用
- 重大なパスでのエラー無視

### HIGH（修正すべき）
- コンテキストなしのエラーラップ不足
- エラーリターンの代わりにPanic
- コンテキストの伝播なし
- デッドロックの原因となるバッファなしチャネル
- インターフェース非実装エラー
- Mutexの保護なし

### MEDIUM（検討）
- 非慣用的なコードパターン
- エクスポート部分のgodocコメント不足
- 非効率な文字列連結
- 事前割り当てされていないスライス
- テーブル駆動テストを使用していない

## 実行される自動チェック

```bash
# 静的解析
go vet ./...

# 高度なチェック（インストール済みの場合）
staticcheck ./...
golangci-lint run

# 競合状態検出
go build -race ./...

# セキュリティ脆弱性
govulncheck ./...
```

## 使用例

```text
ユーザー: /go-review

エージェント:
# Go コードレビューレポート

## レビューされたファイル
- internal/handler/user.go (修正)
- internal/service/auth.go (修正)

## 静的解析結果
✓ go vet: 問題なし
✓ staticcheck: 問題なし

## 発見された問題

[CRITICAL] 競合状態
ファイル: internal/service/auth.go:45
問題: 同期化なしでアクセスされている共有マップ
```go
var cache = map[string]*Session{}  // 並行アクセス！

func GetSession(id string) *Session {
    return cache[id]  // 競合状態
}
```
修正: sync.RWMutex または sync.Map を使用
```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

[HIGH] エラーコンテキスト不足
ファイル: internal/handler/user.go:28
問題: コンテキストなしで返されたエラー
```go
return err  // コンテキストなし
```
修正: コンテキストでラップ
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## 要約
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨事項: 失敗: CRITICAL 問題が修正されるまでマージをブロック
```

## 承認基準

| ステータス | 条件 |
|-----------|------|
| 承認 | CRITICAL または HIGH 問題なし |
| 警告 | MEDIUM 問題のみ（注意してマージ） |
| ブロック | CRITICAL または HIGH 問題が見つかった |

## 他のコマンドとの統合

- 最初に `/go-test` を使用してテストが通ることを確認
- ビルドエラーが発生した場合は `/go-build` を使用
- コミット前に `/go-review` を使用
- Go 固有ではない懸念事項については `/code-review` を使用

## 関連

- エージェント: `agents/go-reviewer.md`
- スキル: `skills/golang-patterns/`、`skills/golang-testing/`
