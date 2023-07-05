-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`meal-types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`meal-types` (
  `id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id-meal-types_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`menus`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `meal-types_id` INT UNSIGNED NOT NULL,
  `service-time` TIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_menus_meal-types1_idx` (`meal-types_id` ASC) VISIBLE,
  UNIQUE INDEX `id-menu_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `fk_menus_meal-types1`
    FOREIGN KEY (`meal-types_id`)
    REFERENCES `mydb`.`meal-types` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`food-items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`food-items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id-item_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`serve-line`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`serve-line` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id-number_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`menu_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`menu_items` (
  `menu_id` INT UNSIGNED NOT NULL,
  `food-item_id` INT UNSIGNED NOT NULL,
  `serve-line_id` INT UNSIGNED NULL,
  `servings` INT NULL,
  PRIMARY KEY (`menu_id`, `food-item_id`),
  INDEX `fk_daily-menu_items_serve-line1_idx` (`serve-line_id` ASC) VISIBLE,
  INDEX `fk_daily-menu_has_menu-item_menu-item1_idx` (`food-item_id` ASC) VISIBLE,
  INDEX `fk_menu_items_menus1_idx` (`menu_id` ASC) VISIBLE,
  CONSTRAINT `fk_daily-menu_has_menu-item_menu-item1`
    FOREIGN KEY (`food-item_id`)
    REFERENCES `mydb`.`food-items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_daily-menu_items_serve-line1`
    FOREIGN KEY (`serve-line_id`)
    REFERENCES `mydb`.`serve-line` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_menu_items_menus1`
    FOREIGN KEY (`menu_id`)
    REFERENCES `mydb`.`menus` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`units`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`units` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id-measurement_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`ingredients` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `unit_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id-ingredient_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_ingredients_units1_idx` (`unit_id` ASC) VISIBLE,
  CONSTRAINT `fk_ingredients_units1`
    FOREIGN KEY (`unit_id`)
    REFERENCES `mydb`.`units` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`food-item_ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`food-item_ingredients` (
  `food-item_id` INT UNSIGNED NOT NULL,
  `ingredient_id` INT UNSIGNED NOT NULL,
  `quantity` FLOAT NOT NULL,
  `default-unit_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`food-item_id`, `ingredient_id`, `quantity`, `default-unit_id`),
  INDEX `fk_menu-items_has_ingredients_ingredients1_idx` (`ingredient_id` ASC) VISIBLE,
  INDEX `fk_menu-items_has_ingredients_menu-items1_idx` (`food-item_id` ASC) VISIBLE,
  INDEX `fk_menu-item_ingredients_measurement-units1_idx` (`default-unit_id` ASC) VISIBLE,
  CONSTRAINT `fk_menu-items_has_ingredients_menu-items1`
    FOREIGN KEY (`food-item_id`)
    REFERENCES `mydb`.`food-items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_menu-items_has_ingredients_ingredients1`
    FOREIGN KEY (`ingredient_id`)
    REFERENCES `mydb`.`ingredients` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_menu-item_ingredients_measurement-units1`
    FOREIGN KEY (`default-unit_id`)
    REFERENCES `mydb`.`units` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`unit-conversions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`unit-conversions` (
  `unit_id1` INT UNSIGNED NOT NULL,
  `unit_id2` INT UNSIGNED NOT NULL,
  `1to2-conversion` FLOAT NOT NULL,
  PRIMARY KEY (`unit_id1`, `unit_id2`),
  INDEX `fk_measurement-units_has_measurement-units_measurement-unit_idx` (`unit_id2` ASC) VISIBLE,
  INDEX `fk_measurement-units_has_measurement-units_measurement-unit_idx1` (`unit_id1` ASC) VISIBLE,
  CONSTRAINT `fk_measurement-units_has_measurement-units_measurement-units1`
    FOREIGN KEY (`unit_id1`)
    REFERENCES `mydb`.`units` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_measurement-units_has_measurement-units_measurement-units2`
    FOREIGN KEY (`unit_id2`)
    REFERENCES `mydb`.`units` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `default-units_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_products_units1_idx` (`default-units_id` ASC) VISIBLE,
  CONSTRAINT `fk_products_units1`
    FOREIGN KEY (`default-units_id`)
    REFERENCES `mydb`.`units` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`kitchen-inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`kitchen-inventory` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `date_UNIQUE` (`date` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`kitchen-inventory_ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`kitchen-inventory_ingredients` (
  `kitchen-inventory_id` INT UNSIGNED NOT NULL,
  `ingredients_id` INT UNSIGNED NOT NULL,
  `quantity` FLOAT NULL,
  `price-per` VARCHAR(45) NULL,
  PRIMARY KEY (`kitchen-inventory_id`, `ingredients_id`),
  INDEX `fk_kitchen-inventory_has_ingredients_ingredients1_idx` (`ingredients_id` ASC) VISIBLE,
  INDEX `fk_kitchen-inventory_has_ingredients_kitchen-inventory1_idx` (`kitchen-inventory_id` ASC) VISIBLE,
  CONSTRAINT `fk_kitchen-inventory_has_ingredients_kitchen-inventory1`
    FOREIGN KEY (`kitchen-inventory_id`)
    REFERENCES `mydb`.`kitchen-inventory` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_kitchen-inventory_has_ingredients_ingredients1`
    FOREIGN KEY (`ingredients_id`)
    REFERENCES `mydb`.`ingredients` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`snackshack-inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`snackshack-inventory` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `date_UNIQUE` (`date` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`snackshack-inventory_products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`snackshack-inventory_products` (
  `snackshack-inventory_id` INT UNSIGNED NOT NULL,
  `products_id` INT UNSIGNED NOT NULL,
  `quantity` FLOAT NULL,
  `price-per` DECIMAL(5,2) NULL,
  PRIMARY KEY (`snackshack-inventory_id`, `products_id`),
  INDEX `fk_snackshack-inventory_has_products_products1_idx` (`products_id` ASC) VISIBLE,
  INDEX `fk_snackshack-inventory_has_products_snackshack-inventory1_idx` (`snackshack-inventory_id` ASC) VISIBLE,
  CONSTRAINT `fk_snackshack-inventory_has_products_snackshack-inventory1`
    FOREIGN KEY (`snackshack-inventory_id`)
    REFERENCES `mydb`.`snackshack-inventory` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_snackshack-inventory_has_products_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `mydb`.`products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`sales`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`sales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `products_id` INT UNSIGNED NOT NULL,
  `price` DECIMAL(5,2) NULL,
  `timestamp` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_transactions_products1_idx` (`products_id` ASC) VISIBLE,
  CONSTRAINT `fk_transactions_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `mydb`.`products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`role` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`employees`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`employees` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(16) NOT NULL,
  `email` VARCHAR(255) NULL,
  `password` VARCHAR(32) NOT NULL,
  `create_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `role_id` INT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  CONSTRAINT `fk_user_role1`
    FOREIGN KEY (`role_id`)
    REFERENCES `mydb`.`role` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `mydb`.`water-logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`water-logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT UNSIGNED NOT NULL,
  `measure1` VARCHAR(45) NULL,
  `measure2` VARCHAR(45) NULL,
  `notes` VARCHAR(300) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_water-logs_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_water-logs_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`employees` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`inspection-logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`inspection-logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_inspection-logs_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_inspection-logs_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`employees` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`attractions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`attractions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`elements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`elements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `attraction_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_environments_attractions1_idx` (`attraction_id` ASC) VISIBLE,
  CONSTRAINT `fk_environments_attractions1`
    FOREIGN KEY (`attraction_id`)
    REFERENCES `mydb`.`attractions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`equipment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`equipment` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`egos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`egos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `attraction_id` INT UNSIGNED NOT NULL,
  `inspection-logs_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_egos_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_egos_attractions1_idx` (`attraction_id` ASC) VISIBLE,
  INDEX `fk_egos_inspection-logs1_idx` (`inspection-logs_id` ASC) VISIBLE,
  CONSTRAINT `fk_egos_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mydb`.`employees` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_egos_attractions1`
    FOREIGN KEY (`attraction_id`)
    REFERENCES `mydb`.`attractions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_egos_inspection-logs1`
    FOREIGN KEY (`inspection-logs_id`)
    REFERENCES `mydb`.`inspection-logs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`attraction_equipment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`attraction_equipment` (
  `attraction_id` INT UNSIGNED NOT NULL,
  `equipment_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`attraction_id`, `equipment_id`),
  INDEX `fk_attractions_has_equipment_equipment1_idx` (`equipment_id` ASC) VISIBLE,
  INDEX `fk_attractions_has_equipment_attractions1_idx` (`attraction_id` ASC) VISIBLE,
  CONSTRAINT `fk_attractions_has_equipment_attractions1`
    FOREIGN KEY (`attraction_id`)
    REFERENCES `mydb`.`attractions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_attractions_has_equipment_equipment1`
    FOREIGN KEY (`equipment_id`)
    REFERENCES `mydb`.`equipment` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`subelements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`subelements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(45) NULL,
  `elements_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_subelements_environments1_idx` (`elements_id` ASC) VISIBLE,
  CONSTRAINT `fk_subelements_environments1`
    FOREIGN KEY (`elements_id`)
    REFERENCES `mydb`.`elements` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`subelement_inspections`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`subelement_inspections` (
  `subelements_id` INT UNSIGNED NOT NULL,
  `inspection-logs_id` INT UNSIGNED NOT NULL,
  `passes` TINYINT NULL,
  `concerns` VARCHAR(300) NULL,
  PRIMARY KEY (`subelements_id`, `inspection-logs_id`),
  INDEX `fk_subelements_has_inspection-logs_inspection-logs1_idx` (`inspection-logs_id` ASC) VISIBLE,
  INDEX `fk_subelements_has_inspection-logs_subelements1_idx` (`subelements_id` ASC) VISIBLE,
  CONSTRAINT `fk_subelements_has_inspection-logs_subelements1`
    FOREIGN KEY (`subelements_id`)
    REFERENCES `mydb`.`subelements` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_subelements_has_inspection-logs_inspection-logs1`
    FOREIGN KEY (`inspection-logs_id`)
    REFERENCES `mydb`.`inspection-logs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`environments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`environments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(45) NULL,
  `attractions_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_environments_attractions2_idx` (`attractions_id` ASC) VISIBLE,
  CONSTRAINT `fk_environments_attractions2`
    FOREIGN KEY (`attractions_id`)
    REFERENCES `mydb`.`attractions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`environment_inspections`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`environment_inspections` (
  `environment_id` INT UNSIGNED NOT NULL,
  `inspection-log_id` INT UNSIGNED NOT NULL,
  `record` VARCHAR(45) NULL,
  `concerns` VARCHAR(300) NULL,
  PRIMARY KEY (`environment_id`, `inspection-log_id`),
  INDEX `fk_environments_has_inspection-logs_inspection-logs1_idx` (`inspection-log_id` ASC) VISIBLE,
  INDEX `fk_environments_has_inspection-logs_environments1_idx` (`environment_id` ASC) VISIBLE,
  CONSTRAINT `fk_environments_has_inspection-logs_environments1`
    FOREIGN KEY (`environment_id`)
    REFERENCES `mydb`.`environments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_environments_has_inspection-logs_inspection-logs1`
    FOREIGN KEY (`inspection-log_id`)
    REFERENCES `mydb`.`inspection-logs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`subequipment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`subequipment` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(45) NULL,
  `equipment_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_subequipment_equipment1_idx` (`equipment_id` ASC) VISIBLE,
  CONSTRAINT `fk_subequipment_equipment1`
    FOREIGN KEY (`equipment_id`)
    REFERENCES `mydb`.`equipment` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`subequipment_inspections`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`subequipment_inspections` (
  `subequipment_id` INT NOT NULL,
  `inspection-logs_id` INT UNSIGNED NOT NULL,
  `physical-condition` TINYINT NULL,
  `psychological` TINYINT NULL,
  `purpose` TINYINT NULL,
  `concerns` VARCHAR(300) NULL,
  PRIMARY KEY (`subequipment_id`, `inspection-logs_id`),
  INDEX `fk_subequipment_has_inspection-logs_inspection-logs1_idx` (`inspection-logs_id` ASC) VISIBLE,
  INDEX `fk_subequipment_has_inspection-logs_subequipment1_idx` (`subequipment_id` ASC) VISIBLE,
  CONSTRAINT `fk_subequipment_has_inspection-logs_subequipment1`
    FOREIGN KEY (`subequipment_id`)
    REFERENCES `mydb`.`subequipment` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_subequipment_has_inspection-logs_inspection-logs1`
    FOREIGN KEY (`inspection-logs_id`)
    REFERENCES `mydb`.`inspection-logs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`role_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permissions_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permissions_id`),
  INDEX `fk_role_has_permissions_permissions1_idx` (`permissions_id` ASC) VISIBLE,
  INDEX `fk_role_has_permissions_role1_idx` (`role_id` ASC) VISIBLE,
  CONSTRAINT `fk_role_has_permissions_role1`
    FOREIGN KEY (`role_id`)
    REFERENCES `mydb`.`role` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_role_has_permissions_permissions1`
    FOREIGN KEY (`permissions_id`)
    REFERENCES `mydb`.`permissions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
