---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Kotlin コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Kotlin 固有のコンテンツで拡張します。

## フォーマット

- **ktlint** または **Detekt** でスタイル強制
- 公式 Kotlin コードスタイル（`gradle.properties` に `kotlin.code.style=official` と設定）

## イミュータビリティ

- `var` より `val` を優先 — デフォルトは `val` で、変更が必要な場合のみ `var` を使用
- 値型に `data class` を使用；パブリック API では不変コレクション（`List`、`Map`、`Set`）を使用
- 状態更新時のコピーオンライト: `state.copy(field = newValue)`

## 命名

Kotlin 規約に従う:
- 関数とプロパティに `camelCase`
- クラス、インターフェース、オブジェクト、型エイリアスに `PascalCase`
- 定数に `SCREAMING_SNAKE_CASE`（`const val` または `@JvmStatic`）
- インターフェースの頭に `I` を付けない、振る舞いで命名: `Clickable` ではなく `IClickable`

## Null セーフティ

- `!!` を使用しない — `?.`、`?:`、`requireNotNull()`、`checkNotNull()` を優先
- スコープ付き Null セーフ操作に `?.let {}` を使用
- 結果がない可能性がある関数から nullable 型を返す

```kotlin
// BAD
val name = user!!.name

// GOOD
val name = user?.name ?: "Unknown"
val name = requireNotNull(user) { "User must be set before accessing name" }.name
```

## シール型

シール型クラス/インターフェースを使用して閉じた状態階層をモデル化:

```kotlin
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
```

シール型では常に網羅的な `when` を使用 — `else` ブランチを付けない。

## 拡張関数

ユーティリティ操作に拡張関数を使用、しかし発見可能性を保つ:
- ファイル名はレシーバー型に合わせて命名（`StringExt.kt`、`FlowExt.kt`）
- スコープを限定 — `Any` または過度に汎用の型に拡張を追加しない

## スコープ関数

適切なスコープ関数を使用:
- `let` — Null チェック + 変換: `user?.let { greet(it) }`
- `run` — レシーバー使用して結果を計算: `service.run { fetch(config) }`
- `apply` — オブジェクト設定: `builder.apply { timeout = 30 }`
- `also` — 副作用: `result.also { log(it) }`
- スコープ関数の深いネスト化を避ける（最大 2 レベル）

## エラーハンドリング

- `Result<T>` またはカスタムシール型を使用
- `runCatching {}` で throwable コードをラップ
- `CancellationException` は決してキャッチしない — 常に再スロー
- 制御フロー用に `try-catch` を使用しない

```kotlin
// BAD — 例外を制御フローで使用
val user = try { repository.getUser(id) } catch (e: NotFoundException) { null }

// GOOD — nullable 戻り値
val user: User? = repository.findUser(id)
```
