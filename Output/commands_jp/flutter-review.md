---
description: Flutter/Dart コードを慣用的パターン、ウィジェットのベストプラクティス、状態管理、パフォーマンス、アクセシビリティ、セキュリティについてレビューします。flutter-reviewer エージェントを呼び出します。
---

# Flutter コードレビュー

このコマンドは、**flutter-reviewer** エージェントを呼び出して Flutter/Dart コード変更をレビューします。

## このコマンドが行うこと

1. **コンテキストを収集**: `git diff --staged` と `git diff` をレビュー
2. **プロジェクトを検査**: `pubspec.yaml`、`analysis_options.yaml`、状態管理ソリューションを確認
3. **セキュリティ事前スキャン**: ハードコードされたシークレットと重大なセキュリティ問題を確認
4. **完全なレビュー**: 完全なレビューチェックリストを適用
5. **結果を報告**: 重大度別にグループ化された問題と修正ガイダンスを出力

## 前提条件

`/flutter-review` を実行する前に、以下を確認：
1. **ビルドがパス** — まず `/flutter-build` を実行してください。破損したコードのレビューは不完全です
2. **テストがパス** — `/flutter-test` を実行して回帰がないことを確認してください
3. **マージ競合がない** — すべての競合を解決してから、diff が意図的な変更だけを反映するようにしてください
4. **`flutter analyze` がクリーン** — レビュー前にアナライザー警告を修正してください

## いつ使うか

以下の場合に `/flutter-review` を使用：
- Flutter/Dart の変更を PR で提出する前（ビルドとテストがパス後）
- 新しいフィーチャーを実装した後で問題をもっと早く捕捉する
- 他人の Flutter コードをレビューするときに
- ウィジェット、状態管理コンポーネント、またはサービスクラスを監査する
- 本番リリース前に

## レビュー領域

| 領域 | 重大度 |
|------|----------|
| ハードコードされたシークレット、クリアテキスト HTTP | CRITICAL |
| アーキテクチャ違反、状態管理アンチパターン | CRITICAL |
| ウィジェットリビルド問題、リソースリーク | HIGH |
| 不足している `dispose()`、await 後の `BuildContext` | HIGH |
| Dart null safety、不足している error/loading 状態 | HIGH |
| Const 伝播、ウィジェット構成 | HIGH |
| パフォーマンス: `build()` での負荷の多い作業 | HIGH |
| アクセシビリティ、セマンティックラベル | MEDIUM |
| 状態遷移のテスト不足 | HIGH |
| ハードコードされた文字列（l10n） | MEDIUM |
| Pub 依存関係の衛生 | LOW |

## セッション例

````text
ユーザー: /flutter-review

エージェント:
# Flutter コードレビュー

## コンテキスト

変更されたファイル:
- lib/features/auth/presentation/login_page.dart
- lib/features/auth/data/auth_repository_impl.dart

状態管理: Riverpod（pubspec.yaml から検出）
アーキテクチャ: フィーチャーファースト

## セキュリティ事前スキャン

成功: ハードコードされたシークレットが検出されません
成功: クリアテキスト HTTP 呼び出しが検出されません

## レビュー結果

[HIGH] BuildContext が非同期ギャップ後に mounted チェックなしで使用
ファイル: lib/features/auth/presentation/login_page.dart:67
問題: `await auth.login(...)` 後の `context.go('/home')` が mounted チェックなしで呼び出されています。
修正: await 後に任意のナビゲーション前に `if (!context.mounted) return;` を追加してください（Flutter 3.7+）。

[HIGH] AsyncValue エラー状態が処理されていません
ファイル: lib/features/auth/presentation/login_page.dart:42
問題: `ref.watch(authProvider)` が loading/data に切り替わりますが、`error` ブランチがありません。
修正: スイッチ式または `when()` 呼び出しにエラーケースを追加して、ユーザーに見える error メッセージを表示してください。

[MEDIUM] ハードコードされた文字列がローカライズされていません
ファイル: lib/features/auth/presentation/login_page.dart:89
問題: `Text('Login')` - ユーザーに見えるの文字列がローカライゼーションシステムを使用していません。
修正: プロジェクトの l10n アクセッサーを使用: `Text(context.l10n.loginButton)`。

## レビューサマリー

| 重大度 | カウント | ステータス |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | block  |
| MEDIUM   | 1     | info   |
| LOW      | 0     | note   |

評決: BLOCK — マージ前に HIGH 問題を修正する必須
````

## 承認基準

- **承認**: CRITICAL または HIGH の問題なし
- **ブロック**: CRITICAL または HIGH の問題は、マージ前に修正する必須

## 関連コマンド

- `/flutter-build` — 最初にビルドエラーを修正
- `/flutter-test` — レビュー前にテストを実行
- `/code-review` — 一般的なコードレビュー（言語に依存しない）

## 関連

- エージェント: `agents/flutter-reviewer.md`
- スキル: `skills/flutter-dart-code-review/`
- ルール: `rules/dart/`
