---
name: skill-health
description: "スキルポートフォリオのヘルスダッシュボードをチャートと分析で表示します。"
command: true
---

# スキルヘルスダッシュボード

スキルポートフォリオの包括的なヘルスダッシュボードを成功率スパークライン、失敗パターンクラスタリング、保留中の修正案、バージョン履歴で表示します。

## 実装

ダッシュボードモードでスキルヘルス CLI を実行:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplace','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplace','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard
```

特定のパネルのみの場合:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplace','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplace','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard --panel failures
```

マシン可読形式の出力:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of [['ecc'],['ecc@ecc'],['marketplace','ecc'],['everything-claude-code'],['everything-claude-code@everything-claude-code'],['marketplace','everything-claude-code']]){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ['ecc','everything-claude-code']){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})();console.log(r)")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard --json
```

## 使用方法

```
/skill-health                    # フルダッシュボードビュー
/skill-health --panel failures   # 失敗クラスタリングパネルのみ
/skill-health --json             # マシン可読 JSON 出力
```

## やるべきこと

1. --dashboard フラグで skills-health.js スクリプトを実行
2. 出力をユーザーに表示
3. スキルが低下している場合は、ハイライトして `/evolve` の実行を提案
4. 保留中の修正案がある場合は、確認を提案

## パネル

- **成功率（30日）** — スキルごとの日次成功率を示すスパークラインチャート
- **失敗パターン** — クラスタリングされた失敗理由と横棒グラフ
- **保留中の修正案** — 確認待ちの修正提案
- **バージョン履歴** — スキルごとのバージョンスナップショットのタイムライン
