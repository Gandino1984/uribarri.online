import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

// table for the use of user type clients
const orders_model = sequelize.define("orders", {
    id_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
    freezeTableName: true
});

export default orders_model;