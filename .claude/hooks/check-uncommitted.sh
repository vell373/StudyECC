#!/bin/bash

# 現在のGitステータスを取得（変更されたファイル、ステージされたファイル、未追跡ファイル）
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo ""
  echo "========================================================="
  echo "🚨 [PostToolUse Hook: コミットチェック] 🚨"
  echo "ファイルに変更が検出されました（未コミット状態です）。"
  echo "AIアシスタントへ: "
  echo "一連のファイル変更作業がすべて完了している場合は、"
  echo "必ずユーザーの CLAUDE.md のルールに従い、"
  echo "日本語で git commit を実行してください。"
  echo "まだ作業が続く場合は、すべての変更が終わった最後にコミットしてください。"
  echo "========================================================="
  echo ""
fi
exit 0
