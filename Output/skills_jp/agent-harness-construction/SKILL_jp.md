---
name: agent-harness-construction
description: Build evaluation harnesses for AI agents - test frameworks that measure agent performance, catch regressions, and validate behavior systematically. Use when you need to ensure agent quality and reliability.
origin: ECC
---

# エージェントハーネス構築

AI エージェントの評価ハーネスを構築する。エージェントのパフォーマンスを計測し、リグレッションを検知し、動作を体系的に検証するためのテストフレームワーク。

## いつ使うか

- 新しいエージェントのビルドとデプロイ
- エージェントの品質を継続的に監視したい場合
- プロンプト変更によるリグレッション防止
- 複数のエージェント設定の比較
- エージェントが特定のタスクを確実に処理できることの実証

## コアとなるコンポーネント

### 1. テストケースレジストリ

```python
from dataclasses import dataclass
from typing import Any

@dataclass
class TestCase:
    id: str
    description: str
    input: dict[str, Any]
    expected_outputs: list[str]          # 期待するキーフレーズ
    expected_tools: list[str]            # 使用すべきツール
    forbidden_tools: list[str]           # 使ってはいけないツール
    quality_threshold: float = 0.7       # 合格ラインのスコア
    tags: list[str] = None               # フィルタリング用タグ
    timeout_seconds: int = 60            # 最大実行時間

class TestRegistry:
    def __init__(self):
        self.cases: dict[str, TestCase] = {}

    def register(self, case: TestCase) -> None:
        self.cases[case.id] = case

    def get_by_tag(self, tag: str) -> list[TestCase]:
        return [c for c in self.cases.values() if tag in (c.tags or [])]

    def load_from_yaml(self, path: str) -> None:
        import yaml
        data = yaml.safe_load(open(path))
        for item in data["test_cases"]:
            self.register(TestCase(**item))
```

### 2. エージェントランナー

```python
import anthropic
import time
from typing import Protocol

class AgentRunner(Protocol):
    def run(self, input_data: dict) -> tuple[str, list[dict]]:
        """応答テキストとツール呼び出しのリストを返す"""
        ...

class ClaudeAgentRunner:
    def __init__(self, model: str, system_prompt: str, tools: list[dict]):
        self.client = anthropic.Anthropic()
        self.model = model
        self.system_prompt = system_prompt
        self.tools = tools

    def run(self, input_data: dict) -> tuple[str, list[dict]]:
        tool_calls = []
        messages = [{"role": "user", "content": format_input(input_data)}]

        while True:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=8096,
                system=self.system_prompt,
                tools=self.tools,
                messages=messages
            )

            for block in response.content:
                if block.type == "tool_use":
                    tool_calls.append({
                        "tool": block.name,
                        "input": block.input
                    })

            if response.stop_reason == "end_turn":
                final_text = next(
                    (b.text for b in response.content if hasattr(b, "text")), ""
                )
                return final_text, tool_calls

            messages.append({"role": "assistant", "content": response.content})
            messages.append({
                "role": "user",
                "content": [execute_tool_call(block) for block in response.content
                           if block.type == "tool_use"]
            })
```

### 3. 評価エンジン

```python
from dataclasses import dataclass

@dataclass
class EvalResult:
    case_id: str
    passed: bool
    score: float
    content_score: float
    tool_score: float
    quality_score: float
    duration_seconds: float
    error: str | None = None

class Evaluator:
    def evaluate(
        self,
        case: TestCase,
        response: str,
        tool_calls: list[dict]
    ) -> EvalResult:
        scores = {}

        if case.expected_outputs:
            matches = sum(
                1 for phrase in case.expected_outputs
                if phrase.lower() in response.lower()
            )
            scores["content"] = matches / len(case.expected_outputs)
        else:
            scores["content"] = 1.0

        used_tools = {c["tool"] for c in tool_calls}
        expected_set = set(case.expected_tools)
        forbidden_set = set(case.forbidden_tools)

        tool_coverage = len(expected_set & used_tools) / max(len(expected_set), 1)
        no_forbidden = len(forbidden_set & used_tools) == 0
        scores["tool"] = tool_coverage * (1.0 if no_forbidden else 0.0)

        scores["quality"] = self._assess_quality(response)

        overall = (
            scores["content"] * 0.4 +
            scores["tool"] * 0.3 +
            scores["quality"] * 0.3
        )

        return EvalResult(
            case_id=case.id,
            passed=overall >= case.quality_threshold,
            score=overall,
            content_score=scores["content"],
            tool_score=scores["tool"],
            quality_score=scores["quality"],
            duration_seconds=0
        )

    def _assess_quality(self, response: str) -> float:
        """ヒューリスティックに基づいた品質評価"""
        score = 1.0
        if len(response) < 50:
            score -= 0.3
        if len(response) > 5000:
            score -= 0.1
        if response.count("```") % 2 != 0:
            score -= 0.2
        return max(0.0, score)
