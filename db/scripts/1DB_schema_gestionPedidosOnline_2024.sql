SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema DB_gestionPedidosOnline_2024
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `DB_gestionPedidosOnline_2024`;

-- -----------------------------------------------------
-- Schema DB_gestionPedidosOnline_2024
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `DB_gestionPedidosOnline_2024` DEFAULT CHARACTER SET utf8;
USE `DB_gestionPedidosOnline_2024`;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`ip`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ip_registry (
    'ip_address' VARCHAR(45) PRIMARY KEY,
    'registration_count' INT DEFAULT 0,
    'last_attempt' TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_last_attempt (last_attempt)
);

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`user` (
  `id_user` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_user` VARCHAR(100) NOT NULL,
  `pass_user` VARCHAR(255) NOT NULL,
  `location_user` VARCHAR(100) NOT NULL,
  `type_user` VARCHAR(45) NOT NULL,
  `image_user` VARCHAR(255) NULL,
  `calification_user` INT NOT NULL DEFAULT 5,
  `category_user` TINYINT(1) NOT NULL DEFAULT 0,
  `age_user` INT NOT NULL DEFAULT 18,
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `id_user_UNIQUE` (`id_user` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`type` (
  `id_type` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_type` VARCHAR(100) NOT NULL,
  `order_type` INT NOT NULL DEFAULT 0,
  `active_type` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT UNSIGNED NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_type`),
  UNIQUE INDEX `name_type_UNIQUE` (`name_type` ASC) VISIBLE,
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`subtype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`subtype` (
  `id_subtype` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_subtype` VARCHAR(100) NOT NULL,
  `id_type` INT UNSIGNED NOT NULL,
  `order_subtype` INT NOT NULL DEFAULT 0,
  `active_subtype` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT UNSIGNED NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_subtype`),
  UNIQUE INDEX `name_type_unique` (`name_subtype` ASC, `id_type` ASC) VISIBLE,
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`shop`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`shop` (
  `id_shop` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_shop` VARCHAR(100) NOT NULL,
  `location_shop` VARCHAR(100) NOT NULL,
  `id_type` INT UNSIGNED NOT NULL,
  `id_subtype` INT UNSIGNED NOT NULL,
  `morning_open` TIME NULL,
  `morning_close` TIME NULL,
  `afternoon_open` TIME NULL,
  `afternoon_close` TIME NULL,
  `calification_shop` INT NOT NULL DEFAULT 5,
  `image_shop` VARCHAR(255) NULL,
  `id_user` INT UNSIGNED NOT NULL,
  `has_delivery` TINYINT(1) NOT NULL DEFAULT 0,
  `open_monday` TINYINT(1) NOT NULL DEFAULT 1,
  `open_tuesday` TINYINT(1) NOT NULL DEFAULT 1,
  `open_wednesday` TINYINT(1) NOT NULL DEFAULT 1,
  `open_thursday` TINYINT(1) NOT NULL DEFAULT 1,
  `open_friday` TINYINT(1) NOT NULL DEFAULT 1,
  `open_saturday` TINYINT(1) NOT NULL DEFAULT 1,
  `open_sunday` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_shop`),
  UNIQUE INDEX `id_shop_UNIQUE` (`id_shop` ASC) VISIBLE,
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`product` (
  `id_product` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_product` VARCHAR(100) NOT NULL,
  `price_product` DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  `discount_product` INT NULL DEFAULT 0,
  `season_product` VARCHAR(45) NOT NULL,
  `calification_product` INT NOT NULL DEFAULT 0,
  `type_product` VARCHAR(45) NOT NULL,
  `subtype_product` VARCHAR(45) NOT NULL,
  `sold_product` INT NOT NULL DEFAULT 0,
  `info_product` TEXT, 
  `id_shop` INT UNSIGNED NOT NULL,
  `image_product` VARCHAR(255) NULL,
  `second_hand` TINYINT(1) NOT NULL DEFAULT 0,
  `expiration_product` DATE,
  `surplus_product` INT NOT NULL DEFAULT 0,
  `country_product` VARCHAR(100) NULL,
  `locality_product` VARCHAR(100) NULL,
  `active_product` TINYINT(1) NOT NULL DEFAULT 1,
  `creation_product` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_product`),
  UNIQUE INDEX `id_product_UNIQUE` (`id_product` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`package`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`package` (
  `id_package` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_shop` INT UNSIGNED NOT NULL,
  `id_product1` INT UNSIGNED NOT NULL,
  `id_product2` INT UNSIGNED NULL,
  `id_product3` INT UNSIGNED NULL,
  `id_product4` INT UNSIGNED NULL,
  `id_product5` INT UNSIGNED NULL,
  `name_package` VARCHAR(100) NULL,
  `creation_package` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active_package` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_package`),
  UNIQUE INDEX `id_package_UNIQUE` (`id_package` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`orders` (
  `id_order` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT UNSIGNED NOT NULL,
  `id_product` INT UNSIGNED NOT NULL,
  `id_shop` INT UNSIGNED NOT NULL,
  `delivery_date` DATETIME NOT NULL,
  `order_date` DATETIME NOT NULL,
  `finished` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_order`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`provider`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`provider` (
  `id_provider` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_provider` VARCHAR(100) NOT NULL,
  `location_provider` VARCHAR(100) NOT NULL,
  `pass_provider` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_provider`),
  UNIQUE INDEX `id_provider_UNIQUE` (`id_provider` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`buys(inventory)`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`buys` (
  `id_buys` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_shop` INT UNSIGNED NOT NULL,
  `id_provider` INT UNSIGNED NOT NULL,
  `id_product` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `price_provider` DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`id_buys`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Insert default types
-- -----------------------------------------------------
INSERT INTO `DB_gestionPedidosOnline_2024`.`type` (`name_type`, `order_type`) VALUES
('Artesanía', 1),
('Alimentación', 2),
('Consultoría', 3),
('Educativa', 4),
('Entretenimiento', 5),
('Especializado', 6),
('Ropa', 7),
('Salud y Bienestar', 8),
('Servicios', 9),
('Taller', 10),
('Técnico', 11);

-- -----------------------------------------------------
-- Insert default subtypes
-- -----------------------------------------------------
-- Artesanía
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Accesorios', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Cuero', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Decoración', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Madera', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Cerámica', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Textil', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Artesanía';

-- Alimentación
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Asador', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Carnicería', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Charcutería', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ecológica', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Frutas, verduras y conservas', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Local', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Panadería', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Pescadería', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Peruana', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'China', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Japonesa', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Italiana', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Turca', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ultra marinos', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Kebab', id_type, 15 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Restaurante', id_type, 16 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 17 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Alimentación';

-- Consultoría
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Digital', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Formativa', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Gestión Cultural', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Inmobiliaria', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Jurídica', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Seguros', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Técnica', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Consultoría';

-- Educativa
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Asesoría', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Charla', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de cocina', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de fotografía', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de música', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de pintura', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de yoga', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Conferencias', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Curso', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Investigación', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Librería', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Presentación', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Talleres', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de baile', id_type, 15 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de idiomas', id_type, 16 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de teatro', id_type, 17 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de deportes', id_type, 18 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de arte', id_type, 19 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de manualidades', id_type, 20 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de cocina infantiles', id_type, 21 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de música infantiles', id_type, 22 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de teatro infantiles', id_type, 23 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de deportes infantiles', id_type, 24 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de arte infantiles', id_type, 25 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de manualidades para adultos', id_type, 26 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Clases de manualidades infantiles', id_type, 27 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Educativa';

-- Entretenimiento
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Baile', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Danza', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Escape Room', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Infantil', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Juvenil', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Tercera edad', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Txiki park', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Juguetería', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Música', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Teatro', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Viajes', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Entretenimiento';

-- Especializado
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Arte', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Autoescuela', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Bodega', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Concept Store', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Desarrollo web', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Dietética y nutrición', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Diseño gráfico', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Electrodoméstico', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Estanco', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Estudio de arte', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Golosinas', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ilustración', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Joyería', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Locutorio', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Peluquería canina', id_type, 15 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Prensa', id_type, 16 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Programación', id_type, 17 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Tattoo shop', id_type, 18 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Vinoteca', id_type, 19 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Zapatería', id_type, 20 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 21 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Especializado';

-- Ropa
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Abrigo', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Accesorio', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Calcetine', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Calzado', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Chaqueta', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Camiseta', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Falda', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Infantil', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Lencería', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Pantaloneta', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Pantalón', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Pijama', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ropa de deporte', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ropa interior', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ropa de maternidad', id_type, 15 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ropa de trabajo', id_type, 16 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Segunda mano', id_type, 17 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Vestido', id_type, 18 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Vintage', id_type, 19 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 20 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Ropa';

-- Salud y Bienestar
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Baile', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Dietética', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Imagen personal', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Fisioterapia', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Gimnasio', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Manicura y pedicura', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Odontología', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Osteopatía', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Parafarmacia', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Peluquería', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Surf', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Txoko', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Yoga', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Salud y Bienestar';

-- Servicios
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Arte', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Catering', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Construcción', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Dibujo', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Electricidad', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Fotografía', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Fontanería', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Interiorismo', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Limpieza', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Pintura', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Cuidado geriátrico', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Paseo de mascotas', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Limpieza de coches', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Voluntariado', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 15 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Servicios';

-- Taller
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Diseño', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Taller';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Escultura', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Taller';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Ilustración', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Taller';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Mecánico', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Taller';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Pintura', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Taller';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Taller';

-- Técnico
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Albañilería', id_type, 1 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Reparación de vehículo', id_type, 2 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Accesorios de coche', id_type, 3 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Accesorios de moto', id_type, 4 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Carpintería', id_type, 5 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Calefacción', id_type, 6 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Cerrajería', id_type, 7 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Electricidad', id_type, 8 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Electrónica', id_type, 9 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Fontanería', id_type, 10 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Repuestos', id_type, 11 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Repuestos de coche', id_type, 12 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Repuestos de moto', id_type, 13 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';
INSERT INTO `DB_gestionPedidosOnline_2024`.`subtype` (`name_subtype`, `id_type`, `order_subtype`) 
SELECT 'Varios', id_type, 14 FROM `DB_gestionPedidosOnline_2024`.`type` WHERE name_type = 'Técnico';


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;