---
description: Go言語の慣用的パターン、並行処理の安全性、エラーハンドリング、セキュリティに関する包括的なコードレビュー。go-reviewerエージェントを呼び出します。
---

# Goコードレビュー

このコマンドは、**go-reviewer** エージェントを呼び出してGo固有のコードレビューを実施します。

## このコマンドが行うこと

1. **Go変更を特定**: `git diff` で変更された `.go` ファイルを検出
2. **静的解析を実行**: `go vet`、`staticcheck`、`golangci-lint` を実行
3. **セキュリティスキャン**: SQLインジェクション、コマンドインジェクション、競合状態を確認
4. **並行処理レビュー**: ゴルーチン安全性、チャネル使用法、ミューテックスパターンを解析
5. **慣用的Go確認**: コードがGo慣例とベストプラクティスに従っていることを確認
6. **レポート生成**: 問題を重大度別に分類

## いつ使うか

以下の場合に `/go-review` を使用：
- Goコードを書いた後または変更した後
- Go変更をコミットする前
- Goコードを含むプルリクエストをレビュー
- 新しいGoコードベースにオンボード
- 慣用的なGoパターンを学習

## レビューカテゴリ

### CRITICAL（修正必須）
- SQLインジェクション/コマンドインジェクション脆弱性
- 同期化なしの競合状態
- ゴルーチンリーク
- ハードコードされた認証情報
- アンセーフなポインタ使用
- 重大パスでのエラーを無視

### HIGH（修正推奨）
- コンテキストなしでエラーラップなし
- エラー返却ではなくパニック
- コンテキスト伝播なし
- デッドロック原因のバッファなしチャネル
- インターフェース未実装エラー
- ミューテックス保護なし

### MEDIUM（検討推奨）
- 非慣用的なコードパターン
- 公開エクスポートの godoc コメント不足
- 非効率な文字列連結
- スライスが事前割当てされていない
- テーブル駆動テスト未使用

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
# Goコードレビューレポート

## レビュー対象ファイル
- internal/handler/user.go（変更）
- internal/service/auth.go（変更）

## 静的解析結果
✓ go vet: 問題なし
✓ staticcheck: 問題なし

## 検出された問題

[CRITICAL] 競合状態
ファイル: internal/service/auth.go:45
問題: 同期化なしで共有マップにアクセス
```go
var cache = map[string]*Session{}  // 並行アクセス!

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

[HIGH] エラーコンテキストなし
ファイル: internal/handler/user.go:28
問題: エラーがコンテキストなしで返却
```go
return err  // コンテキストなし
```
修正: コンテキストでラップ
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## サマリー
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

推奨: FAIL: CRITICAL問題が修正されるまでマージをブロック
```

## 承認基準

| ステータス | 条件 |
|----------|------|
| PASS: 承認 | CRITICAL/HIGH 問題なし |
| WARNING: 警告 | MEDIUM 問題のみ（注意してマージ） |
| FAIL: ブロック | CRITICAL/HIGH 問題が見つかった |

## 他のコマンドとの統合

- `/go-test` を最初に実行してテストがパスすることを確認
- ビルドエラーが発生した場合は `/go-build` を使用
- コミット前に `/go-review` を使用
- Go固有でない懸念事項については `/code-review` を使用

## 関連

- エージェント: `agents/go-reviewer.md`
- スキル: `skills/golang-patterns/`、`skills/golang-testing/`
