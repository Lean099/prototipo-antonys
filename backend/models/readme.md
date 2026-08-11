# Resumen rápido

```
Users
│
├── Addresses
│      │
│      └── Orders
│
└── Orders
       │
       └── OrderItems
                │
                └── Products
                        │
                        └── Categories
```

---

# Relaciones

| Tabla | Se relaciona con |
|--------|------------------|
| Users | Addresses, Orders |
| Addresses | Users, Orders |
| Categories | Products |
| Products | Categories, OrderItems |
| Orders | Users, Addresses, OrderItems |
| OrderItems | Orders, Products |