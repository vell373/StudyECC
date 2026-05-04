> このファイルは [common/hooks.md](../common/hooks.md) を Web 固有のフックレコメンデーションで拡張します。

# Web フック

## 推奨される PostToolUse フック

プロジェクトローカルツーリングを優先。リモートワンオフパッケージ実行にフックをワイヤリングしない。

### 保存時フォーマット

編集後、プロジェクトの既存フォーマッター entrypoint を使用:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm prettier --write \"$FILE_PATH\"",
        "description": "Format edited frontend files"
      }
    ]
  }
}
```

`yarn prettier` または `npm exec prettier --` による同等のローカルコマンドは、repo オーナー依存関係を使用する場合に問題ない。

### Lint チェック

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm eslint --fix \"$FILE_PATH\"",
        "description": "Run ESLint on edited frontend files"
      }
    ]
  }
}
```

### 型チェック

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm tsc --noEmit --pretty false",
        "description": "Type-check after frontend edits"
      }
    ]
  }
}
```

### CSS Lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm stylelint --fix \"$FILE_PATH\"",
        "description": "Lint edited stylesheets"
      }
    ]
  }
}
```

## PreToolUse フック

### ファイルサイズ保護

存在しない可能性のあるファイルではなく、ツール入力コンテンツから大きすぎる書き込みをブロック:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines ('+lines+' lines)');console.error('[Hook] Split into smaller modules');process.exit(2)}console.log(d)})\"",
        "description": "Block writes that exceed 800 lines"
      }
    ]
  }
}
```

## Stop フック

### 最終ビルド検証

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "pnpm build",
        "description": "Verify the production build at session end"
      }
    ]
  }
}
```

## 順序付け

推奨される順序:
1. フォーマット
2. Lint
3. 型チェック
4. ビルド検証
