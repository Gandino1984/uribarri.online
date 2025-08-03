-- -----------------------------------------------------
-- Seed Data for DB_gestionPedidosOnline_2024
-- Based on the provided static arrays structure
-- -----------------------------------------------------

USE `DB_gestionPedidosOnline_2024`;

-- -----------------------------------------------------
-- Insert initial admin user
-- -----------------------------------------------------
INSERT INTO `user` (`name_user`, `pass_user`, `location_user`, `type_user`, `calification_user`, `contributor_user`, `age_user`) VALUES
('Admin', '$2b$10$YourHashedPasswordHere', 'Bilbao', 'admin', 5, 1, 30);

-- -----------------------------------------------------
-- Insert shop types
-- -----------------------------------------------------
INSERT INTO `type` (`name_type`, `verified_type`, `createdby_type`) VALUES
('Arte y Artesanía', 1, 'admin'),
('Alimentación y hogar', 1, 'admin'),
('Consultoría', 1, 'admin'),
('Educativa', 1, 'admin'),
('Entretenimiento', 1, 'admin'),
('Especializado', 1, 'admin'),
('Ropa', 1, 'admin'),
('Salud y Bienestar', 1, 'admin'),
('Servicios', 1, 'admin'),
('Taller', 1, 'admin'),
('Técnico', 1, 'admin');

-- -----------------------------------------------------
-- Insert shop subtypes
-- -----------------------------------------------------
-- Arte y Artesanía (id: 1)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Accesorios', 1, 1, 'admin'),
('Cuero', 1, 1, 'admin'),
('Decoración', 1, 1, 'admin'),
('Ilustración', 1, 1, 'admin'),
('Madera', 1, 1, 'admin'),
('Cerámica', 1, 1, 'admin'),
('Textil', 1, 1, 'admin'),
('Varios', 1, 1, 'admin');

-- Alimentación y hogar (id: 2)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Asador', 2, 1, 'admin'),
('Carnicería', 2, 1, 'admin'),
('Charcutería', 2, 1, 'admin'),
('Ecológica', 2, 1, 'admin'),
('Frutas, verduras y conservas', 2, 1, 'admin'),
('Local', 2, 1, 'admin'),
('Panadería', 2, 1, 'admin'),
('Pescadería', 2, 1, 'admin'),
('Peruana', 2, 1, 'admin'),
('China', 2, 1, 'admin'),
('Japonesa', 2, 1, 'admin'),
('Italiana', 2, 1, 'admin'),
('Turca', 2, 1, 'admin'),
('Ultra marinos', 2, 1, 'admin'),
('Kebab', 2, 1, 'admin'),
('Restaurante', 2, 1, 'admin'),
('Varios', 2, 1, 'admin');

-- Consultoría (id: 3)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Digital', 3, 1, 'admin'),
('Formativa', 3, 1, 'admin'),
('Gestión Cultural', 3, 1, 'admin'),
('Inmobiliaria', 3, 1, 'admin'),
('Jurídica', 3, 1, 'admin'),
('Seguros', 3, 1, 'admin'),
('Técnica', 3, 1, 'admin'),
('Varios', 3, 1, 'admin');

-- Educativa (id: 4)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Asesoría', 4, 1, 'admin'),
('Charla', 4, 1, 'admin'),
('Clases de cocina', 4, 1, 'admin'),
('Clases de fotografía', 4, 1, 'admin'),
('Clases de música', 4, 1, 'admin'),
('Clases de pintura', 4, 1, 'admin'),
('Clases de yoga', 4, 1, 'admin'),
('Conferencias', 4, 1, 'admin'),
('Curso', 4, 1, 'admin'),
('Investigación', 4, 1, 'admin'),
('Librería', 4, 1, 'admin'),
('Presentación', 4, 1, 'admin'),
('Talleres', 4, 1, 'admin'),
('Clases de baile', 4, 1, 'admin'),
('Clases de idiomas', 4, 1, 'admin'),
('Clases de teatro', 4, 1, 'admin'),
('Clases de deportes', 4, 1, 'admin'),
('Clases de arte', 4, 1, 'admin'),
('Clases de manualidades', 4, 1, 'admin'),
('Clases de cocina infantiles', 4, 1, 'admin'),
('Clases de música infantiles', 4, 1, 'admin'),
('Clases de teatro infantiles', 4, 1, 'admin'),
('Clases de deportes infantiles', 4, 1, 'admin'),
('Clases de arte infantiles', 4, 1, 'admin'),
('Clases de manualidades para adultos', 4, 1, 'admin'),
('Clases de manualidades infantiles', 4, 1, 'admin'),
('Varios', 4, 1, 'admin');

-- Entretenimiento (id: 5)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Baile', 5, 1, 'admin'),
('Danza', 5, 1, 'admin'),
('Escape Room', 5, 1, 'admin'),
('Infantil', 5, 1, 'admin'),
('Juvenil', 5, 1, 'admin'),
('Tercera edad', 5, 1, 'admin'),
('Txiki park', 5, 1, 'admin'),
('Juguetería', 5, 1, 'admin'),
('Música', 5, 1, 'admin'),
('Teatro', 5, 1, 'admin'),
('Viajes', 5, 1, 'admin'),
('Varios', 5, 1, 'admin');

