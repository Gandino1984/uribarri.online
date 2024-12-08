import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";


const inventory_model = sequelize.define("inventory", {
    id_inventory: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_provider: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
}, {
    timestamps : true,
    freezeTableName: true
});

export default inventory_model;