---
description: "パッケージマネージャー（npm/pnpm/yarn/bun）を自動検出し、最適なツールチェーンを設定します。"
---

# パッケージマネージャーセットアップ

プロジェクトに最適なパッケージマネージャーを自動検出し、設定します。

## 使用方法

```
/setup-pm [--force-pm=<pm-name>] [--verify]
```

### オプション

| オプション | 説明 |
|-----------|------|
| `--force-pm=npm` | npm を強制 |
| `--force-pm=pnpm` | pnpm を強制 |
| `--force-pm=yarn` | yarn を強制 |
| `--force-pm=bun` | bun を強制 |
| `--verify` | インストール後に検証ステップを実行 |

## 自動検出の優先順位

1. **ロックファイルが存在する場合** - そのファイルに対応するパッケージマネージャーを使用
   - `pnpm-lock.yaml` → `pnpm`
   - `yarn.lock` → `yarn`
   - `bun.lockb` → `bun`
   - `package-lock.json` → `npm`

2. **ロックファイルがない場合** - 環境に基づいて選択
   - `pnpm` がインストール済み → `pnpm`（推奨・高速）
   - `yarn` がインストール済み → `yarn`
   - `bun` がインストール済み → `bun`
   - デフォルト → `npm`（常に利用可能）

3. **package.json に packageManager フィールドがある場合** - それを使用
   ```json
   {
     "packageManager": "pnpm@8.6.0"
   }
   ```

## 実行フロー

### ステップ 1: 検出

```bash
/setup-pm
```

検出ログ:
```
検出プロセス...
────────────────────────────────
✓ package.json が見つかりました
✓ pnpm-lock.yaml が見つかりました
✓ パッケージマネージャー: pnpm
✓ バージョン: 8.6.0
```

### ステップ 2: 検証

```bash
/setup-pm --verify
```

検証ステップ:
```
パッケージマネージャーの検証
────────────────────────────────
✓ pnpm がインストール済み（バージョン: 8.6.0）
✓ Node.js バージョン: v18.16.0
✓ package.json が有効
✓ pnpm-lock.yaml が有効
✓ node_modules ディレクトリ: 存在（2,156 パッケージ）
```

### ステップ 3: セットアップ

```bash
/setup-pm --verify
```

セットアップアクション:
```
セットアップ実行
────────────────────────────────
✓ package.json の "packageManager" フィールドを確認
✓ .npmrc / pnpm-workspace.yaml の設定を確認
✓ node_modules をクリーン（オプション: --clean-install）
✓ 依存関係をインストール
```

## パッケージマネージャー比較

| 機能 | npm | yarn | pnpm | bun |
|-----|-----|------|------|-----|
| 速度 | 遅い | 中程度 | 高速 | 最高速 |
| 標準インストール | 有 | 別途 | 別途 | 別途 |
| ロックファイル | package-lock.json | yarn.lock | pnpm-lock.yaml | bun.lockb |
| ワークスペース対応 | npm v7+ | 対応 | 優秀 | 対応 |
| npm scripts | 対応 | 対応 | 対応 | 対応 |
| 推奨用途 | 標準・互換性 | 大規模 | パフォーマンス | 高速開発 |

## 設定ファイルの例

### npm
```json
{
  "packageManager": "npm@9.6.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### pnpm
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'

# .npmrc
strict-peer-dependencies=false
shamefully-hoist=true
```

### yarn
```json
{
  "packageManager": "yarn@3.6.0"
}
```

### bun
```json
{
  "packageManager": "bun@1.0.0"
}
```

## トラブルシューティング

### パッケージマネージャーのインストール

```bash
# npm (Node.js に付属)
node --version

# pnpm
npm install -g pnpm

# yarn
npm install -g yarn

# bun
curl https://bun.sh/install | bash
```

### 強制設定

特定のパッケージマネージャーを強制:

```bash
# npm で強制セットアップ
/setup-pm --force-pm=npm

# pnpm で強制セットアップ
/setup-pm --force-pm=pnpm --verify

# 既存のロックファイルを無視して新規インストール
/setup-pm --force-pm=yarn --clean-install
```

### キャッシュクリア

```bash
# npm
npm cache clean --force

# pnpm
pnpm store prune

# yarn
yarn cache clean

# bun
bun pm cache
```

## 使用例

### 既存プロジェクトで pnpm に切り替え

```bash
/setup-pm --force-pm=pnpm --verify
```

ステップ:
```
1. 既存の node_modules とロックファイルをバックアップ
2. pnpm をインストール
3. pnpm install で依存関係を再インストール
4. 動作確認（テスト・ビルド実行）
```

### npm から yarn へ移行

```bash
# 1. yarn をインストール
npm install -g yarn

# 2. yarn でセットアップ
/setup-pm --force-pm=yarn --verify

# 3. package.json を更新
# "packageManager": "yarn@3.6.0" を追加
```

## ベストプラクティス

### package.json に packageManager を明記

常に `package.json` に packageManager フィールドを含める:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "packageManager": "pnpm@8.6.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### チーム開発での統一

チーム全体で同じパッケージマネージャーを使用:

```bash
# プロジェクトルートで実行
/setup-pm --verify

# .npmrc / pnpm-workspace.yaml をバージョン管理に含める
git add package.json pnpm-lock.yaml .npmrc
git commit -m "add: パッケージマネージャーを pnpm に統一"
```

### CI/CD での使用

GitHub Actions での例:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          npm run setup:pm
          npm ci
```

## 関連コマンド

- `npm install` / `pnpm install` / `yarn install` / `bun install` - 依存関係をインストール
- `npm run <script>` - npm scripts を実行

## 関連

- スキル: `skills/build-systems/`
