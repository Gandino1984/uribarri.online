-- -----------------------------------------------------
-- Seed Data for DB_gestionPedidosOnline_2024
-- Based on the provided static arrays structure
-- -----------------------------------------------------

USE `DB_gestionPedidosOnline_2024`;

-- -----------------------------------------------------
-- Insert initial German Andino user
-- -----------------------------------------------------
INSERT INTO `user` (`name_user`, `pass_user`, `location_user`, `type_user`, `calification_user`, `contributor_user`, `age_user`) VALUES
('German Andino', '$2b$10$YourHashedPasswordHere', 'Bilbao', 'German Andino', 5, 1, 30);

-- -----------------------------------------------------
-- Insert shop types
-- -----------------------------------------------------
INSERT INTO `type` (`name_type`, `verified_type`, `createdby_type`) VALUES
('Arte y Artesanía', 1, 'German Andino'),
('Alimentación y hogar', 1, 'German Andino'),
('Consultoría', 1, 'German Andino'),
('Educativa', 1, 'German Andino'),
('Entretenimiento', 1, 'German Andino'),
('Especializado', 1, 'German Andino'),
('Ropa', 1, 'German Andino'),
('Salud y Bienestar', 1, 'German Andino'),
('Servicios', 1, 'German Andino'),
('Taller', 1, 'German Andino'),
('Técnico', 1, 'German Andino');

-- -----------------------------------------------------
-- Insert shop subtypes
-- -----------------------------------------------------
-- Arte y Artesanía (id: 1)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Accesorios', 1, 1, 'German Andino'),
('Cuero', 1, 1, 'German Andino'),
('Decoración', 1, 1, 'German Andino'),
('Ilustración', 1, 1, 'German Andino'),
('Madera', 1, 1, 'German Andino'),
('Cerámica', 1, 1, 'German Andino'),
('Textil', 1, 1, 'German Andino'),
('Varios', 1, 1, 'German Andino');

-- Alimentación y hogar (id: 2)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Asador', 2, 1, 'German Andino'),
('Carnicería', 2, 1, 'German Andino'),
('Charcutería', 2, 1, 'German Andino'),
('Ecológica', 2, 1, 'German Andino'),
('Frutas, verduras y conservas', 2, 1, 'German Andino'),
('Local', 2, 1, 'German Andino'),
('Panadería', 2, 1, 'German Andino'),
('Pescadería', 2, 1, 'German Andino'),
('Peruana', 2, 1, 'German Andino'),
('China', 2, 1, 'German Andino'),
('Japonesa', 2, 1, 'German Andino'),
('Italiana', 2, 1, 'German Andino'),
('Turca', 2, 1, 'German Andino'),
('Ultra marinos', 2, 1, 'German Andino'),
('Kebab', 2, 1, 'German Andino'),
('Restaurante', 2, 1, 'German Andino'),
('Varios', 2, 1, 'German Andino');

-- Consultoría (id: 3)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Digital', 3, 1, 'German Andino'),
('Formativa', 3, 1, 'German Andino'),
('Gestión Cultural', 3, 1, 'German Andino'),
('Inmobiliaria', 3, 1, 'German Andino'),
('Jurídica', 3, 1, 'German Andino'),
('Seguros', 3, 1, 'German Andino'),
('Técnica', 3, 1, 'German Andino'),
('Varios', 3, 1, 'German Andino');

-- Educativa (id: 4)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Asesoría', 4, 1, 'German Andino'),
('Charla', 4, 1, 'German Andino'),
('Clases de cocina', 4, 1, 'German Andino'),
('Clases de fotografía', 4, 1, 'German Andino'),
('Clases de música', 4, 1, 'German Andino'),
('Clases de pintura', 4, 1, 'German Andino'),
('Clases de yoga', 4, 1, 'German Andino'),
('Conferencias', 4, 1, 'German Andino'),
('Curso', 4, 1, 'German Andino'),
('Investigación', 4, 1, 'German Andino'),
('Librería', 4, 1, 'German Andino'),
('Presentación', 4, 1, 'German Andino'),
('Talleres', 4, 1, 'German Andino'),
('Clases de baile', 4, 1, 'German Andino'),
('Clases de idiomas', 4, 1, 'German Andino'),
('Clases de teatro', 4, 1, 'German Andino'),
('Clases de deportes', 4, 1, 'German Andino'),
('Clases de arte', 4, 1, 'German Andino'),
('Clases de manualidades', 4, 1, 'German Andino'),
('Clases de cocina infantiles', 4, 1, 'German Andino'),
('Clases de música infantiles', 4, 1, 'German Andino'),
('Clases de teatro infantiles', 4, 1, 'German Andino'),
('Clases de deportes infantiles', 4, 1, 'German Andino'),
('Clases de arte infantiles', 4, 1, 'German Andino'),
('Clases de manualidades para adultos', 4, 1, 'German Andino'),
('Clases de manualidades infantiles', 4, 1, 'German Andino'),
('Varios', 4, 1, 'German Andino');

