---
description: プロジェクトを分析し、検出されたフロントエンド、バックエンド、またはデータベースサービス用のPM2サービスコマンドを生成します。
---

# PM2 Init

プロジェクトを自動分析してPM2サービスコマンドを生成。

**コマンド**: `$ARGUMENTS`

---

## ワークフロー

1. PM2をチェック（未実装の場合は`npm install -g pm2`でインストール）
2. プロジェクトをスキャンしてサービス（フロントエンド/バックエンド/データベース）を特定
3. 設定ファイルと個別コマンドファイルを生成

---

## サービス検出

| タイプ | 検出 | デフォルトポート |
|--------|------|---------|
| Vite | vite.config.* | 5173 |
| Next.js | next.config.* | 3000 |
| Nuxt | nuxt.config.* | 3000 |
| CRA | package.json内のreact-scripts | 3000 |
| Express/Node | server/backend/apiディレクトリ + package.json | 3000 |
| FastAPI/Flask | requirements.txt / pyproject.toml | 8000 |
| Go | go.mod / main.go | 8080 |

**ポート検出優先順位**: ユーザー指定 > .env > 設定ファイル > スクリプト引数 > デフォルトポート

---

## 生成されるファイル

```
project/
├── ecosystem.config.cjs              # PM2設定
├── {backend}/start.cjs               # Pythonラッパー（適用可能な場合）
└── .claude/
    ├── commands/
    │   ├── pm2-all.md                # すべてを開始 + monit
    │   ├── pm2-all-stop.md           # すべてを停止
    │   ├── pm2-all-restart.md        # すべてを再開
    │   ├── pm2-{port}.md             # 単一開始 + ログ
    │   ├── pm2-{port}-stop.md        # 単一停止
    │   ├── pm2-{port}-restart.md     # 単一再開
    │   ├── pm2-logs.md               # すべてのログを表示
    │   └── pm2-status.md             # ステータスを表示
    └── scripts/
        ├── pm2-logs-{port}.ps1       # 単一サービスログ
        └── pm2-monit.ps1             # PM2モニター
```

---

## Windows設定（重要）

### ecosystem.config.cjs

**.cjs拡張子を必ず使用**

```javascript
module.exports = {
  apps: [
    // Node.js (Vite/Next/Nuxt)
    {
      name: 'project-3000',
      cwd: './packages/web',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 3000',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { NODE_ENV: 'development' }
    },
    // Python
    {
      name: 'project-8000',
      cwd: './backend',
      script: 'start.cjs',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { PYTHONUNBUFFERED: '1' }
    }
  ]
}
```

**フレームワークスクリプトパス:**

| フレームワーク | script | args |
|--------|--------|------|
| Vite | `node_modules/vite/bin/vite.js` | `--port {port}` |
| Next.js | `node_modules/next/dist/bin/next` | `dev -p {port}` |
| Nuxt | `node_modules/nuxt/bin/nuxt.mjs` | `dev --port {port}` |
| Express | `src/index.js` or `server.js` | - |

### Pythonラッパースクリプト（start.cjs）

```javascript
const { spawn } = require('child_process');
const proc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: __dirname, stdio: 'inherit', windowsHide: true
});
proc.on('close', (code) => process.exit(code));
```

---

## コマンドファイルテンプレート（最小コンテンツ）

### pm2-all.md（すべてを開始 + monit）
````markdown
すべてのサービスを開始してPM2モニターを開く。
```bash
cd "{PROJECT_ROOT}" && pm2 start ecosystem.config.cjs && start wt.exe -d "{PROJECT_ROOT}" pwsh -NoExit -c "pm2 monit"
```
````

### pm2-all-stop.md
````markdown
すべてのサービスを停止。
```bash
cd "{PROJECT_ROOT}" && pm2 stop all
```
````

### pm2-all-restart.md
````markdown
すべてのサービスを再開。
```bash
cd "{PROJECT_ROOT}" && pm2 restart all
```
````

