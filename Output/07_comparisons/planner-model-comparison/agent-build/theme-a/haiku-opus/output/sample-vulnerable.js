/**
 * Sample Code: Vulnerable JavaScript Code
 *
 * このサンプルコードは、以下のセキュリティ脆弱性を意図的に含んでいます：
 * - SQLi (SQLインジェクション) × 1件
 * - XSS (クロスサイトスクリプティング) × 1件
 * - 認証チェック欠落 × 1件
 *
 * ハーネスでの検出率テスト用。
 */

const express = require('express');
const app = express();

// ========================================
// VULNERABILITY 1: SQL Injection
// ========================================

/**
 * ユーザーをID指定で取得する関数
 *
 * セキュリティ脆弱性: SQL クエリへの文字列連結（SQLi）
 * 修正: パラメータバインディング使用
 */
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // 悪い例：文字列連結
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";

  // DB.query() を実行（実際の DB は mock）
  // 攻撃例: /user/1' OR '1'='1
  // 結果: SELECT * FROM users WHERE id = '1' OR '1'='1' → 全ユーザー取得

  res.json({ user: "mock_user" });
});

// ========================================
// VULNERABILITY 2: XSS (Cross-Site Scripting)
// ========================================

/**
 * ユーザーコメントを HTML に表示する関数
 *
 * セキュリティ脆弱性: innerHTML への動的挿入（XSS）
 * 修正: テンプレートエンジンのオートエスケープ or textContent 使用
 */
app.get('/comment', (req, res) => {
  const userComment = req.query.text || '';

  // 悪い例：innerHTML への直接挿入
  const html = `
    <div>
      <h2>User Comment</h2>
      <p id="comment-box"></p>
      <script>
        document.getElementById('comment-box').innerHTML = '${userComment}';
      </script>
    </div>
  `;

  // 攻撃例: ?text=<img src=x onerror="alert('XSS')">
  // 結果: JavaScript 実行

  res.send(html);
});

// ========================================
// VULNERABILITY 3: Missing Authentication Check
// ========================================

/**
 * 管理者用パネル
 *
 * セキュリティ脆弱性: 認証チェック欠落
 * 修正: @auth_required デコレータまたは同等チェック追加
 */
app.get('/admin', (req, res) => {
  // 認証チェックがない → 誰でもアクセス可能

  const adminPanel = `
    <h1>Admin Panel</h1>
    <ul>
      <li><a href="/admin/users">User Management</a></li>
      <li><a href="/admin/settings">Settings</a></li>
      <li><a href="/admin/logs">Logs</a></li>
    </ul>
  `;

  res.send(adminPanel);
});

// ========================================
// QUALITY ISSUE 1: Long Function (65 lines)
// ========================================

/**
 * ユーザーデータ処理関数
 *
 * 品質問題: 関数が長すぎる（65行超）
 * 修正: 補助関数に分割
 */
function processUserData(userData) {
  // Line 1
  let processedData = {};

  // Line 3-5: ユーザーバリデーション
  if (!userData.name) {
    throw new Error('Name is required');
  }
  if (!userData.email) {
    throw new Error('Email is required');
  }

  // Line 10-15: データ正規化
  processedData.name = userData.name.trim().toLowerCase();
  processedData.email = userData.email.trim().toLowerCase();

  // Line 17-20: データ変換
  if (userData.birth_date) {
    const date = new Date(userData.birth_date);
    processedData.age = new Date().getFullYear() - date.getFullYear();
  }

  // Line 22-30: ロールベース設定
  if (userData.role === 'admin') {
    processedData.permissions = ['read', 'write', 'delete'];
  } else if (userData.role === 'editor') {
    processedData.permissions = ['read', 'write'];
  } else {
    processedData.permissions = ['read'];
  }

  // Line 32-40: ログ記録（冗長）
  console.log('Processing user:', userData.name);
  console.log('Email:', userData.email);
  console.log('Role:', userData.role);
  console.log('Permissions:', processedData.permissions);
  console.log('Age:', processedData.age);

  // Line 42-50: キャッシュ更新（実装仮）
  const cacheKey = `user_${processedData.email}`;
  const cacheValue = JSON.stringify(processedData);
  if (global.cache) {
    global.cache.set(cacheKey, cacheValue);
  }

  // Line 52-55: 外部 API 呼び出し（仮）
  if (userData.notify_external_service) {
    // 外部サービスに通知
    callExternalAPI(processedData);
  }

  // Line 58-65: 終了処理
  console.log('User processing complete');
  processedData.processed_at = new Date();
  processedData.version = '1.0';

  return processedData;
}

// ========================================
// QUALITY ISSUE 2: Deep Nesting (4 levels)
// ========================================

/**
 * ネスト深度が深い（深度4）
 *
 * 品質問題: if/for/while のネスト深度が 3 を超える
 * 修正: ガード句 or ヘルパー関数で分割
 */
function validateAndProcessOrders(orders, user) {
  // 深度 1
  if (orders && orders.length > 0) {
    // 深度 2
    for (const order of orders) {
      // 深度 3
      if (order.items && order.items.length > 0) {
        // 深度 4 ← ここが深い！
        while (order.items.length > 0) {
          const item = order.items.pop();
          console.log('Processing item:', item.id);
        }
      }
    }
  }
}

// ========================================
// QUALITY ISSUE 3: Poor Naming (snake_case for variable)
// ========================================

// 悪い例：定数なのに camelCase
const UserList = [];
const UserDict = {};

// 悪い例：変数が何か不明確
const x = getUserData();
const tmp = x.filter(user => user.active);

// Good example:
const USER_CACHE = {};
const activeUsers = userData.filter(user => user.isActive);

// ========================================
// Server startup
// ========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
