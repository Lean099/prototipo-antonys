## order_items

id (PK)

order_id (FK -> orders.id)

product_id (FK -> products.id)

quantity

## Relaciones

Order (1) ------ (N) OrderItem

Product (1) ------ (N) OrderItem
