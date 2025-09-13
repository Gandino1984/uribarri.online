-- -----------------------------------------------------
-- Seed Data Script for DB_gestionPedidosOnline_2024
-- This script runs after the schema creation (1DB_schema_gestionPedidosOnline_2024.sql)
-- File should be placed in: /db/scripts/2DB_seed_data.sql
-- -----------------------------------------------------

USE `DB_gestionPedidosOnline_2024`;

-- -----------------------------------------------------
-- Seed Types (shop types)
-- -----------------------------------------------------
INSERT INTO `type` (`name_type`, `verified_type`, `createdby_type`) VALUES
('Entretenimiento', 1, 'German Andino'),
('Arte y artesanía', 1, 'German Andino'),
('Servicios', 1, 'German Andino');

-- -----------------------------------------------------
-- Seed Subtypes
-- -----------------------------------------------------
INSERT INTO `subtype` (`name_subtype`, `id_type`, `verified_subtype`, `createdby_subtype`) VALUES
-- Entretenimiento subtypes (id_type = 1)
('Música en directo o concierto', 1, 1, 'German Andino'),
('Producción musical', 1, 1, 'German Andino'),
('Baile o danza', 1, 1, 'German Andino'),
('Escape room', 1, 1, 'German Andino'),
('Infantil', 1, 1, 'German Andino'),
('Juvenil', 1, 1, 'German Andino'),
('Tercera Edad', 1, 1, 'German Andino'),
('Teatro', 1, 1, 'German Andino'),
('Free tour', 1, 1, 'German Andino'),
('Actividades al aire libre', 1, 1, 'German Andino'),
('Varios', 1, 1, 'German Andino'),

-- Artesanía subtypes (id_type = 2)
('Accesorios', 2, 1, 'German Andino'),
('Arte digital', 2, 1, 'German Andino'),
('Cuero', 2, 1, 'German Andino'),
('Madera', 2, 1, 'German Andino'),
('Decoración', 2, 1, 'German Andino'),
('Cerámica', 2, 1, 'German Andino'),
('Textil', 2, 1, 'German Andino'),
('Ilustración digital', 2, 1, 'German Andino'),
('Ilustración hecha a mano', 2, 1, 'German Andino'),
('Pintura', 2, 1, 'German Andino'),
('Fotografía', 2, 1, 'German Andino'),
('Serigrafía', 2, 1, 'German Andino'),
('Grabado', 2, 1, 'German Andino'),
('Escultura', 2, 1, 'German Andino'),
('Ropa pintada a mano', 2, 1, 'German Andino'),
('Varios', 2, 1, 'German Andino'),

-- Servicios subtypes (id_type = 3)
('Reparación en el hogar', 3, 1, 'German Andino'),
('Reparación de coches', 3, 1, 'German Andino'),
('Reparación de electrodomésticos', 3, 1, 'German Andino'),
('Reparación de instrumentos', 3, 1, 'German Andino'),
('Reparación de ordenadores', 3, 1, 'German Andino'),
('Reparación de máquinas industriales', 3, 1, 'German Andino'),
('Servicios de limpieza y desinfección de casas', 3, 1, 'German Andino'),
('Servicios de limpieza y desinfección de coches', 3, 1, 'German Andino'),
('Servicios de limpieza y desinfección de comercios', 3, 1, 'German Andino'),
('Servicios de limpieza y desinfección de espacios públicos', 3, 1, 'German Andino'),
('Electricista', 3, 1, 'German Andino'),
('Fontanería', 3, 1, 'German Andino'),
('Carpintería', 3, 1, 'German Andino'),
('Cerrajería', 3, 1, 'German Andino'),
('Albañilería', 3, 1, 'German Andino'),
('Afinación de instrumentos', 3, 1, 'German Andino'),
('Catering', 3, 1, 'German Andino'),
('Construcción', 3, 1, 'German Andino'),
('Cuidados para mascotas', 3, 1, 'German Andino'),
('Diseño arquitectónico', 3, 1, 'German Andino'),
('Interiorismo', 3, 1, 'German Andino'),
('Asistencia geriátrica', 3, 1, 'German Andino'),
('Clases privadas y tutorías', 3, 1, 'German Andino'),
('Voluntariado', 3, 1, 'German Andino'),
('Varios', 3, 1, 'German Andino');