-- Entretenimiento (id: 5)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Baile', 5, 1, 'German Andino'),
('Danza', 5, 1, 'German Andino'),
('Escape Room', 5, 1, 'German Andino'),
('Infantil', 5, 1, 'German Andino'),
('Juvenil', 5, 1, 'German Andino'),
('Tercera edad', 5, 1, 'German Andino'),
('Txiki park', 5, 1, 'German Andino'),
('Juguetería', 5, 1, 'German Andino'),
('Música', 5, 1, 'German Andino'),
('Teatro', 5, 1, 'German Andino'),
('Viajes', 5, 1, 'German Andino'),
('Varios', 5, 1, 'German Andino');

-- Especializado (id: 6)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Arte', 6, 1, 'German Andino'),
('Autoescuela', 6, 1, 'German Andino'),
('Bodega', 6, 1, 'German Andino'),
('Concept Store', 6, 1, 'German Andino'),
('Desarrollo web', 6, 1, 'German Andino'),
('Dietética y nutrición', 6, 1, 'German Andino'),
('Diseño gráfico', 6, 1, 'German Andino'),
('Electrodoméstico', 6, 1, 'German Andino'),
('Estanco', 6, 1, 'German Andino'),
('Estudio de arte', 6, 1, 'German Andino'),
('Golosinas', 6, 1, 'German Andino'),
('Ilustración', 6, 1, 'German Andino'),
('Joyería', 6, 1, 'German Andino'),
('Locutorio', 6, 1, 'German Andino'),
('Peluquería canina', 6, 1, 'German Andino'),
('Prensa', 6, 1, 'German Andino'),
('Programación', 6, 1, 'German Andino'),
('Tattoo shop', 6, 1, 'German Andino'),
('Vinoteca', 6, 1, 'German Andino'),
('Zapatería', 6, 1, 'German Andino'),
('Varios', 6, 1, 'German Andino');

-- Ropa (id: 7)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Abrigo', 7, 1, 'German Andino'),
('Accesorio', 7, 1, 'German Andino'),
('Calcetine', 7, 1, 'German Andino'),
('Calzado', 7, 1, 'German Andino'),
('Chaqueta', 7, 1, 'German Andino'),
('Camiseta', 7, 1, 'German Andino'),
('Falda', 7, 1, 'German Andino'),
('Infantil', 7, 1, 'German Andino'),
('Lencería', 7, 1, 'German Andino'),
('Pantaloneta', 7, 1, 'German Andino'),
('Pantalón', 7, 1, 'German Andino'),
('Pijama', 7, 1, 'German Andino'),
('Ropa de deporte', 7, 1, 'German Andino'),
('Ropa interior', 7, 1, 'German Andino'),
('Ropa de maternidad', 7, 1, 'German Andino'),
('Ropa de trabajo', 7, 1, 'German Andino'),
('Segunda mano', 7, 1, 'German Andino'),
('Vestido', 7, 1, 'German Andino'),
('Vintage', 7, 1, 'German Andino'),
('Varios', 7, 1, 'German Andino');

-- Salud y Bienestar (id: 8)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Baile', 8, 1, 'German Andino'),
('Dietética', 8, 1, 'German Andino'),
('Imagen personal', 8, 1, 'German Andino'),
('Fisioterapia', 8, 1, 'German Andino'),
('Gimnasio', 8, 1, 'German Andino'),
('Manicura y pedicura', 8, 1, 'German Andino'),
('Odontología', 8, 1, 'German Andino'),
('Osteopatía', 8, 1, 'German Andino'),
('Parafarmacia', 8, 1, 'German Andino'),
('Peluquería', 8, 1, 'German Andino'),
('Surf', 8, 1, 'German Andino'),
('Txoko', 8, 1, 'German Andino'),
('Varios', 8, 1, 'German Andino'),
('Yoga', 8, 1, 'German Andino');

