## DER LOGICO SIMPLIFICADO

<!-- prettier-ignore-start -->
users
  │
  ├── addresses
  │       │
  │       └── orders
  │
  └── orders
           │
           └── order_items
                    │
                    └── products
                            │
                            └── categories
<!-- prettier-ignore-end -->

## EXPLICACION

Cuando expliques el proyecto, podés decir:

El modelo presentado corresponde a una versión normalizada hasta la Tercera Forma Normal (3FN). Para una implementación en producción podría aplicarse una denormalización controlada en las tablas de pedidos y detalles de pedidos para conservar snapshots históricos de clientes, direcciones y precios al momento de la compra.

Esa frase sola ya demuestra que entendés perfectamente la diferencia entre un diseño académico y uno de negocio.
