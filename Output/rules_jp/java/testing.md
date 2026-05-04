---
paths:
  - "**/*.java"
---
# Java テスト

> このファイルは [common/testing.md](../common/testing.md) を Java 固有のコンテンツで拡張します。

## テストフレームワーク

- **JUnit 5**（`@Test`、`@ParameterizedTest`、`@Nested`、`@DisplayName`）
- **AssertJ** - 流暢なアサーション（`assertThat(result).isEqualTo(expected)`）
- **Mockito** - 依存関係のモック化
- **Testcontainers** - データベースまたはサービスが必要な統合テスト

## テスト構成

```
src/test/java/com/example/app/
  service/           # サービス層のユニットテスト
  controller/        # Web層 / API テスト
  repository/        # データアクセステスト
  integration/       # クロスレイヤー統合テスト
```

`src/main/java` パッケージ構造を `src/test/java` で反映します。

## ユニットテストパターン

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository);
    }

    @Test
    @DisplayName("findById returns order when exists")
    void findById_existingOrder_returnsOrder() {
        var order = new Order(1L, "Alice", BigDecimal.TEN);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        var result = orderService.findById(1L);

        assertThat(result.customerName()).isEqualTo("Alice");
        verify(orderRepository).findById(1L);
    }

    @Test
    @DisplayName("findById throws when order not found")
    void findById_missingOrder_throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.findById(99L))
            .isInstanceOf(OrderNotFoundException.class)
            .hasMessageContaining("99");
    }
}
```

## パラメータ化テスト

```java
@ParameterizedTest
@CsvSource({
    "100.00, 10, 90.00",
    "50.00, 0, 50.00",
    "200.00, 25, 150.00"
})
@DisplayName("discount applied correctly")
void applyDiscount(BigDecimal price, int pct, BigDecimal expected) {
    assertThat(PricingUtils.discount(price, pct)).isEqualByComparingTo(expected);
}
