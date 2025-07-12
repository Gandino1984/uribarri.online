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
    //update: Changed from type_shop string to id_type foreign key
    id_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    //update: Changed from subtype_shop string to id_subtype foreign key
    id_subtype: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
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
    has_delivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
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