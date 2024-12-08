-- Seed Script for DB_gestionPedidosOnline_2024

-- Insert Users with different types
INSERT INTO `user` (name_user, pass_user, location_user, type_user) VALUES
    ('Admin Principal', '1234', 'Madrid', 'admin');
   
-- Insert Providers
INSERT INTO `provider` (name_provider, location_provider, pass_provider) VALUES
    ('Frutas y Verduras S.L.', 'Barcelona', '1111');
    
-- Insert Shops with diverse types
INSERT INTO `shop` (name_shop, location_shop, type_shop, subtype_shop, calification_shop) VALUES
    ('Tienda General Perez', 'Madrid', 'general', 2, 4);
  
-- Insert Products for each shop with varied types and ensuring id_shop association
INSERT INTO `product` (name_product, price_product, discount_product, season_product, 
                       calification_product, type_product, subtype_product, stock_product, info_product) VALUES
    -- Products for Shop 1 (General Shop, id_shop = 1)
    ('Aceite de Oliva', 5.50, 10, 'Todo el Año', 4, 'comida', 100, 'Aceite de oliva extra virgen', 1);
   