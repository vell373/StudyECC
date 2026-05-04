---
name: agent-eval
description: Evaluate, debug, and improve Claude Code agent outputs using structured eval frameworks. Use when agent quality is inconsistent, you need to catch regressions, or you want to systematically improve agent performance.
origin: ECC
---

# エージェント評価

構造化された評価フレームワークを使って、Claude Code エージェントの出力を評価・デバッグ・改善する。

## いつ使うか

- エージェントの出力品質にばらつきがある場合
- コード変更後にリグレッションを防ぎたい場合
- 本番環境へのデプロイ前にエージェントの動作を検証したい場合
- エージェントのプロンプトや設定を体系的に改善したい場合
- エージェントがどこで失敗しているかをデバッグしたい場合

## コアとなる評価ループ

```
テストケース作成 → エージェントの実行 → 出力の採点 → パターンの分析 → 改善
       ↑                                                              |
       └──────────────────────────────────────────────────────────────┘
```

## 評価のタイプ

### 1. 正確性の評価
エージェントが正しい答えを出しているかチェックする。

```python
def evaluate_correctness(agent_output: str, expected: str) -> dict:
    """エージェントの出力を期待値と比較する"""
    return {
        "exact_match": agent_output.strip() == expected.strip(),
        "contains_key_elements": all(
            element in agent_output
            for element in extract_key_elements(expected)
        ),
        "score": calculate_similarity(agent_output, expected)
    }
```

### 2. 動作の評価
エージェントが正しいツールや手順を使っているかチェックする。

```python
def evaluate_behavior(tool_calls: list[dict], expected_tools: list[str]) -> dict:
    """エージェントのツール使用パターンを評価する"""
    used_tools = [call["tool"] for call in tool_calls]
    return {
        "used_expected_tools": all(tool in used_tools for tool in expected_tools),
        "avoided_antipatterns": not any(
            pattern in used_tools
            for pattern in ANTIPATTERN_TOOLS
        ),
        "tool_sequence_valid": validate_tool_sequence(tool_calls)
    }
```

### 3. 品質の評価
出力の全体的な品質を評価する。

```python
QUALITY_CRITERIA = {
    "completeness": "応答に必要な要素がすべて含まれているか？",
    "accuracy": "事実的・技術的に正確か？",
    "conciseness": "不要なコンテンツを含まずに簡潔か？",
    "formatting": "マークダウンや構造が適切に使われているか？",
    "actionability": "明確なアクションや次のステップが含まれているか？"
}
```

## テストケースの構造

```yaml
# test-cases/code-review.yaml
test_cases:
  - id: "basic-security-review"
    description: "SQLインジェクションの脆弱性を検出する"
    input:
      task: "このコードをレビューしてください"
      code: |
        def get_user(username):
            query = f"SELECT * FROM users WHERE name = '{username}'"
            return db.execute(query)
    expected:
      contains:
        - "SQLインジェクション"
        - "パラメータ化"
      tools_used:
        - "Read"
      quality_threshold: 0.8

  - id: "performance-review"
    description: "O(n²) のアルゴリズムを特定する"
    input:
      task: "このコードのパフォーマンスレビューをしてください"
      code: |
        def find_duplicates(items):
            duplicates = []
            for i in items:
                for j in items:
                    if i == j and i not in duplicates:
                        duplicates.append(i)
            return duplicates
    expected:
      contains:
        - "O(n²)"
        - "set"
      quality_threshold: 0.75
```

## 評価の実行

```python
import anthropic
import yaml
from pathlib import Path

def run_eval_suite(test_file: str, agent_config: dict) -> dict:
    """テストケースのスイートを実行する"""
    client = anthropic.Anthropic()
    test_cases = yaml.safe_load(Path(test_file).read_text())

    results = []
    for case in test_cases["test_cases"]:
        response = client.messages.create(
            model=agent_config["model"],
            max_tokens=8096,
            system=agent_config["system_prompt"],
            messages=[{"role": "user", "content": format_input(case["input"])}]
        )

        result = evaluate_response(response, case["expected"])
        result["case_id"] = case["id"]
        result["description"] = case["description"]
        results.append(result)

    return summarize_results(results)

def evaluate_response(response, expected: dict) -> dict:
    content = response.content[0].text
    score = 0.0
    details = {}

    if "contains" in expected:
        matches = [phrase in content for phrase in expected["contains"]]
        details["content_match"] = sum(matches) / len(matches)
        score += details["content_match"] * 0.5

    if "quality_threshold" in expected:
        quality = assess_quality(content)
        details["quality_score"] = quality
        score += (quality >= expected["quality_threshold"]) * 0.5

    return {"score": score, "passed": score >= 0.7, "details": details}
```

## リグレッション検出

```python
def check_for_regressions(
    current_results: dict,
    baseline_results: dict,
    threshold: float = 0.05
) -> list[dict]:
    """ベースラインと比較してリグレッションを特定する"""
    regressions = []

    for case_id, current in current_results.items():
        if case_id not in baseline_results:
            continue

        baseline = baseline_results[case_id]
        score_delta = current["score"] - baseline["score"]

        if score_delta < -threshold:
            regressions.append({
                "case_id": case_id,
                "baseline_score": baseline["score"],
                "current_score": current["score"],
                "regression": abs(score_delta)
            })

    return sorted(regressions, key=lambda x: x["regression"], reverse=True)
```

## デバッグのワークフロー

エージェントが失敗した場合:

1. **失敗した入力を特定する** — どのテストケースが落ちているか
2. **ツールの使用状況を確認する** — 予期しないツールを使っていないか
3. **プロンプトのトレースを調べる** — どの時点で軌道が外れているか
4. **エラー例を追加する** — 失敗ケースをテストスイートに追加する
5. **プロンプトを調整する** — システムプロンプトやスキルの説明を修正する
6. **再評価する** — 改善で新たなリグレッションが生じていないか確認する

## 評価の指標

```python
EVAL_METRICS = {
    "pass_rate": "全テストケースのうちパスした割合",
    "average_score": "全ケースの平均評価スコア",
    "regression_count": "ベースラインより低下したケースの数",
    "tool_efficiency": "使用されたツール数 / 期待されるツール数（低いほど良い）",
    "latency_p95": "95パーセンタイルの応答時間（ミリ秒）"
}
```

## ベストプラクティス

- **小さく始める**: 5〜10件のコアとなるテストケースでスタートする
- **本当の失敗から学ぶ**: 実際の本番の問題からテストケースを作る
- **継続的に実行する**: CI/CD パイプラインに評価を組み込む
- **スコアではなくパターンを追う**: 個々のスコアより傾向に注目する
- **ベースラインを維持する**: 良好な結果を比較のためにコミットする
- **エッジケースを含める**: 通常ケースだけでなく境界値も評価する