-- Especializado (id: 6)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Arte', 6, 1, 'admin'),
('Autoescuela', 6, 1, 'admin'),
('Bodega', 6, 1, 'admin'),
('Concept Store', 6, 1, 'admin'),
('Desarrollo web', 6, 1, 'admin'),
('Dietética y nutrición', 6, 1, 'admin'),
('Diseño gráfico', 6, 1, 'admin'),
('Electrodoméstico', 6, 1, 'admin'),
('Estanco', 6, 1, 'admin'),
('Estudio de arte', 6, 1, 'admin'),
('Golosinas', 6, 1, 'admin'),
('Ilustración', 6, 1, 'admin'),
('Joyería', 6, 1, 'admin'),
('Locutorio', 6, 1, 'admin'),
('Peluquería canina', 6, 1, 'admin'),
('Prensa', 6, 1, 'admin'),
('Programación', 6, 1, 'admin'),
('Tattoo shop', 6, 1, 'admin'),
('Vinoteca', 6, 1, 'admin'),
('Zapatería', 6, 1, 'admin'),
('Varios', 6, 1, 'admin');

-- Ropa (id: 7)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Abrigo', 7, 1, 'admin'),
('Accesorio', 7, 1, 'admin'),
('Calcetine', 7, 1, 'admin'),
('Calzado', 7, 1, 'admin'),
('Chaqueta', 7, 1, 'admin'),
('Camiseta', 7, 1, 'admin'),
('Falda', 7, 1, 'admin'),
('Infantil', 7, 1, 'admin'),
('Lencería', 7, 1, 'admin'),
('Pantaloneta', 7, 1, 'admin'),
('Pantalón', 7, 1, 'admin'),
('Pijama', 7, 1, 'admin'),
('Ropa de deporte', 7, 1, 'admin'),
('Ropa interior', 7, 1, 'admin'),
('Ropa de maternidad', 7, 1, 'admin'),
('Ropa de trabajo', 7, 1, 'admin'),
('Segunda mano', 7, 1, 'admin'),
('Vestido', 7, 1, 'admin'),
('Vintage', 7, 1, 'admin'),
('Varios', 7, 1, 'admin');

-- Salud y Bienestar (id: 8)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Baile', 8, 1, 'admin'),
('Dietética', 8, 1, 'admin'),
('Imagen personal', 8, 1, 'admin'),
('Fisioterapia', 8, 1, 'admin'),
('Gimnasio', 8, 1, 'admin'),
('Manicura y pedicura', 8, 1, 'admin'),
('Odontología', 8, 1, 'admin'),
('Osteopatía', 8, 1, 'admin'),
('Parafarmacia', 8, 1, 'admin'),
('Peluquería', 8, 1, 'admin'),
('Surf', 8, 1, 'admin'),
('Txoko', 8, 1, 'admin'),
('Varios', 8, 1, 'admin'),
('Yoga', 8, 1, 'admin');

-- Servicios (id: 9)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Arte', 9, 1, 'admin'),
('Catering', 9, 1, 'admin'),
('Construcción', 9, 1, 'admin'),
('Dibujo', 9, 1, 'admin'),
('Electricidad', 9, 1, 'admin'),
('Fotografía', 9, 1, 'admin'),
('Fontanería', 9, 1, 'admin'),
('Interiorismo', 9, 1, 'admin'),
('Limpieza', 9, 1, 'admin'),
('Pintura', 9, 1, 'admin'),
('Cuidado geriátrico', 9, 1, 'admin'),
('Paseo de mascotas', 9, 1, 'admin'),
('Limpieza de coches', 9, 1, 'admin'),
('Voluntariado', 9, 1, 'admin'),
('Varios', 9, 1, 'admin');

-- Taller (id: 10)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Diseño', 10, 1, 'admin'),
('Escultura', 10, 1, 'admin'),
('Ilustración', 10, 1, 'admin'),
('Mecánico', 10, 1, 'admin'),
('Pintura', 10, 1, 'admin'),
('Varios', 10, 1, 'admin');

-- Técnico (id: 11)
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
('Albañilería', 11, 1, 'admin'),
('Reparación de vehículo', 11, 1, 'admin'),
('Accesorios de coche', 11, 1, 'admin'),
('Accesorios de moto', 11, 1, 'admin'),
('Carpintería', 11, 1, 'admin'),
('Calefacción', 11, 1, 'admin'),
('Cerrajería', 11, 1, 'admin'),
('Electricidad', 11, 1, 'admin'),
('Electrónica', 11, 1, 'admin'),
('Fontanería', 11, 1, 'admin'),
('Repuestos', 11, 1, 'admin'),
('Repuestos de coche', 11, 1, 'admin'),
('Repuestos de moto', 11, 1, 'admin'),
('Varios', 11, 1, 'admin');

