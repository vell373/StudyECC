---
name: rust-patterns
description: 所有権・借用・エラーハンドリング・トレイト・非同期処理をカバーするイディオマティックなRustパターン。RustコードやRustのベストプラクティスに関する質問があるときに使う。
origin: ECC
---

# Rustパターン

## 所有権と借用

```rust
// ムーブセマンティクス
let s1 = String::from("hello");
let s2 = s1; // s1はムーブされた - もう使えない

// クローン（明示的なコピー）
let s1 = String::from("hello");
let s2 = s1.clone();

// 不変参照による借用
fn calculate_length(s: &String) -> usize {
    s.len()
}

// 可変参照（スコープ内で1つのみ）
fn change(s: &mut String) {
    s.push_str(", world");
}

// ライフタイムアノテーション
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

## エラーハンドリング

```rust
use std::fs;
use std::num::ParseIntError;

// Result型の伝播に?演算子を使う
fn read_number(path: &str) -> Result<i32, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let number = content.trim().parse::<i32>()?;
    Ok(number)
}

// カスタムエラー型
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Parse error: {0}")]
    Parse(#[from] ParseIntError),
    #[error("Invalid input: {message}")]
    InvalidInput { message: String },
}

// Option処理
fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some("Alice".to_string()) } else { None }
}

let name = find_user(1)
    .map(|n| n.to_uppercase())
    .unwrap_or_else(|| "Unknown".to_string());
```

## 列挙型とパターンマッチング

```rust
#[derive(Debug)]
enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Triangle { base: f64, height: f64 },
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r) => std::f64::consts::PI * r * r,
            Shape::Rectangle(w, h) => w * h,
            Shape::Triangle { base, height } => 0.5 * base * height,
        }
    }
}

// if letで特定のバリアントを処理
if let Shape::Circle(radius) = shape {
    println!("Circle with radius: {}", radius);
}

// matchのガード
match value {
    x if x < 0 => println!("negative"),
    0 => println!("zero"),
    x if x > 100 => println!("large"),
    x => println!("small positive: {}", x),
}
```

## トレイトとジェネリクス

```rust
// トレイトの定義と実装
trait Drawable {
    fn draw(&self);
    fn bounding_box(&self) -> (f64, f64, f64, f64);
    
    // デフォルト実装
    fn is_visible(&self) -> bool {
        let (x1, y1, x2, y2) = self.bounding_box();
        x2 > x1 && y2 > y1
    }
}

// トレイト境界を持つジェネリクス
fn print_largest<T: PartialOrd + std::fmt::Display>(list: &[T]) {
    if let Some(max) = list.iter().max_by(|a, b| a.partial_cmp(b).unwrap()) {
        println!("Largest: {}", max);
    }
}

// where句（複雑な境界に最適）
fn complex_function<T, U>(t: &T, u: &U) -> String
where
    T: std::fmt::Debug + Clone,
    U: std::fmt::Display + PartialOrd,
{
    format!("{:?} {}", t, u)
}

// トレイトオブジェクト（動的ディスパッチ）
fn draw_all(shapes: &[Box<dyn Drawable>]) {
    for shape in shapes {
        shape.draw();
    }
}
```

## イテレータとクロージャ

```rust
let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// イテレータの連鎖
let result: Vec<i32> = numbers.iter()
    .filter(|&&x| x % 2 == 0)
    .map(|&x| x * x)
    .collect();

// fold（reduce）
let sum: i32 = numbers.iter().sum();
let product: i32 = numbers.iter().product();

// カスタムイテレータ
struct Counter {
    count: u32,
    max: u32,
}

impl Iterator for Counter {
    type Item = u32;
    
    fn next(&mut self) -> Option<u32> {
        if self.count < self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

// クロージャのキャプチャ
let threshold = 5;
let above_threshold: Vec<_> = numbers.iter()
    .filter(|&&x| x > threshold)
    .collect();
```

## 並行処理

```rust
use std::sync::{Arc, Mutex};
use std::thread;

// スレッド間で状態を共有
let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    });
    handles.push(handle);
}

for handle in handles {
    handle.join().unwrap();
}

// チャンネルを使ったメッセージパッシング
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();

thread::spawn(move || {
    tx.send("hello from thread").unwrap();
});

let received = rx.recv().unwrap();

// 複数のプロデューサー
let tx2 = tx.clone();
```

## 非同期Rust（Tokio）

```rust
use tokio;

#[tokio::main]
async fn main() {
    let result = fetch_data("https://api.example.com/data").await;
    match result {
        Ok(data) => println!("Got: {}", data),
        Err(e) => eprintln!("Error: {}", e),
    }
}

async fn fetch_data(url: &str) -> Result<String, reqwest::Error> {
    let response = reqwest::get(url).await?;
    let text = response.text().await?;
    Ok(text)
}

// 並行タスク
async fn parallel_fetch() {
    let (result1, result2) = tokio::join!(
        fetch_data("https://api1.example.com"),
        fetch_data("https://api2.example.com")
    );
}

// チャンネルを使った非同期通信
use tokio::sync::mpsc;

async fn async_worker() {
    let (tx, mut rx) = mpsc::channel(32);
    
    tokio::spawn(async move {
        tx.send("work item").await.unwrap();
    });
    
    while let Some(item) = rx.recv().await {
        println!("Processing: {}", item);
    }
}
```

## unsafeコード

```rust
// unsafeを最小限に制限し、安全なインターフェースでラップする
pub fn safe_split_at(slice: &[u8], mid: usize) -> (&[u8], &[u8]) {
    assert!(mid <= slice.len());
    unsafe {
        // unsafeブロックが正当な理由: midが検証済みなためUBなし
        (
            std::slice::from_raw_parts(slice.as_ptr(), mid),
            std::slice::from_raw_parts(slice.as_ptr().add(mid), slice.len() - mid),
        )
    }
}

// FFI（外部関数インターフェース）
extern "C" {
    fn abs(input: i32) -> i32;
}

unsafe {
    println!("Absolute value: {}", abs(-3));
}
```

## モジュール構造

```
src/
├── main.rs          # エントリーポイント
├── lib.rs           # ライブラリのルート
├── error.rs         # カスタムエラー型
├── config.rs        # 設定構造体
└── handlers/
    ├── mod.rs       # ハンドラーモジュールのルート
    ├── user.rs      # ユーザーハンドラー
    └── product.rs   # 商品ハンドラー
```

```rust
// lib.rs
pub mod error;
pub mod config;
pub mod handlers;

// 再エクスポート
pub use error::AppError;
pub use config::Config;
```

## Clippyとフォーマット

```bash
# コードの品質チェック
cargo clippy -- -D warnings

# コードのフォーマット
cargo fmt

# 徹底的なチェックで実行
cargo clippy --all-targets --all-features -- -D warnings
```