-- Servicios (id: 9)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Arte', 9, 1, 'German Andino'),
('Catering', 9, 1, 'German Andino'),
('Construcción', 9, 1, 'German Andino'),
('Dibujo', 9, 1, 'German Andino'),
('Electricidad', 9, 1, 'German Andino'),
('Fotografía', 9, 1, 'German Andino'),
('Fontanería', 9, 1, 'German Andino'),
('Interiorismo', 9, 1, 'German Andino'),
('Limpieza', 9, 1, 'German Andino'),
('Pintura', 9, 1, 'German Andino'),
('Cuidado geriátrico', 9, 1, 'German Andino'),
('Paseo de mascotas', 9, 1, 'German Andino'),
('Limpieza de coches', 9, 1, 'German Andino'),
('Voluntariado', 9, 1, 'German Andino'),
('Varios', 9, 1, 'German Andino');

-- Taller (id: 10)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Diseño', 10, 1, 'German Andino'),
('Escultura', 10, 1, 'German Andino'),
('Ilustración', 10, 1, 'German Andino'),
('Mecánico', 10, 1, 'German Andino'),
('Pintura', 10, 1, 'German Andino'),
('Varios', 10, 1, 'German Andino');

-- Técnico (id: 11)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Albañilería', 11, 1, 'German Andino'),
('Reparación de vehículo', 11, 1, 'German Andino'),
('Accesorios de coche', 11, 1, 'German Andino'),
('Accesorios de moto', 11, 1, 'German Andino'),
('Carpintería', 11, 1, 'German Andino'),
('Calefacción', 11, 1, 'German Andino'),
('Cerrajería', 11, 1, 'German Andino'),
('Electricidad', 11, 1, 'German Andino'),
('Electrónica', 11, 1, 'German Andino'),
('Fontanería', 11, 1, 'German Andino'),
('Repuestos', 11, 1, 'German Andino'),
('Repuestos de coche', 11, 1, 'German Andino'),
('Repuestos de moto', 11, 1, 'German Andino'),
('Varios', 11, 1, 'German Andino');