-- -----------------------------------------------------
-- Insert product categories
-- -----------------------------------------------------
INSERT INTO `product_category` (`name_category`, `verified_category`, `createdby_category`) VALUES
('Accesorios', 1, 'admin'),
('Artesanía', 1, 'admin'),
('Belleza', 1, 'admin'),
('Bebida', 1, 'admin'),
('Calzado', 1, 'admin'),
('Comida', 1, 'admin'),
('Educativo', 1, 'admin'),
('Electrónica', 1, 'admin'),
('Joyería', 1, 'admin'),
('Muebles', 1, 'admin'),
('Sesión', 1, 'admin'),
('Ropa', 1, 'admin'),
('Salud', 1, 'admin'),
('Servicio', 1, 'admin'),
('Varios', 1, 'admin');

-- -----------------------------------------------------
-- Insert product subcategories
-- -----------------------------------------------------
-- Accesorios subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Bolso', 1, 'admin'),
('Gafas', 1, 'admin'),
('Joyería', 1, 'admin'),
('Reloj', 1, 'admin'),
('Cinturón', 1, 'admin'),
('Varios', 1, 'admin');

-- Artesanía subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Anillo', 1, 'admin'),
('Collar', 1, 'admin'),
('Pendientes', 1, 'admin'),
('Pulsera', 1, 'admin'),
('Varios', 1, 'admin');

-- Belleza subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Productos de Belleza', 1, 'admin'),
('Productos para Cabello', 1, 'admin'),
('Maquillaje', 1, 'admin'),
('Perfume', 1, 'admin'),
('Productos para Piel', 1, 'admin'),
('Skincare', 1, 'admin');

-- Bebida subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Alcohol', 1, 'admin'),
('Café', 1, 'admin'),
('Refresco', 1, 'admin'),
('Té', 1, 'admin'),
('Zumo', 1, 'admin'),
('Agua', 1, 'admin'),
('Varios', 1, 'admin');

-- Calzado subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Bailarinas', 1, 'admin'),
('Botas', 1, 'admin'),
('Deportivas', 1, 'admin'),
('Zapatillas', 1, 'admin'),
('Sandalias', 1, 'admin'),
('Varios', 1, 'admin');

-- Comida subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Bebida', 1, 'admin'),
('Entrante', 1, 'admin'),
('Plato Principal', 1, 'admin'),
('Postre', 1, 'admin'),
('Snack', 1, 'admin'),
('Panadería', 1, 'admin'),
('Varios', 1, 'admin');

-- Educativo subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Asesoría', 1, 'admin'),
('Charla', 1, 'admin'),
('Clases privadas', 1, 'admin'),
('Clases de música', 1, 'admin'),
('Clases de pintura', 1, 'admin'),
('Curso', 1, 'admin'),
('Investigación', 1, 'admin'),
('Librería', 1, 'admin'),
('Presentación', 1, 'admin'),
('Varios', 1, 'admin');

-- Electrónica subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Accesorios', 1, 'admin'),
('Audio', 1, 'admin'),
('Móvil', 1, 'admin'),
('Ordenador', 1, 'admin'),
('Tablet', 1, 'admin'),
('Varios', 1, 'admin');

-- Joyería subcategories (reusing from Artesanía)
-- Already inserted above

-- Muebles subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Baño', 1, 'admin'),
('Cocina', 1, 'admin'),
('Dormitorio', 1, 'admin'),
('Jardín', 1, 'admin'),
('Salón', 1, 'admin'),
('Varios', 1, 'admin');

-- Sesión subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Escape room', 1, 'admin'),
('Hall game', 1, 'admin'),
('Juegos pórtatiles', 1, 'admin'),
('Escape de ciudad', 1, 'admin'),
('Varios', 1, 'admin');

-- Ropa subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Abrigo', 1, 'admin'),
('Accesorios', 1, 'admin'),
('Calcetines', 1, 'admin'),
('Calzado', 1, 'admin'),
('Camiseta', 1, 'admin'),
('Chaqueta', 1, 'admin'),
('Falda', 1, 'admin'),
('Lencería', 1, 'admin'),
('Pantalón', 1, 'admin'),
('Pantaloneta', 1, 'admin'),
('Pijama', 1, 'admin'),
('Ropa de deporte', 1, 'admin'),
('Ropa de maternidad', 1, 'admin'),
('Ropa de trabajo', 1, 'admin'),
('Vestido', 1, 'admin'),
('Varios', 1, 'admin');

-- Salud subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Cuidado Personal', 1, 'admin'),
('Higiene', 1, 'admin'),
('Medicina', 1, 'admin'),
('Suplementos', 1, 'admin');

-- Servicio subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('Asesoría', 1, 'admin'),
('Informático', 1, 'admin'),
('Instalación', 1, 'admin'),
('Limpieza', 1, 'admin'),
('Mantenimiento', 1, 'admin'),
('Reparación', 1, 'admin');

-- Varios subcategories
INSERT INTO `product_subcategory` (`name_subcategory`, `verified_subcategory`, `createdby_subcategory`) VALUES
('General', 1, 'admin'),
('Otros', 1, 'admin');

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