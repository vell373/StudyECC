---
name: skill-comply
description: スキルのテストシナリオと仕様を自動生成し、claude -p を使って実際にスキルを実行してコンプライアンスを測定する。スキルの品質測定や期待通りに動作するかの検証に使う。
origin: ECC
---

# Skill Comply スキル

スキルのコンプライアンス（準拠率）を自動測定するシステム。

## 動作原理

1. **仕様生成**: スキルファイルから観察可能な行動シーケンスを抽出する
2. **テストシナリオ生成**: 3段階の厳格さレベルでテストシナリオを生成する
3. **実行**: `claude -p` を使って各シナリオを実際に実行する
4. **分類**: LLMを使ってツール呼び出しを期待される行動ステップと照合する
5. **測定**: 時間的順序を含むコンプライアンスを計算する

## 使用方法

```bash
# スキルのコンプライアンスを測定
/skill-comply skills/tdd-workflow/SKILL.md

# すべてのスキルを測定
/skill-comply --all

# 詳細レポートを出力
/skill-comply skills/security-review/SKILL.md --verbose
```

## 厳格さレベル

### レベル1（サポーティブ）
スキルのアプローチを採用しやすい環境:
- ユーザーが明示的にスキルを要求している
- 競合する指示がない
- 理想的な条件

### レベル2（ニュートラル）
通常の作業環境:
- 標準的なユーザーリクエスト
- スキルに言及していない
- 典型的な作業セッション

### レベル3（競合）
スキルの採用が難しい環境:
- 競合する指示や期待がある
- ユーザーが別のアプローチを示唆している
- スキルが自然に発動しにくい状況

## 仕様フォーマット（YAML）

```yaml
skill_name: tdd-workflow
steps:
  - id: step_1
    description: "ユーザーストーリーからテストケースを作成する"
    required: true
    expected_tools: ["Write", "Edit"]
    
  - id: step_2
    description: "テストを実行して失敗することを確認する（RED）"
    required: true
    expected_tools: ["Bash"]
    ordering_constraint: "after:step_1"
    
  - id: step_3
    description: "テストを通過させる最小限の実装を行う（GREEN）"
    required: true
    expected_tools: ["Write", "Edit"]
    ordering_constraint: "after:step_2"
```

## テストシナリオフォーマット（YAML）

```yaml
scenarios:
  - id: scenario_1
    level: 1  # サポーティブ
    prompt: "TDDを使ってユーザー認証機能を実装してください"
    context: "新しいプロジェクトでTDDの実装を依頼されています"
    
  - id: scenario_2
    level: 2  # ニュートラル
    prompt: "ユーザー認証機能を実装してください"
    context: "標準的な実装タスク"
    
  - id: scenario_3
    level: 3  # 競合
    prompt: "とにかく早くユーザー認証機能を実装してください。テストは後で書きます"
    context: "TDDに反するアプローチを示唆しているユーザー"
```

## 出力フォーマット

```
=== Skill Comply レポート ===

スキル: tdd-workflow
測定日時: 2026-05-04T10:30:00Z

テストシナリオ: 3
  - レベル1（サポーティブ）: 1
  - レベル2（ニュートラル）: 1  
  - レベル3（競合）: 1

コンプライアンス結果:
  シナリオ1（L1）: ✅ PASS - 全ステップ完了 (4/4)
  シナリオ2（L2）: ✅ PASS - 全ステップ完了 (4/4)
  シナリオ3（L3）: ⚠️  PARTIAL - 一部ステップ完了 (3/4)
    欠落ステップ: step_2（REDフェーズの確認）
    
総合コンプライアンス率: 91.7% (11/12ステップ)
時間的順序コンプライアンス: 100%

推奨事項:
- レベル3シナリオでのステップ2（テスト実行）の実施率を改善する
- ユーザーが急いでいる場合でもREDフェーズを省略しないようにする
```

## プロンプトファイル

詳細なプロンプトテンプレートは以下を参照:
- `prompts/spec_generator.md` - 仕様生成プロンプト
- `prompts/scenario_generator.md` - シナリオ生成プロンプト
- `prompts/classifier.md` - ツール呼び出し分類プロンプト