-- -----------------------------------------------------
-- Insert product categories
-- -----------------------------------------------------
INSERT INTO `product_category` (`name_category`, `verified_category`, `createdby_category`) VALUES
('Accesorios', 1, 'German Andino'),
('Artesanía', 1, 'German Andino'),
('Belleza', 1, 'German Andino'),
('Bebida', 1, 'German Andino'),
('Calzado', 1, 'German Andino'),
('Comida', 1, 'German Andino'),
('Educativo', 1, 'German Andino'),
('Electrónica', 1, 'German Andino'),
('Joyería', 1, 'German Andino'),
('Muebles', 1, 'German Andino'),
('Sesión', 1, 'German Andino'),
('Ropa', 1, 'German Andino'),
('Salud', 1, 'German Andino'),
('Servicio', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- -----------------------------------------------------
-- Insert product subcategories
-- -----------------------------------------------------
-- Accesorios subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Bolso', 1, 'German Andino'),
('Gafas', 1, 'German Andino'),
('Joyería', 1, 'German Andino'),
('Reloj', 1, 'German Andino'),
('Cinturón', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Artesanía subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Anillo', 1, 'German Andino'),
('Collar', 1, 'German Andino'),
('Pendientes', 1, 'German Andino'),
('Pulsera', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Belleza subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Productos de Belleza', 1, 'German Andino'),
('Productos para Cabello', 1, 'German Andino'),
('Maquillaje', 1, 'German Andino'),
('Perfume', 1, 'German Andino'),
('Productos para Piel', 1, 'German Andino'),
('Skincare', 1, 'German Andino');

-- Bebida subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Alcohol', 1, 'German Andino'),
('Café', 1, 'German Andino'),
('Refresco', 1, 'German Andino'),
('Té', 1, 'German Andino'),
('Zumo', 1, 'German Andino'),
('Agua', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Calzado subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Bailarinas', 1, 'German Andino'),
('Botas', 1, 'German Andino'),
('Deportivas', 1, 'German Andino'),
('Zapatillas', 1, 'German Andino'),
('Sandalias', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Comida subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Bebida', 1, 'German Andino'),
('Entrante', 1, 'German Andino'),
('Plato Principal', 1, 'German Andino'),
('Postre', 1, 'German Andino'),
('Snack', 1, 'German Andino'),
('Panadería', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Educativo subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Asesoría', 1, 'German Andino'),
('Charla', 1, 'German Andino'),
('Clases privadas', 1, 'German Andino'),
('Clases de música', 1, 'German Andino'),
('Clases de pintura', 1, 'German Andino'),
('Curso', 1, 'German Andino'),
('Investigación', 1, 'German Andino'),
('Librería', 1, 'German Andino'),
('Presentación', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Electrónica subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Accesorios', 1, 'German Andino'),
('Audio', 1, 'German Andino'),
('Móvil', 1, 'German Andino'),
('Ordenador', 1, 'German Andino'),
('Tablet', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Joyería subcategories (reusing from Artesanía)
-- Already inserted above

-- Muebles subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Baño', 1, 'German Andino'),
('Cocina', 1, 'German Andino'),
('Dormitorio', 1, 'German Andino'),
('Jardín', 1, 'German Andino'),
('Salón', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Sesión subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Escape room', 1, 'German Andino'),
('Hall game', 1, 'German Andino'),
('Juegos pórtatiles', 1, 'German Andino'),
('Escape de ciudad', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Ropa subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Abrigo', 1, 'German Andino'),
('Accesorios', 1, 'German Andino'),
('Calcetines', 1, 'German Andino'),
('Calzado', 1, 'German Andino'),
('Camiseta', 1, 'German Andino'),
('Chaqueta', 1, 'German Andino'),
('Falda', 1, 'German Andino'),
('Lencería', 1, 'German Andino'),
('Pantalón', 1, 'German Andino'),
('Pantaloneta', 1, 'German Andino'),
('Pijama', 1, 'German Andino'),
('Ropa de deporte', 1, 'German Andino'),
('Ropa de maternidad', 1, 'German Andino'),
('Ropa de trabajo', 1, 'German Andino'),
('Vestido', 1, 'German Andino'),
('Varios', 1, 'German Andino');

-- Salud subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Cuidado Personal', 1, 'German Andino'),
('Higiene', 1, 'German Andino'),
('Medicina', 1, 'German Andino'),
('Suplementos', 1, 'German Andino');

-- Servicio subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Asesoría', 1, 'German Andino'),
('Informático', 1, 'German Andino'),
('Instalación', 1, 'German Andino'),
('Limpieza', 1, 'German Andino'),
('Mantenimiento', 1, 'German Andino'),
('Reparación', 1, 'German Andino');

-- Varios subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('General', 1, 'German Andino'),
('Otros', 1, 'German Andino');

-- -----------------------------------------------------
-- Create category-subcategory relationships
-- Based on productTypesAndSubtypes mapping
-- -----------------------------------------------------
-- Note: IDs are based on the order of insertion above
-- Categories: 1=Accesorios, 2=Artesanía, 3=Belleza, 4=Bebida, 5=Calzado, 6=Comida, 7=Educativo, 
-- 8=Electrónica, 9=Joyería, 10=Muebles, 11=Sesión, 12=Ropa, 13=Salud, 14=Servicio, 15=Varios

-- Accesorios (1) -> Bolso(1), Gafas(2), Joyería(3), Reloj(4), Cinturón(5), Varios(6)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6);

-- Artesanía (2) -> Anillo(7), Collar(8), Pendientes(9), Pulsera(10), Varios(11)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(2, 7), (2, 8), (2, 9), (2, 10), (2, 11);

-- Belleza (3) -> Productos de Belleza(12), Productos para Cabello(13), Maquillaje(14), Perfume(15), Productos para Piel(16), Skincare(17)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(3, 12), (3, 13), (3, 14), (3, 15), (3, 16), (3, 17);

-- Bebida (4) -> Alcohol(18), Café(19), Refresco(20), Té(21), Zumo(22), Agua(23), Varios(24)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(4, 18), (4, 19), (4, 20), (4, 21), (4, 22), (4, 23), (4, 24);

-- Calzado (5) -> Bailarinas(25), Botas(26), Deportivas(27), Zapatillas(28), Sandalias(29), Varios(30)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(5, 25), (5, 26), (5, 27), (5, 28), (5, 29), (5, 30);

-- Comida (6) -> Bebida(31), Entrante(32), Plato Principal(33), Postre(34), Snack(35), Panadería(36), Varios(37)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(6, 31), (6, 32), (6, 33), (6, 34), (6, 35), (6, 36), (6, 37);

-- Educativo (7) -> Asesoría(38), Charla(39), Clases privadas(40), Clases de música(41), Clases de pintura(42), 
--                  Curso(43), Investigación(44), Librería(45), Presentación(46), Varios(47)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(7, 38), (7, 39), (7, 40), (7, 41), (7, 42), (7, 43), (7, 44), (7, 45), (7, 46), (7, 47);

-- Electrónica (8) -> Accesorios(48), Audio(49), Móvil(50), Ordenador(51), Tablet(52), Varios(53)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(8, 48), (8, 49), (8, 50), (8, 51), (8, 52), (8, 53);

-- Joyería (9) -> Reusing Artesanía subcategories: Anillo(7), Collar(8), Pendientes(9), Pulsera(10), Varios(11)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(9, 7), (9, 8), (9, 9), (9, 10), (9, 11);

-- Muebles (10) -> Baño(54), Cocina(55), Dormitorio(56), Jardín(57), Salón(58), Varios(59)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(10, 54), (10, 55), (10, 56), (10, 57), (10, 58), (10, 59);

-- Sesión (11) -> Escape room(60), Hall game(61), Juegos pórtatiles(62), Escape de ciudad(63), Varios(64)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(11, 60), (11, 61), (11, 62), (11, 63), (11, 64);

-- Ropa (12) -> Abrigo(65), Accesorios(66), Calcetines(67), Calzado(68), Camiseta(69), Chaqueta(70), 
--              Falda(71), Lencería(72), Pantalón(73), Pantaloneta(74), Pijama(75), Ropa de deporte(76), 
--              Ropa de maternidad(77), Ropa de trabajo(78), Vestido(79), Varios(80)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(12, 65), (12, 66), (12, 67), (12, 68), (12, 69), (12, 70), (12, 71), (12, 72), 
(12, 73), (12, 74), (12, 75), (12, 76), (12, 77), (12, 78), (12, 79), (12, 80);

-- Salud (13) -> Cuidado Personal(81), Higiene(82), Medicina(83), Suplementos(84)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(13, 81), (13, 82), (13, 83), (13, 84);

-- Servicio (14) -> Asesoría(85), Informático(86), Instalación(87), Limpieza(88), Mantenimiento(89), Reparación(90)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(14, 85), (14, 86), (14, 87), (14, 88), (14, 89), (14, 90);

-- Varios (15) -> General(91), Otros(92)
INSERT INTO `category_subcategory` (`id_category`, `id_subcategory`) VALUES
(15, 91), (15, 92);

-- Note: Some subcategories like "Varios" appear in multiple categories, which is why we need the many-to-many relationship

-- -----------------------------------------------------
-- Create type-category relationships
-- Based on shopToProductTypesMap
-- -----------------------------------------------------
-- Arte y Artesanía (1) -> Artesanía(2), Accesorios(1), Joyería(9)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(1, 2), (1, 1), (1, 9);

-- Alimentación y hogar (2) -> Comida(6), Bebida(4)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(2, 6), (2, 4);

-- Consultoría (3) -> Servicio(14), Educativo(7)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(3, 14), (3, 7);

-- Educativa (4) -> Educativo(7), Servicio(14)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(4, 7), (4, 14);

-- Entretenimiento (5) -> Sesión(11), Varios(15)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(5, 11), (5, 15);

-- Especializado (6) -> Varios(15), Electrónica(8), Joyería(9), Muebles(10)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(6, 15), (6, 8), (6, 9), (6, 10);

-- Ropa (7) -> Ropa(12), Calzado(5), Accesorios(1)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(7, 12), (7, 5), (7, 1);

-- Salud y Bienestar (8) -> Salud(13), Belleza(3), Servicio(14)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(8, 13), (8, 3), (8, 14);

-- Servicios (9) -> Servicio(14), Varios(15)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(9, 14), (9, 15);

-- Taller (10) -> Artesanía(2), Servicio(14)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(10, 2), (10, 14);

-- Técnico (11) -> Servicio(14), Electrónica(8), Muebles(10)
INSERT INTO `type_category` (`id_type`, `id_category`) VALUES
(11, 14), (11, 8), (11, 10);

-- -----------------------------------------------------
-- Insert sample riders (users with type 'rider')
-- -----------------------------------------------------
INSERT INTO `user` (`name_user`, `pass_user`, `location_user`, `type_user`, `calification_user`, `contributor_user`, `age_user`) VALUES
('Juan Repartidor', '$2b$10$YourHashedPasswordHere', 'Bilbao', 'rider', 5, 0, 25),
('María Delivery', '$2b$10$YourHashedPasswordHere', 'Bilbao', 'rider', 5, 0, 28);

-- -----------------------------------------------------
-- End of seed data
-- -----------------------------------------------------