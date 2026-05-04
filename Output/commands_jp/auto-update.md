---
description: 最新の ECC リポジトリの変更を pull し、現在のマネージドターゲットを再インストールします。
disable-model-invocation: true
---

# 自動更新

ECC をそのアップストリームリポジトリから更新し、元のインストール状態リクエストを使用して現在のコンテキストのマネージド インストールを再生成します。

## 使用方法

```bash
# 何も変更せずに更新をプレビューする
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplace','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplace','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
node "$ECC_ROOT/scripts/auto-update.js" --dry-run

# 現在のプロジェクトで Cursor が管理するファイルのみを更新
node "$ECC_ROOT/scripts/auto-update.js" --target cursor

# ECC リポジトリのルートを明示的にオーバーライド
node "$ECC_ROOT/scripts/auto-update.js" --repo-root /path/to/everything-claude-code
```

## 注記

- このコマンドは記録されたインストール状態リクエストを使用し、最新のリポジトリ変更を pull した後に `install-apply.js` を再実行します。
- 再インストールは意図的です。これは、`repair.js` が古い操作だけからは安全に再構築できないアップストリームの名前変更と削除を処理します。
- 何も変更する前に `--dry-run` を使用して、再構築された再インストール計画を確認したい場合。
