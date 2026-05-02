# ECC ルール詳細カタログ (Common & Language-Specific)

ルールは、エージェントがツール（Bash, Write等）を使用する際に常に参照し、遵守しなければならない「行動指針」です。`rules/` ディレクトリに格納されています。

---

## 🏛 ルールの階層構造 (Hierarchy)

ECCは以下の順序でルールを適用し、競合する場合は上にあるものが優先されます。

1.  **Project-specific Rules**: 各リポジトリの `.claude/rules/` にある独自ルール。
2.  **Language-specific Rules**: `rules/<lang>/` にある言語固有のルール。
3.  **Common Rules**: `rules/common/` にある全プロジェクト共通の基本ルール。

---

## 🌐 共通ルール (Common Rules - Top 10)
すべての開発において常に適用される10の基本ルールです。

| ルール名 | 役割・強制事項 |
|---------|---------------|
| **`arch.md`** | 機能ベースのフォルダ構成、800行制限、依存性注入の推奨。 |
| **`testing.md`** | TDD必須、カバレッジ80%以上、Unit/Integration/E2Eの使い分け。 |
| **`security.md`** | 秘密情報のハードコード禁止、入力のサニタイズ、安全なAPIの使用。 |
| **`immutability.md`**| スプレッド演算子による更新、破壊的変更の禁止。 |
| **`hooks.md`** | フックをバイパスしない、フックの失敗を無視しない。 |
| **`formatting.md`** | プロジェクト指定のフォーマッタ（Prettier/Biome等）を必ず通す。 |
| **`git.md`** | `<type>: <summary>` 形式の日本語コミットメッセージ、小さなコミット。 |
| **`documentation.md`**| JSDoc必須、READMEの同期、TODOへのチケット番号付与。 |
| **`error-handling.md`**| 空のcatch禁止、独自例外クラスの推奨、エラーメッセージの具体性。 |
| **`efficiency.md`** | コンテキストの節約、重複するRead/Grepの禁止。 |

---

## 💻 言語別ルール (Language-Specific)
各言語のコミュニティで推奨される「イディオム（慣用句）」を定義しています。

- **TypeScript / Web**: ReactのHooks依存配列チェック、Server/Client境界、CSS Modules推奨。
- **Golang**: Table-drivenテスト、`if err != nil` の適切な処理、ポインタの使い分け。
- **Python**: PEP 8準拠、型ヒント（Pydantic/Zod）の活用、非同期処理の安全性。
- **Rust**: 所有権・ライフタイムの明示、`unwrap()` の回避、安全な `unsafe` 使用。
- **Swift / Mobile**: `guard` 文の活用、メモリリーク防止、SwiftUIのパターン。
- **PHP**: Laravel/Symfonyのディレクトリ規約、PSR準拠。

---

## ⚡ ルールとスキルの違い
混同しやすいこの2つの役割分担です。

- **Rule (ルール)**: 「**何を** してはいけないか、守るべきか」という**制約**。（例: テストはカバレッジ80%以上でなければならない）
- **Skill (スキル)**: 「**どうやって** それを達成するか」という**手順**。（例: Vitestでカバレッジを測定する具体的なコマンドと設定方法）

---

## 🛠 ルールの更新と適用
- **適用**: `PreToolUse` フック（`pre:bash:dispatcher` 等）が、ルールに反するコミットや書き込みを自動的に検知してブロックします。
- **更新**: `/rules-distill` コマンドを使うと、蓄積された「本能」やスキルから新しい共通ルールを自動抽出できます。

---

**依存関係**:
- ↔ **相互関係**: `agents/` はプロンプト内で常にこれらのルールファイルを `Read` するよう指示されています。
- ⚡ **監視**: `hooks/` がルールの守護者として機能します。
