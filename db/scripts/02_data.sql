-- Seed script for DB_gestionPedidosOnline_2024
-- Inserting 1 record into each table

-- Seed IP Registry
INSERT INTO ip_registry (ip_address, registration_count, last_attempt) VALUES 
('192.168.1.101', 1, CURRENT_TIMESTAMP);

-- Seed User Table
INSERT INTO `user` (name_user, pass_user, location_user, type_user) VALUES 
('german andino', '0000', 'Bogota, Colombia', 'user'),
('german andino 2', '0000', 'Bogota, Colombia', 'seller');

-- Seed Product Table
INSERT INTO `product` (
    name_product, 
    price_product, 
    discount_product, 
    season_product, 
    calification_product, 
    type_product, 
    subtype_product, 
    stock_product, 
    info_product
) VALUES 
(
    'Lightweight Running Shoes', 
    89.99, 
    5, 
    'spring', 
    5, 
    'footwear', 
    'athletic', 
    30, 
    'Comfortable running shoes with advanced cushioning technology'
);

-- Seed Provider Table
INSERT INTO `provider` (name_provider, location_provider, pass_provider) VALUES 
('SportsTech Suppliers', 'Guadalajara, Mexico', '0000');

-- Seed Shop Table
INSERT INTO `shop` (
    name_shop, 
    location_shop, 
    type_shop, 
    subtype_shop, 
    calification_shop
) VALUES 
(
    'Active Lifestyle Store', 
    'Miami, USA', 
    'sports', 
    'retail', 
    5
);

-- Seed Orders Table
-- Note: This assumes the user and product from above exist
INSERT INTO `orders` (id_user, id_product, finished) VALUES 
(1, 1, 0);

-- Seed Sales Table
-- Note: This assumes the shop, user, and product from above exist
INSERT INTO `sales` (id_shop, id_user, id_product) VALUES 
(1, 1, 1);

-- Seed Inventory Table
-- Note: This assumes the shop, provider, and product from above exist
INSERT INTO `inventory` (id_shop, id_provider, id_product) VALUES 
(1, 1, 1);

-- Seed Produce Table
-- Note: This assumes the provider and product from above exist
INSERT INTO `produce` (id_provider, id_product) VALUES 
(1, 1);