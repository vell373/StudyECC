---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Dart/Flutter フック

> このファイルは [common/hooks.md](../common/hooks.md) を Dart および Flutter 固有のコンテンツで拡張します。

## PostToolUse フック

`~/.claude/settings.json` で設定:

- **dart format**: 編集後に `.dart` ファイルを自動フォーマット
- **dart analyze**: Dart ファイル編集後に静的解析を実行し、警告をサーフェス化
- **flutter test**: オプションで、重大な変更後に影響を受けたテストを実行

## 推奨フック設定

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "tool_name": "Edit", "file_paths": ["**/*.dart"] },
        "hooks": [
          { "type": "command", "command": "dart format $CLAUDE_FILE_PATHS" }
        ]
      }
    ]
  }
}
```

## コミット前チェック

Dart/Flutter 変更をコミット前に実行:

```bash
dart format --set-exit-if-changed .
dart analyze --fatal-infos
flutter test
```

## 便利なワンライナー

```bash
# すべての Dart ファイルをフォーマット
dart format .

# 分析してイシューを報告
dart analyze

# カバレッジ付きすべてのテストを実行
flutter test --coverage

# コード生成ファイルを再生成
dart run build_runner build --delete-conflicting-outputs

# 古いパッケージを確認
flutter pub outdated

# 制約内でパッケージをアップグレード
flutter pub upgrade
```