### pm2-{port}.md（単一開始 + ログ）
````markdown
{name}（{port}）を開始してログを開く。
```bash
cd "{PROJECT_ROOT}" && pm2 start ecosystem.config.cjs --only {name} && start wt.exe -d "{PROJECT_ROOT}" pwsh -NoExit -c "pm2 logs {name}"
```
````

### pm2-{port}-stop.md
````markdown
{name}（{port}）を停止。
```bash
cd "{PROJECT_ROOT}" && pm2 stop {name}
```
````

### pm2-{port}-restart.md
````markdown
{name}（{port}）を再開。
```bash
cd "{PROJECT_ROOT}" && pm2 restart {name}
```
````

### pm2-logs.md
````markdown
すべてのPM2ログを表示。
```bash
cd "{PROJECT_ROOT}" && pm2 logs
```
````

### pm2-status.md
````markdown
PM2ステータスを表示。
```bash
cd "{PROJECT_ROOT}" && pm2 status
```
````

### PowerShellスクリプト（pm2-logs-{port}.ps1）
```powershell
Set-Location "{PROJECT_ROOT}"
pm2 logs {name}
```

### PowerShellスクリプト（pm2-monit.ps1）
```powershell
Set-Location "{PROJECT_ROOT}"
pm2 monit
```

---

## 主要ルール

1. **設定ファイル**: `ecosystem.config.cjs`（.jsではない）
2. **Node.js**: binパスを直接指定 + interpreter
3. **Python**: Node.jsラッパースクリプト + `windowsHide: true`
4. **新規ウィンドウを開く**: `start wt.exe -d "{path}" pwsh -NoExit -c "command"`
5. **最小コンテンツ**: 各コマンドファイルは1～2行の説明 + bashブロックのみ
6. **直接実行**: AI解析不要、bashコマンドを実行するだけ

---

## 実行

`$ARGUMENTS`に基づいてinitを実行:

1. プロジェクトをスキャンしてサービスを検出
2. `ecosystem.config.cjs`を生成
3. Pythonサービス用に`{backend}/start.cjs`を生成（適用可能な場合）
4. `.claude/commands/`にコマンドファイルを生成
5. `.claude/scripts/`にスクリプトファイルを生成
6. **プロジェクトCLAUDE.mdを更新**（以下参照）
7. **完了サマリーをターミナルコマンドで表示**

---

## Post-Init: CLAUDE.mdを更新

ファイル生成後、プロジェクトの`CLAUDE.md`にPM2セクションを追加（存在しない場合は作成）:

````markdown
## PM2サービス

| ポート | 名前 | タイプ |
|--------|------|--------|
| {port} | {name} | {type} |

**ターミナルコマンド:**
```bash
pm2 start ecosystem.config.cjs   # 初回
pm2 start all                    # 初回後
pm2 stop all / pm2 restart all
pm2 start {name} / pm2 stop {name}
pm2 logs / pm2 status / pm2 monit
pm2 save                         # プロセスリストを保存
pm2 resurrect                    # 保存されたリストを復元
```
````

**CLAUDE.md更新のルール:**
- PM2セクションが存在する場合は置き換え
- 存在しない場合は最後に追加
- コンテンツは最小限かつ必須のみ

---

## Post-Init: サマリーを表示

すべてのファイル生成後、出力:

```
## PM2 Init完了

**サービス:**

| ポート | 名前 | タイプ |
|--------|------|--------|
| {port} | {name} | {type} |

**Claudeコマンド:** /pm2-all、/pm2-all-stop、/pm2-{port}、/pm2-{port}-stop、/pm2-logs、/pm2-status

**ターミナルコマンド:**
## 初回（設定ファイル付き）
pm2 start ecosystem.config.cjs && pm2 save

## 初回後（簡略版）
pm2 start all          # すべてを開始
pm2 stop all           # すべてを停止
pm2 restart all        # すべてを再開
pm2 start {name}       # 単一を開始
pm2 stop {name}        # 単一を停止
pm2 logs               # ログを表示
pm2 monit              # モニターパネル
pm2 resurrect          # 保存されたプロセスを復元

**ヒント:** 初回開始後に`pm2 save`を実行して、簡略コマンドを有効にしてください。
```
