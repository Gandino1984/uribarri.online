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
    },
    // UPDATE: Added delivery service field
    has_delivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    // UPDATE: Added days of the week fields
    open_monday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    open_tuesday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    open_wednesday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    open_thursday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    open_friday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    open_saturday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    open_sunday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default shop_model;