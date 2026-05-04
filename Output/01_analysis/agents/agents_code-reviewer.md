# code-reviewer 解析

**解析日**: 2026-05-03
**対象パス**: ECC/agents/code-reviewer.md
**関連トピック**: #agent #code-review #quality-assurance #security

## 概要
`code-reviewer` は、AI による自律的なコードレビューを実行するためのエージェント（専門家）としての役割や挙動を定義したファイルです。コードの追加や変更後に適用し、品質、セキュリティ、保守性の観点からプロアクティブにレビューを行い、レポートを出力します。

## 構造・仕組み
- **フロントマター**: エージェント名(`code-reviewer`)、ツールの指定(`Read`, `Grep`, `Glob`, `Bash`)、使用モデル(`sonnet`)を定義しています。
- **Review Process**: Gitのdiffから変更箇所を読み取り、周囲のコードを把握した上で、チェックリストに沿ってレビューする一連の手順を指示しています。
- **Confidence-Based Filtering**: レビューのノイズを減らすため、80%以上の確信度がある問題のみを報告し、スタイルの好みなどはスキップするようフィルタリングルールを設けています。
- **Review Checklist**:
  - **Security (CRITICAL)**: 認証情報のハードコード、SQLインジェクション、XSSなど。
  - **Code Quality (HIGH)**: 巨大な関数やファイル、深いネスト、エラーハンドリングの欠落など。
  - **Framework Patterns (HIGH)**: React/Next.js や Node.js 特有のアンチパターン。
  - **Performance (MEDIUM) / Best Practices (LOW)**: パフォーマンスや命名規則、マジックナンバーなど。
- **Review Output Format & Summary**: 発見した問題をフォーマットに従って提示し、最後に重要度ごとのサマリー表とマージ可否の判定(Approve/Warning/Block)を出力させます。

## 設計上の特徴
- **実用性の重視**: 些末な指摘を省き、バグやセキュリティリスクといった実害のある問題にフォーカスさせる「確信度ベースのフィルタリング」が組み込まれており、開発者のノイズにならない工夫がされています。
- **具体例の提示**: GOOD/BAD のコードスニペットをプロンプト内に含めることで、AIに期待するレビュー観点と修正案の精度を向上させています。
- **AI生成コード特有のチェック**: 「v1.8 AI-Generated Code Review Addendum」セクションで、無駄な複雑化やモデルコストの浪費などを抑止する視点が取り入れられています。

## 関連ファイル
- `CLAUDE.md`: プロジェクト固有の規約（ファイルサイズ制限、状態管理方針など）を参照するため連携します。

## 参照元
- `/Users/yasuvel/StudyECC/ECC/agents/code-reviewer.md`
