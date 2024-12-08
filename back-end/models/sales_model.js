import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

// table for the use of seller type clients
const sales_model = sequelize.define("sales", {
    id_sales: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },

    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_user: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    // sale_date: {
    //     type: DataTypes.DATE,
    //     allowNull: false
    // }
}, {
    timestamps: true,
    freezeTableName: true
});

export default sales_model;