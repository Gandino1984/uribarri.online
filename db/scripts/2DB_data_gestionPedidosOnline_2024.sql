INSERT INTO `user` (name_user, pass_user, location_user, type_user) VALUES
('German Andino', '3388', 'Uribarri', 'seller'),
('German Andino 2', '3388', 'Uribarri', 'user'),
('Kebab Matiko', '1234', 'Uribarri', 'seller'),
('Kebab Matiko 2', '1234', 'Uribarri', 'user'),
('Kebab Salcedo', '1234', 'Castaños', 'seller'),
('Kebab Salcedo 2', '1234', 'Castaños', 'user'),
('Margherita La Fina', '1234', 'Uribarri', 'seller'),
('Margherita La Fina 2', '1234', 'Uribarri', 'user');


-- Insert Shop (associated with Ana Lopez - the seller user)
INSERT INTO `shop` (name_shop, location_shop, type_shop, subtype_shop, description_shop, id_user, calification_shop) VALUES
('Kebab Matiko', 'Uribarri, calle Matiko, 14.', 'Restaurante', 'Turco', 'Comida tipo turca y pollería.', 3, 0),
('Kebab Salcedo', 'Uribarri, calle Castaños.', 'Restaurante', 'Turco', 'Comida tipo turca.', 5, 0),
('Margherita La Fina', ' Uribarri, Calle Uribarri.', 'Restaurante', 'Italiano', 'Comida tipo italiana.', 7, 0);

-- Insert Products for the Shop
INSERT INTO `product` (name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop) VALUES
('Doner Kebab', 7.50, 0, 'Todo el Año', 0, 'Menu',  0, 'Doner Kebab, patatas y refresco.', 1);
