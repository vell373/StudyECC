---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を Python 固有のコンテンツで拡張します。

## 標準

- **PEP 8** 規約に従う
- すべての関数シグネチャに **型アノテーション** を使用

## イミュータビリティ

不変データ構造を優先:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## フォーマット

- コードフォーマットに **black**
- インポートソートに **isort**
- リント用に **ruff**

## リファレンス

スキル `python-patterns` で包括的な Python idiom とパターンを参照。
