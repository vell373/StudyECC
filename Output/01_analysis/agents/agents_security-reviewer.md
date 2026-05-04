# security-reviewer 解析

**解析日**: 2026-05-03
**対象パス**: ECC/agents/security-reviewer.md
**関連トピック**: #agent #security #vulnerability #owasp

## 概要
`security-reviewer` は、Webアプリケーションの脆弱性を検出し、修正を提案するセキュリティ専門のエージェント定義です。ユーザー入力の処理、認証、APIエンドポイントなどセキュリティリスクの高いコードが変更された際にプロアクティブに実行し、本番環境に問題が混入するのを未然に防ぎます。

## 構造・仕組み
- **フロントマター**: エージェント名(`security-reviewer`)、使用ツール(`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`)、モデル(`sonnet`)を定義しています。
- **Core Responsibilities**: 脆弱性検知、シークレット情報の検知、入力バリデーション、認証/認可、依存関係のチェックなど6つの主要な責務を定義しています。
- **Review Workflow**: 
  1. Initial Scan (`npm audit`, `eslint-plugin-security` の実行など)
  2. OWASP Top 10 Check（インジェクション、XSS、認証の不備などへの対応）
  3. Code Pattern Review (危険なパターンの即時警告と修正案のテーブル)
- **Key Principles & False Positives**: セキュリティの基本原則（多層防御や最小権限）と、よくある誤検知（例: `.env.example`内の変数）を明示し、精度の高いレビューを促します。
- **Emergency Response & When to Run**: 重大な脆弱性発見時の緊急対応フローや、実行すべきタイミング・トリガーを定義しています。

## 設計上の特徴
- **OWASP Top 10ベースの網羅性**: 業界標準のOWASP Top 10に沿った体系的なチェックリストを提示することで、漏れのないレビューを実現しています。
- **コマンド実行の自動化**: `npm audit` や `eslint-plugin-security` などのコマンド実行をプロンプト内に組み込み、静的解析ツールとLLMの推論を組み合わせています。
- **誤検知の防止**: 「Common False Positives」を明示することで、AIがテストコードやパブリックな情報を誤って警告するノイズを抑止しています。

## 関連ファイル
- `ECC/skills/security-review.md`: より詳細な脆弱性パターンやコード例、レポートテンプレートを参照するためのスキルファイル。

## 参照元
- `/Users/yasuvel/StudyECC/ECC/agents/security-reviewer.md`
