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
-- UPDATE user SET email_verified = 1 WHERE name_user = 'german andino';

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`ip_registry`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`ip_registry` (
    `ip_address` VARCHAR(45) PRIMARY KEY,
    `registration_count` INT DEFAULT 0,
    `last_attempt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_last_attempt (`last_attempt`)
);

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`user` (
  `id_user` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_user` VARCHAR(100) NOT NULL,
  `pass_user` VARCHAR(255) NOT NULL,
  `email_user` VARCHAR(255) NOT NULL, 
  `location_user` VARCHAR(100) NOT NULL,
  `type_user` VARCHAR(45) NOT NULL,
  `image_user` VARCHAR(255) NULL,
  `calification_user` INT NOT NULL DEFAULT 5,
  `contributor_user` TINYINT(1) NOT NULL DEFAULT 0,
  `age_user` INT NOT NULL DEFAULT 18,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `verification_token` VARCHAR(255) NULL,
  `verification_token_expires` DATETIME NULL,
  `is_manager` TINYINT(1) NOT NULL DEFAULT 0,  -- NEW FIELD
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `id_user_UNIQUE` (`id_user` ASC) VISIBLE,
  UNIQUE INDEX `unique_email_type` (`email_user` ASC, `type_user` ASC) VISIBLE,
  INDEX `idx_type_user` (`type_user` ASC) VISIBLE,
  INDEX `idx_verification_token` (`verification_token` ASC) VISIBLE,
  INDEX `idx_email_verified` (`email_verified` ASC) VISIBLE,
  INDEX `idx_email_user` (`email_user` ASC) VISIBLE,
  INDEX `idx_is_manager` (`is_manager` ASC) VISIBLE  -- NEW INDEX
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
  `verified_shop` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_shop`),
  UNIQUE INDEX `id_shop_UNIQUE` (`id_shop` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`shop_valoration`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`shop_valoration` (
  `id_valoration` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT UNSIGNED NOT NULL,
  `id_shop` INT UNSIGNED NOT NULL,
  `calification_shop` INT NOT NULL,
  `comment_shop` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_valoration`),
  UNIQUE INDEX `unique_user_shop` (`id_user`, `id_shop`),
  INDEX `idx_shop` (`id_shop` ASC),
  INDEX `idx_user` (`id_user` ASC),
  INDEX `idx_created_at` (`created_at` DESC),
  CONSTRAINT `chk_calification` CHECK (`calification_shop` >= 1 AND `calification_shop` <= 5)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`category_subcategory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`category_subcategory` (
  `id_category_subcategory` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_category` INT UNSIGNED NOT NULL,
  `id_subcategory` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_category_subcategory`),
  UNIQUE INDEX `unique_category_subcategory` (`id_category`, `id_subcategory`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`product_category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`product_category` (
  `id_category` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_category` VARCHAR(100) NOT NULL,
  `verified_category` TINYINT(1) NOT NULL DEFAULT 0,
  `createdby_category` VARCHAR(20) NULL,
  PRIMARY KEY (`id_category`)
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
-- Table `DB_gestionPedidosOnline_2024`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`product` (
  `id_product` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_product` VARCHAR(100) NOT NULL,
  `price_product` DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  `discount_product` INT NULL DEFAULT 0,
  `season_product` VARCHAR(45) NOT NULL,
  `calification_product` INT NOT NULL DEFAULT 0,
  `id_category` INT UNSIGNED NULL,
  `id_subcategory` INT UNSIGNED NULL,
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
-- Table `DB_gestionPedidosOnline_2024`.`type_category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`type_category` (
  `id_type_category` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_type` INT UNSIGNED NOT NULL,
  `id_category` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_type_category`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`calification_product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`calification_product` (
  `id_calification` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_product` INT UNSIGNED NOT NULL,
  `id_user` INT UNSIGNED NOT NULL,
  `calification_product` INT NOT NULL,
  `comment_calification` VARCHAR(200) NULL,
  PRIMARY KEY (`id_calification`),
  UNIQUE INDEX `unique_user_product` (`id_user`, `id_product`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`calification_shop`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`calification_shop` (
  `id_calification` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_shop` INT UNSIGNED NOT NULL,
  `id_user` INT UNSIGNED NOT NULL,
  `calification_shop` INT NOT NULL,
  `comment_calification` VARCHAR(200) NULL,
  PRIMARY KEY (`id_calification`),
  UNIQUE INDEX `unique_user_shop` (`id_user`, `id_shop`)
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
  `discount_package` INT NULL DEFAULT 0 COMMENT 'Percentage discount applied to the total package price (0-100)',
  `creation_package` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active_package` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_package`),
  UNIQUE INDEX `id_package_UNIQUE` (`id_package` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`order_product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`order_product` (
  `id_order_product` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_product` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `product_notes` TEXT NULL,
  PRIMARY KEY (`id_order_product`),
  INDEX `idx_product` (`id_product` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`order_package`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`order_package` (
  `id_order_package` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_package` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `package_notes` TEXT NULL,
  PRIMARY KEY (`id_order_package`),
  INDEX `idx_package` (`id_package` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`order` (
  `id_order` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT UNSIGNED NOT NULL,
  `id_shop` INT UNSIGNED NOT NULL,
  `id_rider` INT UNSIGNED NULL,
  -- update: rider_accepted field to track rider request status
  -- NULL = no request, FALSE = request declined, TRUE = request accepted
  `rider_accepted` TINYINT(1) NULL DEFAULT NULL,
  `id_order_products` JSON DEFAULT NULL,
  `id_order_packages` JSON DEFAULT NULL,
  `total_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `order_status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `delivery_type` ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup',
  `delivery_address` VARCHAR(255) NULL,
  `order_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_order`),
  -- update: Add indexes for better query performance
  INDEX `idx_order_status` (`order_status` ASC),
  INDEX `idx_id_shop` (`id_shop` ASC),
  INDEX `idx_id_user` (`id_user` ASC),
  INDEX `idx_id_rider` (`id_rider` ASC),
  INDEX `idx_rider_accepted` (`rider_accepted` ASC),
  INDEX `idx_created_at` (`created_at` DESC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`organization`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`organization` (
  `id_organization` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT UNSIGNED NOT NULL,
  `name_org` VARCHAR(100) NOT NULL,
  `scope_org` VARCHAR(255) NULL,
  `image_org` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_organization`),
  UNIQUE INDEX `id_organization_UNIQUE` (`id_organization` ASC) VISIBLE,
  UNIQUE INDEX `name_org_UNIQUE` (`name_org` ASC) VISIBLE,
  INDEX `idx_manager` (`id_user` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`participant`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`participant` (
  `id_participant` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_org` INT UNSIGNED NOT NULL,
  `id_user` INT UNSIGNED NOT NULL,
  `org_managed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indicates if the user is a manager of this organization',
  PRIMARY KEY (`id_participant`),
  UNIQUE INDEX `unique_org_user` (`id_org`, `id_user`),
  INDEX `idx_org` (`id_org` ASC) VISIBLE,
  INDEX `idx_user` (`id_user` ASC) VISIBLE,
  INDEX `idx_is_manager` (`org_managed` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`participant_request`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`participant_request` (
  `id_request` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` INT UNSIGNED NOT NULL,
  `id_org` INT UNSIGNED NOT NULL,
  `request_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `request_message` TEXT NULL,
  `response_message` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_request`),
  UNIQUE INDEX `unique_user_org_pending` (`id_user`, `id_org`, `request_status`),
  INDEX `idx_org` (`id_org` ASC),
  INDEX `idx_user` (`id_user` ASC),
  INDEX `idx_status` (`request_status` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`publication`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`publication` (
  `id_publication` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_org` INT UNSIGNED NOT NULL,
  `title_pub` VARCHAR(150) NOT NULL,
  `content_pub` TEXT NOT NULL,
  `date_pub` DATE NOT NULL,
  `time_pub` TIME NOT NULL,
  `id_user_pub` INT UNSIGNED NOT NULL,
  `image_pub` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_publication`),
  UNIQUE INDEX `id_publication_UNIQUE` (`id_publication` ASC) VISIBLE,
  INDEX `idx_user_pub` (`id_user_pub` ASC) VISIBLE,
  INDEX `idx_date_pub` (`date_pub` DESC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`social_event`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`social_event` (
  `id_social_event` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_soc_ev` VARCHAR(150) NOT NULL,
  `creation_date_soc_ev` DATE NOT NULL,
  `initial_date_soc_ev` DATE NOT NULL,
  `final_date_soc_ev` DATE NOT NULL,
  `start_time_soc_ev` TIME NOT NULL,
  `end_time_soc_ev` TIME NOT NULL,
  `image_soc_ev` VARCHAR(255) NULL,
  `id_user_creator` INT UNSIGNED NOT NULL,
  `location_soc_ev` VARCHAR(255) NULL,
  `description_soc_ev` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_social_event`),
  UNIQUE INDEX `id_social_event_UNIQUE` (`id_social_event` ASC) VISIBLE,
  INDEX `idx_user_creator` (`id_user_creator` ASC) VISIBLE,
  INDEX `idx_initial_date` (`initial_date_soc_ev` ASC) VISIBLE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`provider`
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`provider` (
--   `id_provider` INT UNSIGNED NOT NULL AUTO_INCREMENT,
--   `name_provider` VARCHAR(100) NOT NULL,
--   `location_provider` VARCHAR(100) NOT NULL,
--   `pass_provider` VARCHAR(255) NOT NULL,
--   PRIMARY KEY (`id_provider`),
--   UNIQUE INDEX `id_provider_UNIQUE` (`id_provider` ASC) VISIBLE
-- ) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_gestionPedidosOnline_2024`.`buys`
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `DB_gestionPedidosOnline_2024`.`buys` (
--   `id_buys` INT UNSIGNED NOT NULL AUTO_INCREMENT,
--   `id_shop` INT UNSIGNED NOT NULL,
--   `id_provider` INT UNSIGNED NOT NULL,
--   `id_product` INT UNSIGNED NOT NULL,
--   `quantity` INT NOT NULL DEFAULT 0,
--   `price_provider` DECIMAL(10,2) NOT NULL DEFAULT 0.0,
--   PRIMARY KEY (`id_buys`)
-- ) ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;