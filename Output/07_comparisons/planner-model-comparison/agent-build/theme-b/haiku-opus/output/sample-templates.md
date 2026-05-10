# サンプルテンプレートと実行例

## API.md テンプレート

```markdown
# API Reference

## Overview

This document describes the public API of [Project Name].

## Functions

### calculate(x, y, precision)

**Description**: Perform calculation on two numbers with specified precision.

**Parameters**:
- x (int | float): First input number
- y (int | float): Second input number
- precision (int, optional, default=2): Number of decimal places in result

**Returns**: float - The calculated result

**Raises**:
- TypeError: If x or y is not numeric
- ValueError: If precision < 0

**Example**:

```python
result = calculate(10, 20, precision=3)
print(result)  # 30.000
```

**See Also**: [transform()](#transform), [validate()](#validate)

**Since**: v1.0.0

---

### transform(data, format)

**Description**: Transform input data into specified format.

**Parameters**:
- data (dict | list): Input data to transform
- format (str, default='json'): Output format ('json', 'csv', 'xml')

**Returns**: str - Formatted output

**Example**:

```python
json_str = transform({'a': 1}, format='json')
csv_str = transform([{'a': 1}], format='csv')
```

---

### validate(value, schema)

**Description**: Validate value against schema. *(Deprecated since v1.2.0, use new_validate)*

**Parameters**:
- value: Input value to validate
- schema (dict): Validation schema

**Returns**: bool - True if valid, False otherwise

---

## Classes

### DataProcessor

```python
class DataProcessor:
    def __init__(self, config: dict)
    def process(self, data) -> dict
    def validate(self) -> bool
```

**Description**: Main processor class for data pipeline.

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Invalid input | Input validation failed |
| 401 | Unauthorized | Authentication required |
| 500 | Internal error | Unexpected server error |

---

## Rate Limiting

- API calls: 1000 per minute
- Response time: < 500ms

---

**Last Updated**: 2026-05-09
```

## README.md テンプレート

```markdown
# Project Name

![Build Status](badge_url) ![Coverage](badge_url)

A powerful tool for [describing what it does].

## Features

- ✨ Feature A: Main capability description
- 🚀 Feature B: Quick setup and minimal dependencies
- 🔒 Security: Built-in validation and error handling
- 📊 Scalable: Handles datasets up to 10GB

## Installation

### Requirements

- Python 3.8+
- pip or poetry

### Quick Install

```bash
pip install projectname
```

### From Source

```bash
git clone https://github.com/user/projectname.git
cd projectname
pip install -e .
```

## Quick Start

### Basic Usage

```python
from projectname import calculate

result = calculate(10, 20)
print(result)  # Output: 30
```

### With Options

```python
result = calculate(10, 20, precision=3)
print(result)  # Output: 30.000
```

### Transform Data

```python
from projectname import transform

data = {'name': 'John', 'age': 30}
json_output = transform(data, format='json')
csv_output = transform(data, format='csv')
```

## Advanced Usage

### Configuration

Create a `config.json` file:

```json
{
  "precision": 3,
  "format": "json",
  "logging_level": "info"
}
```

Then load it:

```python
from projectname import DataProcessor

processor = DataProcessor(config_path='config.json')
processor.process(my_data)
```

### Custom Validation

```python
from projectname import validate

schema = {
    'name': str,
    'age': int,
    'email': str
}

is_valid = validate(data, schema)
```

## Configuration

Supported environment variables:

- `PROJECT_PRECISION`: Default precision (default: 2)
- `PROJECT_FORMAT`: Default output format (default: json)
- `PROJECT_LOG_LEVEL`: Logging level (default: info)

## API Reference

See [API.md](API.md) for detailed API documentation.

## Examples

### Example 1: Data Processing Pipeline

```python
from projectname import DataProcessor, transform

processor = DataProcessor()
data = processor.load_csv('input.csv')
processed = processor.process(data)
output = transform(processed, format='json')
processor.save_json('output.json', output)
```

### Example 2: Batch Processing

```python
from projectname import DataProcessor

processor = DataProcessor()
for file in input_files:
    result = processor.process(file)
    save_result(result)
```

## Deprecation Notices

### Deprecated Features

The following features are deprecated and will be removed in v2.0:

- `validate()` function: Use `new_validate()` instead. [Migration Guide](docs/migration.md)
- `legacy_param` parameter: Will be removed. Use `new_param` instead.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) file.

## Support

- 📖 [Documentation](https://docs.example.com)
- 💬 [GitHub Discussions](https://github.com/user/projectname/discussions)
- 🐛 [Issue Tracker](https://github.com/user/projectname/issues)

---

**Last Updated**: 2026-05-09
```

## CHANGELOG.md テンプレート

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-05-09

### Added

- JSON export option in transform() function via `format='json'` parameter
- Custom configuration file support (config.json)
- Streaming API for large dataset processing
- New DataProcessor class for batch operations

### Changed

- `transform()` function now returns formatted string instead of bytes
- Configuration system now supports environment variables
- API documentation now includes error codes and rate limits

### Fixed

- Memory leak when processing files > 1GB
- Incorrect timezone handling in timestamp operations
- XSS vulnerability in user input validation (CVE-2026-1234)

### Deprecated

- `validate()` function: Use `new_validate()` instead (will be removed in v2.0)
- `legacy_param` parameter: Use `new_param` instead

### Removed

- Support for Python 2.7 (EOL)
- Legacy CSV export format

### Security

