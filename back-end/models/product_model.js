import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const product_model = sequelize.define("product", {
    id_product: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_product: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    price_product: {
        type: DataTypes.DECIMAL(10,2), 
        allowNull: false,
        defaultValue: 0.0
    },
    discount_product: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        defaultValue: 0,
    },
    season_product: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    calification_product: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    type_product: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    subtype_product: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    stock_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    info_product: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id_shop: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    image_product: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    second_hand: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default product_model;