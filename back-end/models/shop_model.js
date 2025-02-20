import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const shop_model = sequelize.define("shop", {
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_shop: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    location_shop: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    type_shop: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    subtype_shop: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    morning_open: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    morning_close: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    afternoon_open: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    afternoon_close: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    calification_shop: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
    },
    image_shop: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    id_user: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default shop_model;