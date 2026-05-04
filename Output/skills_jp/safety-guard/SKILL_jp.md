---
name: safety-guard
description: 破壊的なコマンドやファイルの上書きを防ぐための保護モード。作業ディレクトリを保護したいとき、または危険なコマンドを実行する前にユーザーの確認を取りたいときに使う。
origin: ECC
---

# Safety Guard スキル

重要な操作を実行する前に確認を取るための保護メカニズム。

## 保護モード

Safety Guardには3つのモードがある。

### Carefulモード

**トリガー:** `carefully` または `with careful mode` という言葉を含むリクエスト  
**動作:** 破壊的なコマンドを実行する前に確認を取る

保護対象のコマンド:
- `rm` (ディレクトリの削除)
- `git reset --hard`
- `git clean`
- `> file` (ファイルの上書き)
- `DROP TABLE` / `DELETE FROM`（WHERE句なし）

確認プロンプトの例:
```
⚠️ 確認が必要です:
コマンド: rm -rf ./dist
影響: dist/ 配下のすべてのファイルが削除されます
続行しますか？ [yes/no]
```

### Freezeモード

**トリガー:** `freeze [directory]` または `lock [directory]` という言葉を含むリクエスト  
**動作:** 指定したディレクトリへの書き込みをブロックする

例:
- `freeze src/` — src/ フォルダ内のすべてのファイルをロックする
- `lock production/` — production/ への変更をブロックする

フリーズ中の動作:
1. ターゲットディレクトリへの書き込み試行を検出する
2. ブロックして警告を表示する
3. ユーザーが明示的に上書きしない限り操作を続行しない

### Guardモード

**トリガー:** `guard mode` または `maximum protection` という言葉を含むリクエスト  
**動作:** CarefulモードとFreezeモードの両方を組み合わせる

- 破壊的なコマンドには確認を求める
- 保護対象ディレクトリへの書き込みをブロックする
- 操作前にすべての変更点を報告する

## 実装（PreToolUseフック）

Safety Guardは PreToolUse フックを使って実装する:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/safety-guard.js"
          }
        ]
      }
    ]
  }
}
```

## 使用方法

```
/safety-guard carefully delete all temp files
/safety-guard freeze src/ before running the migration
/safety-guard with guard mode, update all dependencies
```

## 解除方法

モードを解除するには:
- `unfreeze [directory]` — ディレクトリのロックを解除する
- `disable careful mode` — 破壊的コマンドの確認を無効にする
- `exit guard mode` — すべての保護を無効にする
