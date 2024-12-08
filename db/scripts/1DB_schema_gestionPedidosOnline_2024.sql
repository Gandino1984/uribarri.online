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
    ip_address VARCHAR(45) PRIMARY KEY,
    registration_count INT DEFAULT 0,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_last_attempt (last_attempt)
);

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`user` (
  `id_user` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_user` VARCHAR(100) NOT NULL,
  `pass_user` VARCHAR(255) NOT NULL,
  `location_user` VARCHAR(45) NOT NULL,
  `type_user` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `id_user_UNIQUE` (`id_user` ASC) VISIBLE
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
  `stock_product` INT NOT NULL DEFAULT 0,
  `info_product` TEXT,
  PRIMARY KEY (`id_product`),
  UNIQUE INDEX `id_product_UNIQUE` (`id_product` ASC) VISIBLE,
  CHECK (`calification_product` BETWEEN 0 AND 5),
  CHECK (`discount_product` BETWEEN 0 AND 100)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`provider`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`provider` (
  `id_provider` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_provider` VARCHAR(100) NOT NULL,
  `location_provider` VARCHAR(45) NOT NULL,
  `pass_provider` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_provider`),
  UNIQUE INDEX `id_provider_UNIQUE` (`id_provider` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`shop`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`shop` (
  `id_shop` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_shop` VARCHAR(100) NOT NULL,
  `location_shop` VARCHAR(45) NOT NULL,
  `type_shop` VARCHAR(45) NOT NULL,
  `subtype_shop` VARCHAR(45) NOT NULL,
  `id_user` INT UNSIGNED NOT NULL,
  `calification_shop` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_shop`),
  UNIQUE INDEX `id_shop_UNIQUE` (`id_shop` ASC) VISIBLE,
  CHECK (`calification_shop` BETWEEN 0 AND 5)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`orders` (
  `id_order` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT UNSIGNED NOT NULL,
  `id_product` INT UNSIGNED NOT NULL,
  `finished` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_order`),
  CHECK (`finished` IN (0,1))
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`sales`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`sales` (
  `id_sales` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_shop` INT UNSIGNED NOT NULL,
  `id_user` INT UNSIGNED NOT NULL,
  `id_product` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_sales`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`buys`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`inventory` (
  `id_inventory` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_shop` INT UNSIGNED NOT NULL,
  `id_provider` INT UNSIGNED NOT NULL,
  `id_product` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_inventory`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`produce`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`produce` (
  `id_produce` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_provider` INT UNSIGNED NOT NULL,
  `id_product` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_produce`)
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;