- Fixed XSS vulnerability in input processing
- Updated dependencies with known vulnerabilities
- Added input sanitization for all user-facing APIs

## [1.2.3] - 2026-05-01

### Fixed

- Fixed bug in calculate() with negative numbers
- Corrected documentation for parameter types

### Added

- Basic type hints for public functions

## [1.2.2] - 2026-04-15

### Added

- Initial support for XML format export

### Fixed

- Parsing error in CSV input

## [1.2.1] - 2026-04-01

### Fixed

- Small fixes in error handling

## [1.2.0] - 2026-03-20

### Added

- CSV export functionality
- Basic data validation

## [1.1.0] - 2026-03-01

### Added

- Python 3.8 support
- Documentation improvements

## [1.0.0] - 2026-02-01

### Added

- Initial release
- Basic calculate() function
- Basic transform() function
- API documentation

---

[Unreleased]: https://github.com/user/projectname/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/projectname/compare/v1.2.3...v1.3.0
[1.2.3]: https://github.com/user/projectname/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/user/projectname/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/user/projectname/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/user/projectname/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/projectname/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/projectname/releases/tag/v1.0.0
```

## サンプル Diff - 新機能追加

```diff
--- a/lib.py
+++ b/lib.py
@@ -1,5 +1,6 @@
 import json
 import csv
+import xml.etree.ElementTree as ET
 
 def calculate(x: int, y: int) -> int:
     """Calculate sum of two numbers."""
@@ -10,15 +11,22 @@ def calculate(x: int, y: int) -> int:
 def transform(data: dict, format: str = 'json') -> str:
-    """Transform data to specified format (json or csv)."""
+    """Transform data to specified format (json, csv, or xml)."""
     
     if format == 'json':
         return json.dumps(data)
     elif format == 'csv':
         return csv.dumps(data)
+    elif format == 'xml':
+        root = ET.Element('data')
+        for key, value in data.items():
+            child = ET.SubElement(root, key)
+            child.text = str(value)
+        return ET.tostring(root, encoding='unicode')
     else:
         raise ValueError(f"Unsupported format: {format}")
 
-def validate(value, schema):
+def new_validate(value: dict, schema: dict) -> bool:
     """Validate value against schema."""
     
     for key, expected_type in schema.items():
```

## サンプル Diff - バグ修正

```diff
--- a/lib.py
+++ b/lib.py
@@ -24,10 +24,15 @@ def transform(data: dict, format: str = 'json') -> str:
 def new_validate(value: dict, schema: dict) -> bool:
     """Validate value against schema."""
     
     for key, expected_type in schema.items():
-        if key not in value or not isinstance(value[key], expected_type):
-            return False
+        if key not in value:
+            return False
+        
+        # Handle timezone-aware datetime
+        if expected_type == datetime and isinstance(value[key], (datetime, str)):
+            continue
+        
+        if not isinstance(value[key], expected_type):
+            return False
     
     return True

```

## 実行例 1: 新機能追加シナリオ

**入力:**

```json
{
  "code_diff": "[上記のサンプル Diff - 新機能追加]",
  "existing_docs": {
    "api_md": "[API.md テンプレート]",
    "readme_md": "[README.md テンプレート]",
    "changelog_md": "[CHANGELOG.md テンプレート]"
  },
  "metadata": {
    "project_name": "projectname",
    "current_version": "1.2.3",
    "change_attribute": "auto"
  }
}
```

**期待される出力:**

1. **API Agent**: 
   - `transform()` の Parameters に `format='xml'` オプションを追加
   - 戻り値説明を更新（xml 対応を追記）
   - 新関数 `new_validate()` を検出、セクション追加提案

2. **README Agent**:
   - Features に「XML export support」を追加
   - Quick Start の例を新規追加（XML 使用例）
   - API Reference リンクの更新を推奨

3. **CHANGELOG Agent**:
   - バージョン判定: 1.2.3 → 1.3.0 (Minor 機能追加)
   - "## [1.3.0] - 2026-05-09" セクションを作成
   - Added に「XML export」を記載
   - Changed に「validate() 関数を new_validate() に改名」を記載

4. **ハーネス統合**:
   - 矛盾なし ✅
   - 全提案品質: 94%
   - 実行可能性: ✅ 実行可能

## 実行例 2: バグ修正シナリオ

**入力:**

```json
{
  "code_diff": "[上記のサンプル Diff - バグ修正]",
  "existing_docs": {
    "api_md": "[API.md テンプレート]",
    "readme_md": "[README.md テンプレート]",
    "changelog_md": "[CHANGELOG.md テンプレート]"
  },
  "metadata": {
    "project_name": "projectname",
    "current_version": "1.3.0",
    "change_attribute": "auto"
  }
}
```

**期待される出力:**

1. **API Agent**:
   - `new_validate()` の説明を更新（timezone 対応を追記）
   - Raises セクションに「ValueError for invalid datetime」を追加

2. **README Agent**:
   - Advanced Usage セクションの例コードを更新（datetime 対応）
   - 変更内容は最小限（バグ修正なので）

3. **CHANGELOG Agent**:
   - バージョン判定: 1.3.0 → 1.3.1 (Patch)
   - "## [1.3.1] - 2026-05-09" セクションを作成
   - Fixed に「Timezone-aware datetime validation」を記載

4. **ハーネス統合**:
   - 矛盾なし ✅
   - 品質: 91%
   - 実行可能性: ✅ 実行可能

---

**最終更新**: 2026-05-09
