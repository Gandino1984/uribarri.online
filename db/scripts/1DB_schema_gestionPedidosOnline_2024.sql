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
  `verified_type` TINYINT(1) NOT NULL DEFAULT 0,
  `createdby_type` VARCHAR(20) NULL,
  PRIMARY KEY (`id_type`),
  UNIQUE INDEX `name_type_UNIQUE` (`name_type` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`subtype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`subtype` (
  `id_subtype` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_subtype` VARCHAR(100) NOT NULL,
  `id_type` INT UNSIGNED NOT NULL,
  `verified_subtype` TINYINT(1) NOT NULL DEFAULT 0,
  `createdby_subtype` VARCHAR(20) NULL,
  PRIMARY KEY (`id_subtype`),
  UNIQUE INDEX `name_type_unique` (`name_subtype` ASC, `id_type` ASC) VISIBLE
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
  UNIQUE INDEX `id_shop_UNIQUE` (`id_shop` ASC) VISIBLE
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
  `id_category` INT UNSIGNED NULL AFTER `type_product`,
  `id_subcategory` INT UNSIGNED NULL AFTER `id_category`,
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
-- Table `DB_gestionPedidosOnline_2024`.`product_category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`product_category` (
  `id_category` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_category` VARCHAR(100) NOT NULL,
  `verified_category` TINYINT(1) NOT NULL DEFAULT 0,
  `createdby_category` VARCHAR(20) NULL,
  PRIMARY KEY (`id_category`),
  UNIQUE INDEX `name_category_UNIQUE` (`name_category` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`product_subcategory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`product_subcategory` (
  `id_subcategory` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_subcategory` VARCHAR(100) NOT NULL,
  `id_category` INT UNSIGNED NOT NULL,
  `verified_subcategory` TINYINT(1) NOT NULL DEFAULT 0,
  `createdby_subcategory` VARCHAR(20) NULL,
  PRIMARY KEY (`id_subcategory`),
  UNIQUE INDEX `name_category_unique` (`name_subcategory` ASC, `id_category` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`shop_type_category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`shop_type_category` (
  `id_shop_type_category` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_type` INT UNSIGNED NOT NULL,
  `id_category` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_shop_type_category`),
  INDEX `idx_type` (`id_type` ASC) VISIBLE,
  INDEX `idx_category` (`id_category` ASC) VISIBLE
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


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;