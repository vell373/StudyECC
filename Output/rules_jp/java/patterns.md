---
paths:
  - "**/*.java"
---
# Java パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Java 固有のコンテンツで拡張します。

## リポジトリパターン

インターフェースの背後にデータアクセスをカプセル化:

```java
public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findAll();
    Order save(Order order);
    void deleteById(Long id);
}
```

具体的な実装がストレージの詳細を処理（JPA、JDBC、テスト用インメモリ）。

## サービス層

サービスクラスのビジネスロジック; コントローラーとリポジトリーを薄く保つ:

```java
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    public OrderSummary placeOrder(CreateOrderRequest request) {
        var order = Order.from(request);
        paymentGateway.charge(order.total());
        var saved = orderRepository.save(order);
        return OrderSummary.from(saved);
    }
}
```

## コンストラクタインジェクション

常にコンストラクタインジェクションを使用 — フィールドインジェクションを使用しない:

```java
// GOOD — コンストラクタインジェクション（テスト可能、不変）
public class NotificationService {
    private final EmailSender emailSender;

    public NotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }
}

// BAD — フィールドインジェクション（リフレクションなしでテスト不可、フレームワークマジックが必要）
public class NotificationService {
    @Inject // または @Autowired
    private EmailSender emailSender;
}
```

## DTO マッピング

DTO に records を使用。サービス/コントローラー境界でマップ:

```java
public record OrderResponse(Long id, String customer, BigDecimal total) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getTotal());
    }
}
```

## ビルダーパターン
