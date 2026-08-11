## orders

id (PK)

user_id (FK -> users.id)

address_id (FK -> addresses.id)

status

payment_method
payment_status

subtotal
delivery_fee
total

notes

order_type

table_number

created_at
updated_at

## Relaciones

User (1) ------ (N) Order
Address (1) ------ (N) Order

# Observaciones

Acá NO guardamos:

customer_username
customer_email
customer_phone

delivery_street
delivery_number
delivery_details
delivery_neighborhood
delivery_latitude
delivery_longitude

Porque eso ya existe en:

users
addresses

y sería redundancia para la 3FN.
