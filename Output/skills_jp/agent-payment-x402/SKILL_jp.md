---
name: agent-payment-x402
description: Add x402 payment execution to AI agents — per-task budgets, spending controls, and non-custodial wallets via MCP tools. Use when agents need to pay for APIs, services, or other agents.
origin: community
---

# エージェント決済実行（x402）

組み込みの支出制御を持つ自律型決済機能を AI エージェントに追加する。x402 HTTP 決済プロトコルと MCP ツールを使用して、エージェントがカストディリスクなしに外部サービス、API、または他のエージェントへの支払いができる。

## いつ使うか

以下の場合に使用する: エージェントが API 呼び出しへの支払い、サービスの購入、他のエージェントとの決済、タスクごとの支出制限の適用、または非カストディウォレットの管理が必要なとき。cost-aware-llm-pipeline や security-review スキルと組み合わせると効果的。

## 動作の仕組み

### x402 プロトコル
x402 は HTTP 402（支払い必要）をマシンネゴシエーション可能なフローに拡張する。サーバーが `402` を返すと、エージェントの決済ツールが自動的に価格を交渉し、予算を確認し、トランザクションに署名してリトライする — 人間は介在しない。

### 支出制御
すべての決済ツール呼び出しは `SpendingPolicy` を強制する:
- **タスクごとの予算** — 単一のエージェントアクションの最大支出額
- **セッションごとの予算** — セッション全体での累積制限
- **許可リスト入り受取人** — エージェントが支払える宛先/サービスを制限する
- **レート制限** — 分/時間あたりの最大トランザクション数

### 非カストディウォレット
エージェントは ERC-4337 スマートアカウントを通じて自身の鍵を保有する。オーケストレーターは委任前にポリシーを設定する; エージェントは範囲内でのみ支出できる。プールされた資金もカストディリスクもない。

## MCP 統合

決済レイヤーは任意の Claude Code またはエージェントハーネスのセットアップにスロットインする標準 MCP ツールを公開する。

> **セキュリティ注記**: 必ずパッケージバージョンをピン留めすること。このツールは秘密鍵を管理するため、ピン留めされていない `npx` インストールはサプライチェーンリスクをもたらす。

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "npx",
      "args": ["agentwallet-sdk@6.0.0"]
    }
  }
}
```

### 利用可能なツール（エージェント呼び出し可能）

| ツール | 目的 |
|------|---------|
| `get_balance` | エージェントウォレット残高を確認する |
| `send_payment` | アドレスまたは ENS に支払いを送る |
| `check_spending` | 残余予算を照会する |
| `list_transactions` | すべての支払いの監査証跡 |

> **注記**: 支出ポリシーはエージェントに委任する**前に**、**オーケストレーター**が設定する — エージェント自身ではない。これによりエージェントが自分自身の支出制限をエスカレーションすることを防ぐ。ポリシーは `set_policy` を通じてオーケストレーションレイヤーまたはプリタスクフックで設定し、エージェント呼び出し可能なツールとしては設定しないこと。

## 例

### MCP クライアントでの予算強制

有料ツール呼び出しをディスパッチする前に予算を強制する agentpay MCP サーバーを呼び出すオーケストレーターを構築するとき。

> **前提条件**: MCP 設定を追加する前にパッケージをインストールする — `-y` なしの `npx` は非インタラクティブ環境で確認を求め、サーバーをハングさせる: `npm install -g agentwallet-sdk@6.0.0`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. トランスポートを構築する前に認証情報を検証する。
  //    鍵が欠落している場合は即座に失敗させる — 認証なしでサブプロセスを起動しない。
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // stdio トランスポート経由で agentpay MCP サーバーに接続する。
  // サーバーが必要な環境変数のみを許可リストに入れる — 秘密鍵を管理する
  // サードパーティのサブプロセスには process.env の全体を転送しない。
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["agentwallet-sdk@6.0.0"],
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "production",
      WALLET_PRIVATE_KEY: walletKey,
    },
  });
  const agentpay = new Client({ name: "orchestrator", version: "1.0.0" });
  await agentpay.connect(transport);

  // 2. エージェントに委任する前に支出ポリシーを設定する。
  //    常に成功を確認する — サイレント失敗はコントロールがアクティブでないことを意味する。
  const policyResult = await agentpay.callTool({
    name: "set_policy",
    arguments: {
      per_task_budget: 0.50,
      per_session_budget: 5.00,
      allowlisted_recipients: ["api.example.com"],
    },
  });
  if (policyResult.isError) {
    throw new Error(
      `Failed to set spending policy — do not delegate: ${JSON.stringify(policyResult.content)}`
    );
  }

  // 3. 有料アクションの前に preToolCheck を使用する
  await preToolCheck(agentpay, 0.01);
}

// プリツールフック: 4つの異なるエラーパスを持つフェイルクローズの予算強制。
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // パス 1: 無効な入力を拒否する（NaN/Infinity は < 比較をバイパスする）
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }

  // パス 2: トランスポート/接続障害
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }

  // パス 3: ツールがエラーを返した場合（例: 認証失敗、ウォレット未初期化）
  if (result.isError) {
    throw new Error(
      `check_spending failed — action blocked: ${JSON.stringify(result.content)}`
    );
  }

  // パス 4: レスポンス形状を解析して検証する
  let remaining: number;
  try {
    const parsed = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text
    );
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(
      `check_spending returned unexpected format — action blocked: ${err}`
    );
  }

  // パス 5: 予算超過
  if (remaining < apiCost) {
    throw new Error(
      `Budget exceeded: need $${apiCost} but only $${remaining} remaining`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

## ベストプラクティス

- **委任前に予算を設定する**: サブエージェントをスポーンするとき、オーケストレーションレイヤーを通じて SpendingPolicy を添付する。エージェントに無制限の支出を与えない。
- **依存関係をピン留めする**: MCP 設定では常に正確なバージョンを指定する（例: `agentwallet-sdk@6.0.0`）。本番環境にデプロイする前にパッケージの整合性を確認する。
- **監査証跡**: ポストタスクフックで `list_transactions` を使用して何が支出されたか、なぜかを記録する。
- **フェイルクローズ**: 決済ツールが到達不能な場合、有料アクションをブロックする — 無制限アクセスへのフォールバックはしない。
- **security-review とペアにする**: 決済ツールは高権限である。シェルアクセスと同じ精査を適用する。
- **最初にテストネットで試す**: 開発には Base Sepolia を使用し、本番環境には Base メインネットに切り替える。

## 本番リファレンス

- **npm**: [`agentwallet-sdk`](https://www.npmjs.com/package/agentwallet-sdk)
- **NVIDIA NeMo Agent Toolkit にマージ済み**: [PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — NVIDIA のエージェント例用 x402 決済ツール
- **プロトコル仕様**: [x402.org](https://x402.org)
