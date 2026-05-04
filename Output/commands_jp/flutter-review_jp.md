---
description: イディオムパターン、ウィジェットのベストプラクティス、状態管理、パフォーマンス、アクセシビリティ、セキュリティの Flutter/Dart コードのレビュー。flutter-reviewer エージェントを呼び出す。
---

# Flutter Code Review

このコマンドは **flutter-reviewer** エージェントを呼び出して Flutter/Dart のコード変更をレビューする。

## このコマンドが行うこと

1. **コンテキストを収集する**: `git diff --staged` と `git diff` をレビューする
2. **プロジェクトを検査する**: `pubspec.yaml`、`analysis_options.yaml`、状態管理ソリューションを確認する
3. **セキュリティ事前スキャン**: ハードコードされたシークレットと重要なセキュリティ問題を確認する
4. **完全なレビュー**: 完全なレビューチェックリストを適用する
5. **発見を報告する**: 重大度でグループ化した問題を修正ガイダンスと共に出力する

## 前提条件

`/flutter-review` を実行する前に、以下を確認する:
1. **ビルドが通る** — 最初に `/flutter-build` を実行する; 壊れたコードのレビューは不完全
2. **テストが通る** — `/flutter-test` を実行してリグレッションがないことを確認する
3. **マージ競合がない** — diff が意図した変更のみを反映するようにすべての競合を解決する
4. **`flutter analyze` がクリーン** — レビュー前にアナライザーの警告を修正する

## 使用する場面

`/flutter-review` を使用する場合:
- Flutter/Dart の変更を含む PR を提出する前（ビルドとテストが通った後）
- 新しい機能を実装した後に問題を早期にキャッチする
- 他の人の Flutter コードをレビューする
- ウィジェット、状態管理コンポーネント、またはサービスクラスを監査する
- プロダクションリリースの前

## レビュー対象

| 対象 | 重大度 |
|------|----------|
| ハードコードされたシークレット、平文 HTTP | CRITICAL |
| アーキテクチャ違反、状態管理のアンチパターン | CRITICAL |
| ウィジェットの再ビルド問題、リソースリーク | HIGH |
| `dispose()` の欠落、await 後の `BuildContext` | HIGH |
| Dart のヌル安全性、エラー/ローディング状態の欠落 | HIGH |
| Const の伝播、ウィジェットの構成 | HIGH |
| パフォーマンス: `build()` での高コストな作業 | HIGH |
| アクセシビリティ、セマンティクスラベル | MEDIUM |
| 状態遷移のテストの欠落 | HIGH |
| ハードコードされた文字列（l10n） | MEDIUM |
| Pub の依存関係の衛生 | LOW |

## セッション例

````text
User: /flutter-review

Agent:
# Flutter Code Review

## Context

Changed files:
- lib/features/auth/presentation/login_page.dart
- lib/features/auth/data/auth_repository_impl.dart

State management: Riverpod (detected from pubspec.yaml)
Architecture: feature-first

## Security Pre-scan

✓ No hardcoded secrets detected
✓ No cleartext HTTP calls

## Review Findings

[HIGH] BuildContext used after async gap without mounted check
File: lib/features/auth/presentation/login_page.dart:67
Issue: `context.go('/home')` called after `await auth.login(...)` with no `mounted` check.
Fix: Add `if (!context.mounted) return;` before any navigation after awaits (Flutter 3.7+).

[HIGH] AsyncValue error state not handled
File: lib/features/auth/presentation/login_page.dart:42
Issue: `ref.watch(authProvider)` switches on loading/data but has no `error` branch.
Fix: Add error case to the switch expression or `when()` call to show a user-facing error message.

[MEDIUM] Hardcoded string not localized
File: lib/features/auth/presentation/login_page.dart:89
Issue: `Text('Login')` — user-visible string not using localization system.
Fix: Use the project's l10n accessor: `Text(context.l10n.loginButton)`.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | block  |
| MEDIUM   | 1     | info   |
| LOW      | 0     | note   |

Verdict: BLOCK — HIGH issues must be fixed before merge.
````

## 承認基準

- **承認**: CRITICAL または HIGH の問題なし
- **ブロック**: CRITICAL または HIGH の問題はマージ前に修正が必要

## 関連コマンド

- `/flutter-build` — 最初にビルドエラーを修正する
- `/flutter-test` — レビュー前にテストを実行する
- `/code-review` — 一般的なコードレビュー（言語非依存）

## 関連

- エージェント: `agents/flutter-reviewer.md`
- スキル: `skills/flutter-dart-code-review/`
- ルール: `rules/dart/`
