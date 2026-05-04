---
description: 最新のECCリポジトリの変更をプルして、元のインストール状態リクエストを使用して現在の管理対象をインストールし直す。
disable-model-invocation: true
---

# 自動更新

上流リポジトリからECCを更新し、元のインストール状態リクエストを使用して現在のコンテキストの管理対象インストールを再生成。

## 使用方法

```bash
# 更新をプレビューして何も変更しない
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplace','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplace','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
node "$ECC_ROOT/scripts/auto-update.js" --dry-run

# 現在のプロジェクトのCursor管理ファイルのみを更新
node "$ECC_ROOT/scripts/auto-update.js" --target cursor

# ECCリポジトリルートを明示的にオーバーライド
node "$ECC_ROOT/scripts/auto-update.js" --repo-root /path/to/everything-claude-code
```

## 注記

- このコマンドは記録されたインストール状態リクエストを使用して、最新のリポジトリの変更をプルした後、`install-apply.js`を再実行する。
- 再インストールは意図的: 上流リネームと削除を処理するが、`repair.js`は古い操作だけからは安全に再構築できない。
- 何も変更する前に、`--dry-run`を使用して再構築された再インストール計画を見たい場合は最初に使用する。