```

### 4. ハーネスオーケストレーター

```python
import asyncio
from datetime import datetime

class EvalHarness:
    def __init__(
        self,
        runner: AgentRunner,
        evaluator: Evaluator,
        registry: TestRegistry
    ):
        self.runner = runner
        self.evaluator = evaluator
        self.registry = registry
        self.results: list[EvalResult] = []

    def run_suite(
        self,
        tags: list[str] | None = None,
        parallel: bool = False
    ) -> dict:
        cases = (
            self.registry.get_by_tag(tags[0]) if tags
            else list(self.registry.cases.values())
        )

        if parallel:
            return asyncio.run(self._run_parallel(cases))
        else:
            return self._run_sequential(cases)

    def _run_sequential(self, cases: list[TestCase]) -> dict:
        for case in cases:
            result = self._run_single(case)
            self.results.append(result)
            self._print_progress(result)
        return self._summarize()

    def _run_single(self, case: TestCase) -> EvalResult:
        start = time.time()
        try:
            response, tool_calls = self.runner.run(case.input)
            result = self.evaluator.evaluate(case, response, tool_calls)
            result.duration_seconds = time.time() - start
            return result
        except Exception as e:
            return EvalResult(
                case_id=case.id,
                passed=False,
                score=0.0,
                content_score=0.0,
                tool_score=0.0,
                quality_score=0.0,
                duration_seconds=time.time() - start,
                error=str(e)
            )

    def _summarize(self) -> dict:
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)

        return {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "pass_rate": passed / total if total > 0 else 0,
            "avg_score": sum(r.score for r in self.results) / total,
            "avg_duration": sum(r.duration_seconds for r in self.results) / total,
            "failures": [r for r in self.results if not r.passed],
            "timestamp": datetime.now().isoformat()
        }
```

## ハーネスの設定

```yaml
# harness-config.yaml
harness:
  name: "コードレビューエージェント"
  version: "1.0.0"

agent:
  model: "claude-sonnet-4-6"
  system_prompt_file: "prompts/code-reviewer.md"
  tools:
    - Read
    - Grep
    - Bash

evaluation:
  quality_threshold: 0.75
  parallel: true
  timeout_seconds: 120
  baseline_file: "baselines/code-review-baseline.json"

test_suites:
  - name: "コアスイート"
    file: "tests/core.yaml"
    tags: ["smoke", "regression"]
  - name: "エッジケース"
    file: "tests/edge-cases.yaml"
    tags: ["edge"]
```

## CI 統合

```yaml
# .github/workflows/agent-eval.yml
name: エージェント評価

on:
  push:
    paths:
      - 'agents/**'
      - 'skills/**'
      - 'prompts/**'

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 評価を実行
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python harness/run_eval.py \
            --config harness-config.yaml \
            --baseline baselines/latest.json \
            --output results/eval-${{ github.sha }}.json

      - name: リグレッションをチェック
        run: |
          python harness/check_regressions.py \
            --current results/eval-${{ github.sha }}.json \
            --baseline baselines/latest.json \
            --threshold 0.05
```

## ベースライン管理

```python
def save_baseline(results: dict, path: str) -> None:
    """現在の結果を将来の比較用ベースラインとして保存する"""
    import json
    baseline = {
        "timestamp": results["timestamp"],
        "pass_rate": results["pass_rate"],
        "avg_score": results["avg_score"],
        "per_case": {
            r.case_id: {"score": r.score, "passed": r.passed}
            for r in results.get("raw_results", [])
        }
    }
    json.dump(baseline, open(path, "w"), indent=2)

def check_regressions(current: dict, baseline: dict, threshold: float = 0.05) -> list:
    """スコアが低下したケースを見つける"""
    regressions = []
    for case_id, curr_data in current["per_case"].items():
        if case_id not in baseline["per_case"]:
            continue
        base_score = baseline["per_case"][case_id]["score"]
        curr_score = curr_data["score"]
        if curr_score < base_score - threshold:
            regressions.append({
                "case_id": case_id,
                "baseline": base_score,
                "current": curr_score,
                "delta": curr_score - base_score
            })
    return sorted(regressions, key=lambda x: x["delta"])
```

## ベストプラクティス

- **最初から評価を構築する**: 後付けではなく、エージェント開発と並行して進める
- **実際の失敗からテストを増やす**: 本番のバグをテストケースとして記録する
- **ベースラインを少しずつ上げる**: 改善のたびにベースラインを更新する
- **スコアではなくパターンに注目する**: 個別のスコアより傾向を追う
- **ハーネス自体もテストする**: 評価ロジックが正しいことを確認する
- **アウトカムを追う**: ツールの使用だけでなく、ビジネス上の成果を測定する
