---
name: continuous-learning
description: セッション中のツール操作を観察し、学習パターン（instinct）を自動抽出・蓄積するシステム。ECC continuous-learning-v2 からの移植版。
origin: ECC (transplanted)
version: 2.1.0
---

# Continuous Learning — Instinct 学習システム

ECC の `continuous-learning-v2` を StudyECC に移植したもの。
セッション中のすべてのツール呼び出しをフック経由で観察し、パターンを学習する。

## 動作概要

1. **observe.sh** が PreToolUse / PostToolUse フックとして登録
2. すべてのツール呼び出しが `~/.claude/homunculus/projects/<hash>/observations.jsonl` に記録
3. Observer エージェント（Haiku）がバックグラウンドでパターン分析
4. 学習結果が instinct（`.yaml` / `.md`）として蓄積

## 現在のフェーズ

- **Phase 1: 観察のみ** — `config.json` の `observer.enabled` が `false`
- Observer は無効、ツール呼び出しのログ記録のみ実行

## Observer を有効化するには

`config.json` の `observer.enabled` を `true` に変更する。
Haiku の API コストが発生する点に注意。

## 利用可能なコマンド

```bash
# instinct の状態確認
python3 .claude/skills/continuous-learning/scripts/instinct-cli.py status

# instinct のエクスポート
python3 .claude/skills/continuous-learning/scripts/instinct-cli.py export

# instinct のクラスタリング・進化
python3 .claude/skills/continuous-learning/scripts/instinct-cli.py evolve

# Observer の手動起動/停止/状態確認
bash .claude/skills/continuous-learning/agents/start-observer.sh start
bash .claude/skills/continuous-learning/agents/start-observer.sh stop
bash .claude/skills/continuous-learning/agents/start-observer.sh status
```

## データ保存先

```
~/.claude/homunculus/projects/<StudyECC-hash>/
├── observations.jsonl    ← ツール呼び出しログ
├── instincts/personal/   ← 自動学習された instinct
└── evolved/              ← 進化したスキル・コマンド・エージェント
```

## 移植元

- `ECC/skills/continuous-learning-v2/`
- 変更点: SKILL.md を日本語化、config.json を Phase 1 用に調整
