> このファイルは [common/testing.md](../common/testing.md) を Web 固有のテストコンテンツで拡張します。

# Web テストルール

## 優先度順

### 1. ビジュアル回帰

- スクリーンショット key breakpoint: 320, 768, 1024, 1440
- ヒーロセクション、scrollytelling セクション、および意味のある状態をテスト
- ビジュアル集約的な作業に Playwright スクリーンショット使用
- 両方のテーマが存在する場合、両方をテスト

### 2. アクセシビリティ

- 自動アクセシビリティチェック実行
- キーボード ナビゲーションをテスト
- reduced-motion 動作を確認
- カラーコントラスト を確認

### 3. パフォーマンス

- 意味のあるページに対して Lighthouse または同等を実行
- CWV ターゲットを [performance.md](performance.md) から保つ

### 4. クロスブラウザー

- 最小: Chrome, Firefox, Safari
- スクロール、モーション、フォールバック動作をテスト

### 5. レスポンシブ

- Test 320, 375, 768, 1024, 1440, 1920
- オーバーフロー なし を確認
- タッチ相互作用を確認

## E2E 形状

```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

- 不安定なタイムアウトベースのアサーション を避ける
- 決定論的な waits を優先

## ユニットテスト

- ユーティリティ、データ transform、カスタムフック をテスト
- 高度にビジュアルなコンポーネントの場合、ビジュアル回帰は多くの場合、brittle markup assertion よりも多くのシグナルを運ぶ
- ビジュアル回帰はカバレッジターゲット を補足；それは それらを置き換えない
